<!-- 每个回话对应的聊天内容 -->
<script setup lang="ts">
import type { AnyObject } from 'typescript-api-pro';
import type { BubbleProps } from 'vue-element-plus-x/types/Bubble';
import type { BubbleListInstance } from 'vue-element-plus-x/types/BubbleList';
import type { ThinkingStatus } from 'vue-element-plus-x/types/Thinking';
import type { ToolCallInfo } from './types';
import type { SendDTO } from '@/api/chat/types';
import { useHookFetch } from 'hook-fetch/vue';
import { nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { send } from '@/api';
import ChatSender from '@/components/ChatSender/index.vue';
import { useAgentStore } from '@/stores/modules/agent';
import { useChatStore } from '@/stores/modules/chat';
import { useModelStore } from '@/stores/modules/model';
import { useUserStore } from '@/stores/modules/user';
import { codeXRender } from '@/utils/markdownRenderers';
import { buildWorkflowInputs, workflowFinalText } from '@/utils/workflow';
import ChatMessageImage from './components/ChatMessageImage.vue';
import ToolCallCard from './components/ToolCallCard.vue';
import WorkflowRunStatus from './components/WorkflowRunStatus.vue';
import { createStreamTextBatch } from './stream-text-batch';

type MessageItem = BubbleProps & {
  key: number | string;
  id?: number | string;
  hasImage?: boolean;
  imageFile?: File;
  role: 'ai' | 'user' | 'system';
  thinkingStatus?: ThinkingStatus;
  thinlCollapse?: boolean;
  reasoning_content?: string;
  class?: string;
  workflowRun?: { title: string; status: 'running' | 'success' | 'error' | 'stopped'; nodes: number };
};

const route = useRoute();
const chatStore = useChatStore();
const modelStore = useModelStore();
const agentStore = useAgentStore();
const userStore = useUserStore();

// 用户头像
const avatar = computed(() => {
  const userInfo = userStore.userInfo;
  return userInfo?.avatar || 'https://avatars.githubusercontent.com/u/32251822?s=96&v=4';
});

const inputValue = ref('');
const chatSenderRef = ref<InstanceType<typeof ChatSender> | null>(null);
const bubbleItems = ref<MessageItem[]>([]);
const bubbleListRef = ref<BubbleListInstance | null>(null);

// 独立的工具调用事件列表
const toolCallEvents = ref<ToolCallInfo[]>([]);
// 工具调用事件计数器（用于生成唯一 key）
let toolCallKeyCounter = 0;

// 当前是否选中工作流（全局，与智能体互斥）
const currentBinding = computed(() => chatStore.currentWorkflow);

// 是否有工具调用事件
const hasToolCallEvents = computed(() => toolCallEvents.value.length > 0);

const copyIconMap = ref<Record<string, string>>({});
const editingMessageKeys = ref<MessageItem['key'][]>([]);
const editedContents = ref<Record<string, string>>({});
const isSending = ref(false);
let sendVersion = 0;
let flushStreamText: (() => void) | undefined;

const { stream, cancel } = useHookFetch({
  request: send,
  onError: (err) => {
    console.warn('测试错误拦截', err);
  },
});

// 组件挂载初始化
onMounted(() => {
  bubbleItems.value.forEach((item) => {
    copyIconMap.value[item.key] = 'CopyDocument';
  });
});

// 记录进入思考中
let isThinking = false;

watch(
  () => route.params.id,
  async (newId) => {
    if (isSending.value)
      cancelSSE();
    const historyVersion = sendVersion;
    toolCallEvents.value = [];
    toolCallKeyCounter = 0;
    editingMessageKeys.value = [];
    editedContents.value = {};
    bubbleItems.value = [];

    if (!newId || newId === 'not_login')
      return;

    const sessionId = String(newId);
    const pending = chatStore.takeMessage(sessionId);
    if (pending) {
      void startSSE(pending.content, pending.image);
      return;
    }

    if (!chatStore.chatMap[sessionId])
      await chatStore.requestChatList(sessionId);
    if (route.params.id === newId && sendVersion === historyVersion) {
      bubbleItems.value = [...(chatStore.chatMap[sessionId] || [])] as MessageItem[];
      await nextTick();
      bubbleListRef.value?.scrollToBottom();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (isSending.value)
    cancelSSE();
});

function readImageBase64(image: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(image);
  });
}

async function startSSE(chatContent: string, image?: File) {
  if (!userStore.token) {
    userStore.ensureLogin('/chat', '登录后即可继续当前对话');
    return;
  }
  if (isSending.value || (!chatContent.trim() && !image))
    return;

  const sessionId = route.params.id !== 'not_login' ? String(route.params.id) : undefined;
  const workflow = currentBinding.value;
  const version = ++sendVersion;
  isSending.value = true;
  toolCallEvents.value = [];
  toolCallKeyCounter = 0;
  inputValue.value = '';
  addMessage(chatContent, true, image);
  addMessage('', false);
  const assistant = bubbleItems.value[bubbleItems.value.length - 1];
  const textBatch = createStreamTextBatch((content, reasoning) => {
    if (reasoning)
      assistant.reasoning_content += reasoning;
    if (content) {
      assistant.content += content;
      assistant.loading = false;
    }
  });
  flushStreamText = textBatch.flush;
  if (workflow)
    assistant.workflowRun = { title: workflow.title, status: 'running', nodes: 0 };

  void nextTick(() => bubbleListRef.value?.scrollToBottom());
  const payload: SendDTO = {
    model: modelStore.currentModelInfo.modelName ?? '',
    agentId: workflow ? undefined : agentStore.currentAgentInfo?.id || undefined,
    content: chatContent,
    sessionId,
  };

  try {
    if (workflow) {
      payload.enableWorkFlow = true;
      payload.workFlowRunner = {
        uuid: workflow.uuid,
        inputs: buildWorkflowInputs(workflow, chatContent),
      };
    }
    if (image)
      payload.image = { dataBase64: await readImageBase64(image) };
    if (version !== sendVersion)
      return;

    for await (const chunk of stream(payload)) {
      if (version !== sendVersion || handleDataChunk(chunk.result as AnyObject | string, assistant, textBatch))
        break;
    }
  }
  catch (err) {
    if (version === sendVersion) {
      textBatch.flush();
      console.error('Chat send failed:', err);
      if (!assistant.content)
        assistant.content = '发送失败，请重试。';
    }
  }
  finally {
    if (sessionId)
      chatStore.invalidateChat(sessionId);
    if (version === sendVersion) {
      textBatch.flush();
      flushStreamText = undefined;
      isSending.value = false;
      if (assistant.workflowRun?.status === 'running') {
        assistant.workflowRun.status = 'error';
        assistant.content += '\n\n> 连接已结束，但未收到流程完成事件，请在管理端确认执行结果。';
      }
      finishAssistant(assistant);
    }
  }
}

type StreamTextBatch = ReturnType<typeof createStreamTextBatch>;

function handleDataChunk(chunk: AnyObject | string, assistant: MessageItem, textBatch: StreamTextBatch): boolean {
  try {
    let dataObj: AnyObject | null = null;
    let eventType = '';
    let rawDataStr = '';

    if (typeof chunk === 'string') {
      if (chunk === ':connected' || chunk === ':disconnected') {
        console.log('[SSE] 连接状态:', chunk);
        return false;
      }

      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.substring(6).trim();
        }
        else if (line.startsWith('data:')) {
          rawDataStr = line.substring(5).trim();
          try {
            dataObj = JSON.parse(rawDataStr);
          }
          catch {
            console.warn('[SSE] JSON 解析失败:', rawDataStr);
          }
        }
      }

      // 工作流事件优先处理（事件名带方括号，如 [NODE_CHUNK_*] / [START] / [DONE]）
      if (eventType.startsWith('[')) {
        return handleWorkflowEvent(eventType, rawDataStr, dataObj, assistant, textBatch);
      }

      if (eventType === 'error') {
        textBatch.flush();
        const message = dataObj?.error || dataObj?.message || '回答失败，请重试。';
        assistant.content = assistant.content ? `${assistant.content}\n\n${message}` : message;
        return true;
      }

      if (eventType === 'done' || dataObj?.done === true) {
        console.log('[SSE] 流结束');
        return true;
      }

      if (eventType === 'mcp' && dataObj) {
        handleMcpEvent(dataObj);
        return false;
      }

      if (dataObj && eventType === 'content') {
        if (dataObj.reasoning_content)
          appendReasoning(dataObj.reasoning_content, assistant, textBatch);
        if (dataObj.content)
          handleContentChunk(dataObj.content, assistant, textBatch);
      }
    }
    else if (typeof chunk === 'object' && chunk !== null) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.reasoning_content)
        appendReasoning(delta.reasoning_content, assistant, textBatch);
      if (delta?.content)
        handleContentChunk(delta.content, assistant, textBatch);
      if (chunk.content)
        handleContentChunk(chunk.content, assistant, textBatch);
    }
  }
  catch (err) {
    console.error('解析数据时出错:', err);
  }

  return false;
}

/**
 * 工作流 SSE 事件分发。事件名带方括号，来自后端 WorkflowEngine / AdiConstant.SSEEventName：
 * [START] / [DONE] / [ERROR] / [NODE_RUN_<uuid>] / [NODE_INPUT_<uuid>]
 * / [NODE_OUTPUT_<uuid>] / [NODE_CHUNK_<uuid>]
 * 返回 true 表示流结束。
 */
function handleWorkflowEvent(
  eventName: string,
  rawData: string,
  dataObj: AnyObject | null,
  assistant: MessageItem,
  textBatch: StreamTextBatch,
): boolean {
  // [START] 工作流已启动
  if (eventName === '[START]') {
    return false;
  }

  if (eventName === '[DONE]') {
    textBatch.flush();
    const output = workflowFinalText(dataObj);
    if (output !== null)
      assistant.content = output || '流程已完成，结束节点未返回内容。';
    if (assistant.workflowRun)
      assistant.workflowRun.status = 'success';
    return true;
  }

  if (eventName === '[ERROR]') {
    textBatch.flush();
    const errMsg = (dataObj?.msg as string) || rawData || '工作流执行失败';
    assistant.loading = false;
    if (assistant.workflowRun)
      assistant.workflowRun.status = 'error';
    assistant.content += `\n\n> ${errMsg}`;
    ElMessage.error(errMsg);
    return true;
  }

  // 节点运行状态不在对话区单独展示，仅保留最终流式回答。
  if (eventName.startsWith('[NODE_RUN_')) {
    const run = assistant.workflowRun;
    if (run)
      run.nodes++;
    return false;
  }

  // [NODE_CHUNK_<uuid>] LLM 流式文本块：追加到当前 assistant 气泡
  if (eventName.startsWith('[NODE_CHUNK_')) {
    if (rawData) {
      // 去掉后端可能加的多行分隔标记
      const text = rawData.replace(/-_wrap_-/g, '\n');
      handleContentChunk(text, assistant, textBatch);
    }
    return false;
  }

  // 节点输入属于流程内部明细，对话模式下不弹出节点卡片。
  if (eventName.startsWith('[NODE_INPUT_')) {
    return false;
  }

  // 节点输出属于流程内部明细，对话模式下不弹出节点卡片。
  if (eventName.startsWith('[NODE_OUTPUT_')) {
    return false;
  }

  // 其它未知带方括号事件忽略
  return false;
}

function handleMcpEvent(dataObj: AnyObject) {
  console.log('[SSE] MCP 事件:', dataObj);

  try {
    const content = typeof dataObj.content === 'string'
      ? JSON.parse(dataObj.content)
      : dataObj.content;

    const toolName = content.name || 'Unknown Tool';
    const toolStatus = content.status || 'pending';
    const toolResult = content.result || null;

    if (toolStatus === 'pending') {
      const toolInfo: ToolCallInfo = {
        key: ++toolCallKeyCounter,
        name: toolName,
        status: 'pending',
        result: null,
        timestamp: Date.now(),
      };
      toolCallEvents.value = [...toolCallEvents.value, toolInfo];
    }
    else {
      const index = toolCallEvents.value.findIndex(
        t => t.name === toolName && t.status === 'pending',
      );
      if (index >= 0) {
        const updatedEvents = [...toolCallEvents.value];
        updatedEvents[index] = {
          ...updatedEvents[index],
          status: toolStatus,
          result: toolResult,
          timestamp: Date.now(),
        };
        toolCallEvents.value = updatedEvents;
      }
      else {
        const toolInfo: ToolCallInfo = {
          key: ++toolCallKeyCounter,
          name: toolName,
          status: toolStatus,
          result: toolResult,
          timestamp: Date.now(),
        };
        toolCallEvents.value = [...toolCallEvents.value, toolInfo];
      }
    }

    console.log('[SSE] 工具调用列表:', toolCallEvents.value);
  }
  catch (err) {
    console.error('[SSE] MCP 事件解析失败:', err);
  }
}

function beginThinking(assistant: MessageItem) {
  if (assistant.thinkingStatus === 'start')
    assistant.thinlCollapse = true;
  assistant.thinkingStatus = 'thinking';
}

function appendReasoning(text: string, assistant: MessageItem, textBatch: StreamTextBatch) {
  beginThinking(assistant);
  textBatch.append(text, true);
}

function handleContentChunk(content: string, assistant: MessageItem, textBatch: StreamTextBatch) {
  let currentText = content;

  if (!isThinking && currentText.includes('<think')) {
    const thinkIdx = currentText.indexOf('<think');
    textBatch.append(currentText.slice(0, thinkIdx));
    currentText = currentText.slice(thinkIdx + 7);
    isThinking = true;
    beginThinking(assistant);
  }

  if (isThinking && currentText.includes('</think')) {
    const thinkEndIdx = currentText.indexOf('</think');
    textBatch.append(currentText.slice(0, thinkEndIdx), true);
    currentText = currentText.slice(thinkEndIdx + 8);
    isThinking = false;
    assistant.thinkingStatus = 'end';
  }

  if (currentText) {
    if (!isThinking && assistant.thinkingStatus === 'thinking')
      assistant.thinkingStatus = 'end';
    textBatch.append(currentText, isThinking);
  }
}

function finishAssistant(assistant: MessageItem) {
  assistant.loading = false;
  assistant.typing = false;
  if (assistant.thinkingStatus === 'thinking')
    assistant.thinkingStatus = 'end';
  isThinking = false;
}

function cancelSSE() {
  flushStreamText?.();
  flushStreamText = undefined;
  ++sendVersion;
  isSending.value = false;
  cancel();
  const assistant = bubbleItems.value[bubbleItems.value.length - 1];
  if (assistant?.workflowRun)
    assistant.workflowRun.status = 'stopped';
  if (assistant)
    finishAssistant(assistant);
}

function copyToClipboard(text: string, key: MessageItem['key']) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      copyIconMap.value[key] = 'Check';
      setTimeout(() => {
        copyIconMap.value[key] = 'CopyDocument';
      }, 2000);
    })
    .catch((err) => {
      console.error('复制失败:', err);
      ElMessage.error('复制失败，请手动复制');
    });
}

function addMessage(message: string, isUser: boolean, imageFile?: File) {
  const obj: MessageItem = {
    key: `local-${bubbleItems.value.length}`,
    imageFile,
    avatar: isUser ? avatar.value : undefined,
    avatarSize: isUser ? '32px' : undefined,
    role: isUser ? 'user' : 'system',
    placement: isUser ? 'end' : 'start',
    isMarkdown: !isUser,
    loading: !isUser,
    content: message || '',
    reasoning_content: '',
    thinkingStatus: 'start',
    thinlCollapse: false,
    noStyle: !isUser,
  };
  bubbleItems.value.push(obj);
}

function startEditing(item: MessageItem) {
  if (!editingMessageKeys.value.includes(item.key)) {
    editingMessageKeys.value.push(item.key);
    editedContents.value[item.key] = item.content || '';
  }
  item.noStyle = true;
  item.class = 'editing-bubble';
}

function cancelEditingByKey(key: MessageItem['key']) {
  const item = bubbleItems.value.find(i => i.key === key);
  if (item) {
    item.noStyle = false;
    item.class = '';
  }
  editingMessageKeys.value = editingMessageKeys.value.filter(k => k !== key);
  delete editedContents.value[key];
}

function sendMessageByKey(key: MessageItem['key']) {
  const newContent = editedContents.value[key];
  if (newContent) {
    const item = bubbleItems.value.find(message => message.key === key);
    void startSSE(newContent, item?.imageFile);
    cancelEditingByKey(key);
  }
}
</script>

<template>
  <div class="chat-with-id-container">
    <div class="chat-warp" :class="{ streaming: isSending }">
      <!-- 工具调用事件区域 -->
      <Transition name="tool-events-fade">
        <div v-if="hasToolCallEvents" class="tool-events-wrapper">
          <ToolCallCard
            v-for="tool in toolCallEvents"
            :key="tool.key"
            :tool-info="tool"
          />
        </div>
      </Transition>

      <BubbleList ref="bubbleListRef" :list="bubbleItems" max-height="calc(100vh - 240px)">
        <template #header="{ item }">
          <WorkflowRunStatus v-if="item.workflowRun" :title="item.workflowRun.title" :status="item.workflowRun.status" :nodes="item.workflowRun.nodes" />
          <Thinking
            v-if="item.reasoning_content"
            :model-value="item.thinlCollapse"
            :content="item.reasoning_content"
            :status="item.thinkingStatus"
            class="thinking-chain-warp"
            @update:expanded="item.thinlCollapse = $event"
          />
        </template>

        <template #content="{ item }">
          <XMarkdown
            v-if="item.content && item.role === 'system'"
            :markdown="item.content"
            :code-x-render="codeXRender"
            class="markdown-body"
            :themes="{ light: 'github-light', dark: 'github-dark' }"
            default-theme-mode="dark"
          />
          <div v-if="item.role === 'user' && (item.content || item.imageFile || item.hasImage)" class="userContent">
            <div class="user-bubble" :class="{ editing: editingMessageKeys.includes(item.key) }">
              <ChatMessageImage
                v-if="item.imageFile || item.hasImage"
                :file="item.imageFile"
                :message-id="item.id"
                :has-image="item.hasImage"
              />
              <template v-if="!editingMessageKeys.includes(item.key)">
                <div v-if="item.content" class="user-content">
                  {{ item.content }}
                </div>
              </template>

              <template v-else>
                <div class="edit-card">
                  <el-input
                    v-model="editedContents[item.key]"
                    type="textarea"
                    autosize
                    class="edit-input"
                  />
                  <div class="edit-actions">
                    <el-button size="small" @click="cancelEditingByKey(item.key)">
                      取消
                    </el-button>
                    <el-button type="primary" size="small" @click="sendMessageByKey(item.key)">
                      发送
                    </el-button>
                  </div>
                </div>
              </template>
            </div>

            <div v-if="item.content && !editingMessageKeys.includes(item.key)" class="copy-button-container">
              <el-tooltip content="复制" placement="bottom">
                <el-button
                  class="copy-btn"
                  :icon="copyIconMap[item.key] || 'CopyDocument'"
                  size="small"
                  @click="copyToClipboard(item.content, item.key)"
                />
              </el-tooltip>
              <el-tooltip content="编辑" placement="bottom">
                <el-button class="copy-btn" icon="Edit" size="small" @click="startEditing(item)" />
              </el-tooltip>
            </div>
          </div>
        </template>
      </BubbleList>

      <div class="sender-wrapper">
        <ChatSender
          ref="chatSenderRef"
          v-model="inputValue"
          :loading="isSending"
          @submit="startSSE"
          @cancel="cancelSSE"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.user-bubble.editing {
  background: transparent !important;
  padding: 0;
}

:deep(.editing-bubble.el-bubble) {
  display: flex !important;
  width: 100% !important;
  justify-content: flex-start !important;
}

:deep(.editing-bubble .el-bubble__content) {
  flex: 1 !important;
  max-width: none !important;
  width: 100% !important;
}

.edit-card {
  width: 500px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 16px;
  padding: 12px;
  background: #ffffff;
  transition: all 0.2s ease;
}

.edit-input :deep(.el-textarea__inner) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  resize: none;
  padding: 0;
  font-size: 14px;
}

.edit-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.copy-button-container {
  position: absolute;
  bottom: -28px;
  right: -10px;
  transform: translateY(10px);
  transition: all 0.3s ease;
  pointer-events: none;
  display: flex;
  justify-content: flex-end;

  .copy-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    font-size: 16px;
    cursor: pointer;
    pointer-events: auto;
    border: none !important;
    color: #91949a;
    :deep(svg) {
      stroke-width: 3 !important;
    }

    &:hover {
      border-radius: 50%;
      transition: background-color 0.2s;
      background-color: #f1efef;
    }
  }
}

.chat-with-id-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  height: 100%;

  .chat-warp {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: calc(100vh - 60px);

    &.streaming :deep(.el-bubble-list) {
      scroll-behavior: auto;
    }

    .thinking-chain-warp {
      margin-bottom: 12px;
    }

    .tool-events-wrapper {
      padding: 12px;
    }

    .tool-events-fade-enter-active,
    .tool-events-fade-leave-active {
      transition: all 0.3s ease;
    }

    .tool-events-fade-enter-from,
    .tool-events-fade-leave-to {
      opacity: 0;
      transform: translateY(-10px);
    }

    .sender-wrapper {
      position: relative;
      width: 100%;
      margin-bottom: 22px;
    }
  }

  :deep() {
    .el-bubble-list {
      padding-top: 24px;
    }
    .el-bubble {
      padding: 0 12px;
      padding-bottom: 24px;
    }
    .el-typewriter {
      overflow: hidden;
      border-radius: 12px;
    }
    .user-content {
      white-space: pre-wrap;
    }
    .markdown-body {
      background-color: transparent;
      width: auto;
      max-width: none;
      overflow: visible;
    }
    .markdown-elxLanguage-header-div {
      top: -25px !important;
    }
    .elx-xmarkdown-container {
      padding: 8px 4px;
      width: 100%;
      overflow: visible;
    }
  }
}
</style>

<!-- 每个回话对应的聊天内容 -->
<script setup lang="ts">
import type { AnyObject } from 'typescript-api-pro';
import type { BubbleProps } from 'vue-element-plus-x/types/Bubble';
import type { BubbleListInstance } from 'vue-element-plus-x/types/BubbleList';
import type { ThinkingStatus } from 'vue-element-plus-x/types/Thinking';
import type { ToolCallInfo } from './types';
import type { SendDTO, WfNodeInput, WfNodeInputDef } from '@/api/chat/types';
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
import ToolCallCard from './components/ToolCallCard.vue';

type MessageItem = BubbleProps & {
  key: number;
  role: 'ai' | 'user' | 'system';
  avatar: string;
  thinkingStatus?: ThinkingStatus;
  thinlCollapse?: boolean;
  reasoning_content?: string;
  class?: string;
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

const copyIconMap = ref<Record<number, string>>({}); // 记录每条消息的复制按钮图标
const editingMessageKeys = ref<number[]>([]); // 跟踪多个编辑中的消息
const editedContents = ref<Record<number, string>>({}); // 存储每条消息的临时编辑内容

const {
  stream,
  loading: isLoading,
  cancel,
} = useHookFetch({
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
  () => route.params?.id,
  async (_id_) => {
    if (_id_) {
      // 切换会话时清空工具调用事件与工作流运行状态
      toolCallEvents.value = [];
      toolCallKeyCounter = 0;

      if (_id_ !== 'not_login') {
        // 判断的当前会话id是否有聊天记录，有缓存则直接赋值展示
        if (chatStore.chatMap[`${_id_}`] && chatStore.chatMap[`${_id_}`].length) {
          bubbleItems.value = chatStore.chatMap[`${_id_}`] as MessageItem[];
          // 滚动到底部
          setTimeout(() => {
            bubbleListRef.value?.scrollToBottom();
          }, 350);
          return;
        }

        // 无缓存则请求聊天记录
        await chatStore.requestChatList(`${_id_}`);
        // 请求聊天记录后，赋值回显，并滚动到底部
        bubbleItems.value = chatStore.chatMap[`${_id_}`] as MessageItem[];

        // 滚动到底部
        setTimeout(() => {
          bubbleListRef.value?.scrollToBottom();
        }, 350);
      }

      // 如果本地有发送内容 ，则直接发送
      const v = localStorage.getItem('chatContent');
      if (v) {
        // 发送消息
        setTimeout(() => {
          startSSE(v);
        }, 350);

        localStorage.removeItem('chatContent');
      }
    }
  },
  { immediate: true, deep: true },
);

// 封装错误处理逻辑
function handleError(err: any) {
  console.error('Fetch error:', err);
}

async function startSSE(chatContent: string) {
  if (!userStore.token) {
    userStore.ensureLogin('/chat', '登录后即可继续当前对话');
    return;
  }

  try {
    // 清空上一次的工具调用事件
    toolCallEvents.value = [];
    toolCallKeyCounter = 0;
    // 添加用户输入的消息
    inputValue.value = '';
    addMessage(chatContent, true);
    addMessage('', false);

    // 这里有必要调用一下 BubbleList 组件的滚动到底部 手动触发 自动滚动
    bubbleListRef.value?.scrollToBottom();

    // 获取最后一条用户消息（后端做了长期记忆缓存，只需发送最新的用户消息）
    const lastUserMessage = bubbleItems.value.filter((item: any) => item.role === 'user').pop();

    // 标记是否收到第一个有效数据 chunk（用于清除 loading 状态）
    let hasReceivedFirstContent = false;

    // 构造发送请求体
    const payload: SendDTO = {
      model: modelStore.currentModelInfo.modelName ?? '',
      agentId: agentStore.currentAgentInfo?.id || undefined,
      content: lastUserMessage?.content ?? '',
      sessionId: route.params?.id !== 'not_login' ? String(route.params?.id) : undefined,
    };

    // 绑定了工作流：仅发送工作流参数，三种对话模式保持互斥
    if (currentBinding.value) {
      payload.agentId = undefined;
      payload.enableWorkFlow = true;
      payload.workFlowRunner = {
        uuid: currentBinding.value.uuid,
        inputs: buildWorkflowInputs(currentBinding.value, chatContent),
      };
    }

    for await (const chunk of stream(payload)) {
      // 处理数据块 - chunk.result 可能是字符串或对象
      // 返回 true 表示流结束
      const isStreamEnd = handleDataChunk(chunk.result as AnyObject | string);

      // 在收到第一个有效数据后清除 loading 状态（跳过连接状态事件）
      if (!hasReceivedFirstContent && chunk.result !== ':connected' && chunk.result !== ':disconnected' && !isStreamEnd) {
        const lastMessage = bubbleItems.value[bubbleItems.value.length - 1];
        if (lastMessage) {
          lastMessage.loading = false;
          bubbleItems.value = [...bubbleItems.value];
        }
        hasReceivedFirstContent = true;
      }

      if (isStreamEnd) {
        break; // 提前结束流处理
      }
      // 等待 Vue 更新 DOM，实现真正的流式渲染
      await nextTick();
    }
  }
  catch (err) {
    handleError(err);
    // 出错时也要清除 loading 状态
    if (bubbleItems.value.length) {
      const lastMessage = bubbleItems.value[bubbleItems.value.length - 1];
      lastMessage.loading = false;
      bubbleItems.value = [...bubbleItems.value];
    }
  }
  finally {
    // 停止打字器状态
    if (bubbleItems.value.length) {
      const lastMessage = bubbleItems.value[bubbleItems.value.length - 1];
      lastMessage.typing = false;
      // 无条件重置 loading（停止打字动画）
      lastMessage.loading = false;
      // 重置思考状态：如果还在思考中，标记为已完成
      if (lastMessage.thinkingStatus === 'thinking') {
        lastMessage.thinkingStatus = 'end';
      }
      // 重置isThinking标志
      isThinking = false;
      bubbleItems.value = [...bubbleItems.value];
    }
  }
}

/**
 * 根据工作流绑定的 start 节点输入定义构造运行输入。
 * 约定：把本轮聊天内容填进第一个文本输入(type===1)；其它输入沿用绑定里预填的值。
 */
function buildWorkflowInputs(
  binding: { startInputs: WfNodeInputDef[]; inputs: WfNodeInput[] },
  chatContent: string,
): WfNodeInput[] {
  const base
    = binding.inputs && binding.inputs.length
      ? binding.inputs.map(i => ({ ...i, content: { ...i.content } }))
      : defaultInputsFromDefs(binding.startInputs);
  const textInput = base.find(i => i.content.type === 1);
  if (textInput) {
    textInput.content.value = chatContent;
  }
  return base;
}

function defaultInputsFromDefs(defs: WfNodeInputDef[]): WfNodeInput[] {
  return (defs || []).map(d => ({
    uuid: d.uuid,
    name: d.name,
    content: { title: d.title, value: null, type: d.type },
    required: d.required,
  }));
}

// 封装数据处理逻辑
function handleDataChunk(chunk: AnyObject | string): boolean {
  console.log('[SSE] 收到 chunk:', chunk, 'type:', typeof chunk);

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
        return handleWorkflowEvent(eventType, rawDataStr, dataObj);
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
        const content = dataObj.content || '';
        if (content) {
          handleContentChunk(content);
        }
        const reasoningContent = dataObj.reasoning_content || '';
        if (reasoningContent) {
          const lastMessage = bubbleItems.value[bubbleItems.value.length - 1];
          if (lastMessage) {
            lastMessage.thinkingStatus = 'thinking';
            lastMessage.loading = true;
            lastMessage.thinlCollapse = true;
            lastMessage.reasoning_content += reasoningContent;
            bubbleItems.value = [...bubbleItems.value];
          }
        }
      }
    }
    else if (typeof chunk === 'object' && chunk !== null) {
      const reasoningChunk = chunk?.choices?.[0]?.delta?.reasoning_content;
      if (reasoningChunk) {
        const lastMessage = bubbleItems.value[bubbleItems.value.length - 1];
        if (lastMessage) {
          lastMessage.thinkingStatus = 'thinking';
          lastMessage.loading = true;
          lastMessage.thinlCollapse = true;
          lastMessage.reasoning_content += reasoningChunk;
          bubbleItems.value = [...bubbleItems.value];
        }
      }

      const parsedChunk = chunk?.choices?.[0]?.delta?.content;
      if (parsedChunk) {
        handleContentChunk(parsedChunk);
      }

      const directContent = chunk?.content;
      if (directContent) {
        handleContentChunk(directContent);
      }
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
): boolean {
  // [START] 工作流已启动
  if (eventName === '[START]') {
    return false;
  }

  // [DONE] 流结束
  if (eventName === '[DONE]') {
    console.log('[SSE] 工作流流结束');
    return true;
  }

  // [ERROR]
  if (eventName === '[ERROR]') {
    const errMsg = (dataObj?.msg as string) || rawData || '工作流执行失败';
    const lastMessage = bubbleItems.value[bubbleItems.value.length - 1];
    if (lastMessage) {
      lastMessage.loading = false;
      lastMessage.content += `\n\n> ❌ ${errMsg}`;
      bubbleItems.value = [...bubbleItems.value];
    }
    ElMessage.error(errMsg);
    return true;
  }

  // 节点运行状态不在对话区单独展示，仅保留最终流式回答。
  if (eventName.startsWith('[NODE_RUN_')) {
    return false;
  }

  // [NODE_CHUNK_<uuid>] LLM 流式文本块：追加到当前 assistant 气泡
  if (eventName.startsWith('[NODE_CHUNK_')) {
    if (rawData) {
      // 去掉后端可能加的多行分隔标记
      const text = rawData.replace(/-_wrap_-/g, '\n');
      handleContentChunk(text);
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

function handleContentChunk(content: string) {
  const lastIndex = bubbleItems.value.length - 1;
  const lastMessage = bubbleItems.value[lastIndex];
  if (!lastMessage) {
    return;
  }

  let currentText = content;

  if (!isThinking && currentText.includes('<think')) {
    const thinkIdx = currentText.indexOf('<think');
    if (thinkIdx > 0) {
      const beforeThink = currentText.substring(0, thinkIdx);
      lastMessage.content += beforeThink;
    }
    currentText = currentText.substring(thinkIdx + 7);
    isThinking = true;
    lastMessage.thinkingStatus = 'thinking';
    lastMessage.loading = true;
    lastMessage.thinlCollapse = true;
  }

  if (isThinking && currentText.includes('</think')) {
    const thinkEndIdx = currentText.indexOf('</think');
    if (thinkEndIdx > 0) {
      const thinkContent = currentText.substring(0, thinkEndIdx);
      lastMessage.reasoning_content += thinkContent;
    }
    currentText = currentText.substring(thinkEndIdx + 8);
    isThinking = false;
    lastMessage.thinkingStatus = 'end';
    lastMessage.loading = false;
  }

  if (currentText) {
    if (isThinking) {
      lastMessage.reasoning_content += currentText;
    }
    else {
      lastMessage.content += currentText;
    }
  }

  bubbleItems.value = [...bubbleItems.value];
  bubbleListRef.value?.scrollToBottom();
}

async function cancelSSE() {
  cancel();
  if (bubbleItems.value.length) {
    bubbleItems.value[bubbleItems.value.length - 1].typing = false;
  }
}

function copyToClipboard(text: string, key: number) {
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

function addMessage(message: string, isUser: boolean) {
  const i = bubbleItems.value.length;
  const obj: MessageItem = {
    key: i,
    avatar: isUser
      ? avatar.value
      : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '32px',
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

function handleChange(_payload: { value: boolean; status: ThinkingStatus }) {}

function startEditing(item: MessageItem) {
  if (!editingMessageKeys.value.includes(item.key)) {
    editingMessageKeys.value.push(item.key);
    editedContents.value[item.key] = item.content || '';
  }
  item.noStyle = true;
  item.class = 'editing-bubble';
}

function cancelEditingByKey(key: number) {
  const item = bubbleItems.value.find(i => i.key === key);
  if (item) {
    item.noStyle = false;
    item.class = '';
  }
  editingMessageKeys.value = editingMessageKeys.value.filter(k => k !== key);
  delete editedContents.value[key];
}

function sendMessageByKey(key: number) {
  const newContent = editedContents.value[key];
  if (newContent) {
    startSSE(newContent);
    cancelEditingByKey(key);
  }
}
</script>

<template>
  <div class="chat-with-id-container">
    <div class="chat-warp">
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
          <Thinking
            v-if="item.reasoning_content"
            v-model="item.thinlCollapse"
            :content="item.reasoning_content"
            :status="item.thinkingStatus"
            class="thinking-chain-warp"
            @change="handleChange"
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
          <div v-if="item.content && item.role === 'user'" class="userContent">
            <div class="user-bubble" :class="{ editing: editingMessageKeys.includes(item.key) }">
              <template v-if="!editingMessageKeys.includes(item.key)">
                <div class="user-content">
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

            <div v-if="!editingMessageKeys.includes(item.key)" class="copy-button-container">
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
          :loading="isLoading"
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

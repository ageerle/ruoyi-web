import type { ChatMessageVo, WfNodeInput, WfNodeInputDef } from '@/api/chat/types';
import { defineStore } from 'pinia';
import { getChatList } from '@/api';
import { useUserStore } from './user';

/**
 * 工作流与会话的绑定关系。按 sessionId 存，持久化到 localStorage。
 * - uuid: 工作流 uuid
 * - title: 工作流标题（顶栏展示用）
 * - startInputs: start 节点输入参数定义（来自 GET /workflow/{uuid}）
 * - inputs: 预填好的输入项（复杂输入表单提交后保存；单文本输入留空，每轮用聊天内容填充）
 */
export interface WorkflowBinding {
  uuid: string;
  title: string;
  startInputs: WfNodeInputDef[];
  inputs: WfNodeInput[];
}

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore();

  // 用户头像
  const avatar = computed(() => {
    const userInfo = userStore.userInfo;
    return userInfo?.avatar || 'https://avatars.githubusercontent.com/u/32251822?s=96&v=4';
  });

  // 是否开启深度思考
  const isDeepThinking = ref<boolean>(false);

  const setDeepThinking = (value: boolean) => {
    isDeepThinking.value = value;
  };

  // 知识库ID
  const knowledgeId = ref<string>('');

  const setKnowledgeId = (id: string) => {
    knowledgeId.value = id;
  };

  // 会议ID对应-聊天记录 map对象
  const chatMap = ref<Record<string, ChatMessageVo[]>>({});

  // 当前选中的工作流（全局，与智能体互斥；为 null 时走智能体对话）。
  // 应用市场选工作流后置入此值并回主页，提交时由 chatWithId 据此走 enableWorkFlow。
  const currentWorkflow = ref<WorkflowBinding | null>(null);

  const setCurrentWorkflow = (wf: WorkflowBinding | null) => {
    currentWorkflow.value = wf;
  };

  const clearCurrentWorkflow = () => {
    currentWorkflow.value = null;
  };

  const setChatMap = (id: string, data: ChatMessageVo[]) => {
    chatMap.value[id] = data?.map((item: ChatMessageVo) => {
      const isUser = item.role === 'user';
      const originalContent = item.content as string;

      const thinkContent = extractThkContent(originalContent);
      const afterThinkContent = extractThkContentAfter(originalContent);

      const result = {
        ...item,
        key: item.id,
        placement: isUser ? 'end' : 'start',
        isMarkdown: !isUser,
        role: isUser ? 'user' : 'system',
        avatar: isUser
          ? avatar
          : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        avatarSize: '32px',
        typing: false,
        reasoning_content: thinkContent,
        thinkingStatus: 'end',
        content: afterThinkContent,
        thinlCollapse: false,
        noStyle: !isUser,
      };

      return result;
    });
  };

  // 获取当前会话的聊天记录
  const requestChatList = async (sessionId: string) => {
    // 如果没有 token 则不查询聊天记录
    if (!userStore.token)
      return;
    try {
      const res = await getChatList({
        sessionId,
        userId: userStore.userInfo?.userId as number,
      });
      if (res.rows) {
        setChatMap(sessionId, res.rows);
      }
    }
    catch (error) {
      console.error('getChatList:', error);
    }
  };

  // 对思考中的内容回显做处理
  function extractThkContent(content: string) {
    const regex = /<think>(.*?)<\/think>/s;
    const matchResult = content.match(regex);
    return matchResult?.[1] ?? '';
  }

  // 如果有 </think> 标签，则把 </think> 之后的 内容从 content 中返回
  function extractThkContentAfter(content: string) {
    if (!content.includes('</think>')) {
      return content;
    }

    // 查找 </think> 的位置
    const thinkEndIdx = content.indexOf('</think>');
    if (thinkEndIdx === -1) {
      return content;
    }

    // 直接截取 </think> 之后的所有内容
    const afterThink = content.substring(thinkEndIdx + 8); // 8 是 '</think>' 的长度
    return afterThink;
  }

  return {
    chatMap,
    requestChatList,
    isDeepThinking,
    setDeepThinking,
    knowledgeId,
    setKnowledgeId,
    currentWorkflow,
    setCurrentWorkflow,
    clearCurrentWorkflow,
  };
});

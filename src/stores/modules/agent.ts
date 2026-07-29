import type { AgentVO } from '@/api/agent/types';
import { defineStore } from 'pinia';
import { getAgentList } from '@/api';
import { useUserStore } from './user';

// 智能体管理
export const useAgentStore = defineStore('agent', () => {
  // 当前智能体
  const currentAgentInfo = ref<AgentVO>({});

  // 设置当前智能体
  const setCurrentAgentInfo = (agentInfo: AgentVO) => {
    currentAgentInfo.value = agentInfo;
  };

  const clearCurrentAgentInfo = () => {
    currentAgentInfo.value = {};
  };

  // 智能体列表
  const agentList = ref<AgentVO[]>([]);
  // 请求智能体列表
  const requestAgentList = async () => {
    const userStore = useUserStore();
    if (!userStore.token) {
      return;
    }

    try {
      const res = await getAgentList();
      agentList.value = res.data;
    }
    catch (error) {
      console.error('requestAgentList错误', error);
    }
  };

  return {
    currentAgentInfo,
    setCurrentAgentInfo,
    clearCurrentAgentInfo,
    agentList,
    requestAgentList,
  };
});

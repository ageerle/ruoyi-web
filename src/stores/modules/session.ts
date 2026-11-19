import type { ChatSessionVo, CreateSessionDTO, GetSessionListParams } from '@/api/session/types';
import { ChatLineRound } from '@element-plus/icons-vue';
import { defineStore } from 'pinia';
import { markRaw } from 'vue';
import { useRouter } from 'vue-router';
import {
  create_session,
  delete_session,
  get_session_list,
  update_session,
} from '@/api';
import { useUserStore } from './user';

export const useSessionStore = defineStore('session', () => {
  const router = useRouter();
  const userStore = useUserStore();

  // 当前选中的会话信息
  const currentSession = ref<ChatSessionVo | null>(null);
  // 设置当前会话
  const setCurrentSession = (session: ChatSessionVo | null) => {
    currentSession.value = session;
  };

  // 会话列表核心状态
  const sessionList = ref<ChatSessionVo[]>([]); // 会话数据列表
  const currentPage = ref(1); // 当前页码（从1开始）
  const pageSize = ref(25); // 每页显示数量
  const hasMore = ref(true); // 是否还有更多数据
  const isLoading = ref(false); // 全局加载状态（初始加载/刷新）
  const isLoadingMore = ref(false); // 加载更多状态（区分初始加载）

  // 搜索相关状态
  const searchKeyword = ref(''); // 搜索关键词
  const isSearching = ref(false); // 是否正在搜索

  // 创建新对话（按钮点击）
  const createSessionBtn = async () => {
    try {
      // 清空当前选中会话信息
      setCurrentSession(null);
      router.replace({ name: 'chat' });
    }
    catch (error) {
      console.error('createSessionBtn错误:', error);
    }
  };

  // 获取会话列表（核心分页方法）
  const requestSessionList = async (page: number = currentPage.value, force: boolean = false) => {
    // 如果没有token就直接清空
    if (!userStore.token) {
      sessionList.value = [];
      return;
    }

    if (!force && ((page > 1 && !hasMore.value) || isLoading.value || isLoadingMore.value)) {
      console.log('[requestSessionList] 满足跳过条件，直接返回', {
        page,
        hasMore: hasMore.value,
        isLoading: isLoading.value,
        isLoadingMore: isLoadingMore.value,
      });
      return;
    }

    isLoading.value = page === 1; // 第一页时标记为全局加载
    isLoadingMore.value = page > 1; // 非第一页时标记为加载更多

    try {
      const params: GetSessionListParams = {
        userId: userStore.userInfo?.userId as number,
        pageNum: page,
        pageSize: pageSize.value,
        isAsc: 'desc',
        orderByColumn: 'createTime',
        // 搜索关键词
        sessionTitle: searchKeyword.value || undefined,
      };

      const resArr = await get_session_list(params);

      // 预处理会话分组 并添加前缀图标
      const res = processSessions(resArr.rows);

      const allSessions = new Map(sessionList.value.map(item => [item.id, item])); // 现有所有数据
      res.forEach(item => allSessions.set(item.id, { ...item })); // 更新/添加数据

      // 按服务端排序重建列表（假设分页数据是按时间倒序，第一页是最新，后续页依次递减）
      // 此处需根据接口返回的排序规则调整，假设每页数据是递增的（第一页最新，第二页次新，第三页 oldest）
      if (page === 1) {
        // 第一页是最新数据，应排在列表前面
        sessionList.value = [
          ...res, // 新的第一页数据（最新）
          ...Array.from(allSessions.values()).filter(item => !res.some(r => r.id === item.id)), // 保留未被第一页覆盖的旧数据
        ];
      }
      else {
        // 非第一页数据是更旧的数据，追加到列表末尾
        sessionList.value = [
          ...sessionList.value.filter(item => !res.some(r => r.id === item.id)), // 保留现有数据（除了被当前页更新的）
          ...res, // 追加当前页的新数据（更旧的）
        ];
      }

      // 判断是否还有更多数据（当前页数据量 < pageSize 则无更多）
      if (!force)
        hasMore.value = (res?.length || 0) === pageSize.value;
      if (!force)
        currentPage.value = page; // 仅非强制刷新时更新页码
    }
    catch (error) {
      console.error('[requestSessionList] 错误详情:', error);
    }
    finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  };

  // 创建后先进入会话，列表随后刷新。
  const createSessionList = async (data: Omit<CreateSessionDTO, 'id'>, beforeOpen: (id: string) => void) => {
    const startingRoute = router.currentRoute.value;
    if (!userStore.token || startingRoute.name !== 'chat')
      return false;

    try {
      const res = await create_session(data);
      if (!res.data || router.currentRoute.value !== startingRoute)
        return false;

      const id = String(res.data);
      beforeOpen(id);
      const failure = await router.replace({ name: 'chatWithId', params: { id } });
      if (failure)
        return false;

      setCurrentSession({ ...data, id });
      void requestSessionList(1, true);
      return true;
    }
    catch (error) {
      console.error('createSessionList错误:', error);
      return false;
    }
  };

  // 加载更多会话（供组件调用）
  const loadMoreSessions = async () => {
    if (hasMore.value)
      await requestSessionList(currentPage.value + 1);
  };

  // 搜索会话
  const searchSessions = async (keyword: string) => {
    searchKeyword.value = keyword;
    isSearching.value = !!keyword;
    // 重置分页状态
    currentPage.value = 1;
    hasMore.value = true;
    sessionList.value = [];
    // 重新请求
    await requestSessionList(1, true);
  };

  // 清除搜索
  const clearSearch = async () => {
    searchKeyword.value = '';
    isSearching.value = false;
    // 重置分页状态
    currentPage.value = 1;
    hasMore.value = true;
    sessionList.value = [];
    // 重新请求
    await requestSessionList(1, true);
  };

  // 更新会话（供组件调用）
  const updateSession = async (item: ChatSessionVo) => {
    try {
      await update_session(item);
      // 1. 先找到被修改会话在 sessionList 中的索引（假设 sessionList 是按服务端排序的完整列表）
      const targetIndex = sessionList.value.findIndex(session => session.id === item.id);
      // 2. 计算该会话所在的页码（页大小固定为 pageSize.value）
      const targetPage
        = targetIndex >= 0
          ? Math.floor(targetIndex / pageSize.value) + 1 // 索引从0开始，页码从1开始
          : 1; // 未找到时默认刷新第一页（可能因排序变化导致位置改变）
      // 3. 刷新目标页数据
      await requestSessionList(targetPage, true);
    }
    catch (error) {
      console.error('updateSession错误:', error);
    }
  };

  // 删除会话（供组件调用）
  const deleteSessions = async (ids: string[]) => {
    try {
      // 1. 先从本地列表中删除 (立即响应，不等待服务端)
      sessionList.value = sessionList.value.filter(
        session => !ids.includes(session.id!),
      );

      // 2. 调用删除接口
      await delete_session(ids);

      // 3. 重置分页状态，从头开始加载
      // 这确保整个列表与服务端数据一致
      currentPage.value = 1;
      hasMore.value = true;

      // 4. 异步刷新第1页数据进行同步
      // 不使用 await，避免阻塞 UI 响应
      setTimeout(() => {
        requestSessionList(1, true);
      }, 100);
    }
    catch (error) {
      console.error('deleteSessions错误:', error);
      // 如果删除失败，回滚本地删除的数据
      // 可通过 requestSessionList(currentPage.value, true) 重新加载
      await requestSessionList(currentPage.value, true);
    }
  };

  // 在获取会话列表后添加预处理逻辑（示例）
  function processSessions(sessions: ChatSessionVo[]) {
    return sessions.map((session) => {
      return {
        ...session,
        group: '最近对话', // 统一分组为"最近对话"
        prefixIcon: markRaw(ChatLineRound), // 图标为静态组件，使用 markRaw 标记为静态组件
      };
    });
  }

  return {
    // 当前选中的会话
    currentSession,
    // 设置当前会话
    setCurrentSession,
    // 列表状态
    sessionList,
    currentPage,
    pageSize,
    hasMore,
    isLoading,
    isLoadingMore,
    // 搜索状态
    searchKeyword,
    isSearching,
    // 列表方法
    createSessionBtn,
    createSessionList,
    requestSessionList,
    loadMoreSessions,
    updateSession,
    deleteSessions,
    // 搜索方法
    searchSessions,
    clearSearch,
  };
});

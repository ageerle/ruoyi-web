import { defineStore } from "pinia";
import {
	getAllData,
	setAllData,
	updateOne as updateOneDB,
  deleteOne as deleteOneDB,
	getMessagesBySessionId,

} from "@/utils/storage/DBIndex";
import { STORE_SESSION, STORE_MESSAGE, STORE_ACTIVE } from "@/utils/storage/DBIndex"
import {
	getSessionList,
	removeSession,
	changeSessionList,
	getMessageList,

} from "@/api/bot";

import { getUser } from "@/store/modules/auth/helper";
// gettUser
import { ref } from "vue";

export const useDataStore = defineStore("data", () => {
	const sessions = ref<any[]>([]);
	const messages = ref<any[]>([]);
  const active = ref<any>(null);


	const setSessions = (data: any[]) => {
    sessions.value = data;
  };

  const setMessages = (data: any[]) => {
    messages.value = data;
  };

  const setActive = async (session: any) => {
    active.value = session;
		const sessionId = session.id;


		// 1. 使用索引快速获取 message
		const localMessages = await getMessagesBySessionId(sessionId);
		console.log("getMessagesBySessionId=====localMessages",localMessages);
		setMessages(localMessages);
	
		// 2. 请求服务端最新数据
		const remoteRes: any = await getMessageList({ id: sessionId });
		console.log("remoteRes",remoteRes)
		if (remoteRes.code === 200 && remoteRes.rows) {
			const serverMessages = remoteRes.rows.map((msg: any) => ({
				...msg,
				sessionId, // 确保有 sessionId 字段
			}));
	
			if (JSON.stringify(serverMessages) !== JSON.stringify(localMessages)) {
				console.log("====localMessages",serverMessages)
				setMessages(serverMessages);
				await setAllData(STORE_MESSAGE, serverMessages);
			}
		}

  };

	const storeMap = {
		sessions,
		messages
	};
	const addItem = (store: 'sessions' | 'messages', item: any) => {
		// 判断是 sessions 还是 messages，然后执行 unshift 操作
		storeMap[store].value.unshift(item);
	};
	

	const updateItem = (store: 'sessions' | 'messages', updated: any) => {
		
		const idx = storeMap[store].value.findIndex((i) => i.id === updated.id);
		if (idx !== -1) storeMap[store].value[idx] = updated;
	};

	const deleteItem = (store: 'sessions' | 'messages',id: number|string) => {
		storeMap[store].value = storeMap[store].value.filter((i) => i.id !== id);
	};

	// const restoreItems = (backup: any[]) => {
	// 	items.value = backup;
	// };

	// 初始化（先本地再接口）
	const initializeData = async () => {
		const localData = await getAllData(STORE_SESSION);
		console.log("===>localData", localData);
		setSessions(localData);
		let userId = getUser()?.userId || null;
		const res: any = await getSessionList({ userId });
		console.log("===>res", res);
		if (res.code === 200) {
			const serverData = res.rows;
			for (const item of serverData) {
				if (item?.id != null) {
					item.title = item.sessionContent;
					item.uuid = item.id;
					item.isEdit = false;
				}
			}

			if (JSON.stringify(serverData) !== JSON.stringify(localData)) {
				setSessions(serverData);
				await setAllData(STORE_SESSION,serverData);
			}

			if (sessions.value.length) {
				const defaultActive = sessions.value[0];
				setActive(defaultActive);
				await setAllData(STORE_ACTIVE,defaultActive);
	
				// const localMessages = await getAllData(STORE_MESSAGE);
				// let currentMsgs :any=[]
				// if(localMessages.length>0){
				// 	 currentMsgs= localMessages.filter(m => m.sessionId === defaultActive.id);
				// 	setMessages(currentMsgs);
				// }
				
				// // const res: any =
				// const remoteMsgs:any= await getMessageList(defaultActive.id);
				// console.log('remoteMsgs',remoteMsgs)
				// console.log("===>res", res);
				// 		if (remoteMsgs.code === 200&&remoteMsgs.rows) {
				// 			const messageData = remoteMsgs.rows;
				// 			for (const messageItem of messageData) {
				// 				if (messageItem?.id != null) {
				// 					messageItem.seessid=defaultActive.id
				// 					// messageItem.uuid = item.userId;
									
				// 				}
				// 			}
				// 			if (JSON.stringify(messageData) !== JSON.stringify(currentMsgs)) {
				// 				setMessages(remoteMsgs);
				// 				await setAllData(STORE_MESSAGE, messageData);
				// 			}
				// 		}

				
			
			}
		}
	};



	
	// 修改
	const updateSession = async (item: any,callAPI:boolean) => {
		const backup = [...sessions.value];
    const index = sessions.value.findIndex(i => i.id === item.id);
		if (index !== -1) sessions.value[index] = item;

    if (callAPI) {
      const success = await changeSessionList(item);
      if (!success) {
        setSessions(backup);
      } else {
        await updateOneDB(STORE_SESSION, item);
      }
    } else {
      await updateOneDB(STORE_SESSION, item);
    }
	};
	// 删除
	const deleteSession = async (id: number | string) => {
		const backup = [...sessions.value];
		sessions.value = sessions.value.filter(i => i.id !== id);

		const success = await removeSession(id);
    if (!success) {
      setSessions(backup);
    } else {
      await deleteOneDB(STORE_SESSION, id);
    }
	};
	// 新增
	const addSession = async (item: any) => {
		sessions.value.unshift(item);
    // addItem(item);
    // const success = await addDataToServer(item);
    // if (success) {
			await updateOneDB(STORE_SESSION, item);

    // } else {
    //   // 可回滚，视需求而定
    //   await initializeData();
    // }
  };

	return {
		sessions,
    messages,
    active,
    setActive,
    initializeData,
    updateSession,
    deleteSession,
    addSession,
		// items,
		// initializeData,
		// updateItemAction,
		// deleteItemAction,
		// addItemAction
	};
});

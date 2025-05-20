import { defineStore } from "pinia";
import { defaultState, getLocalState, setLocalState } from "./helper";
import { router } from "@/router";
import { homeStore } from "@/store/homeStore";
import { getUser } from "@/store/modules/auth/helper";
import {
	getSessionList,
	removeSession,
	changeSessionList,
	getMessageList,
	createSession,
} from "@/api/bot";
export const useChatStore = defineStore("chat-store", {
	state: (): Chat.ChatState => getLocalState(),

	getters: {
		getChatHistoryByCurrentActive(state: Chat.ChatState) {
			const index = state.history.findIndex(
				(item) => item.uuid === state.active
			);
			if (index !== -1) return state.history[index];
			return null;
		},

		// getChatByUuid(state: Chat.ChatState) {
		// 	console.log("===>getChatByUuid", state);

		// 	return (uuid?: any) => {
		// 		if (uuid) {
		// 			return state.chat.find((item) => item.uuid == uuid)?.data ?? [];
		// 		}
		// 		return state.chat.find((item) => item.uuid == state.active)?.data ?? [];
		// 	};
		// },
	},

	actions: {

    async getChatByUuid(uuid?: string): Promise<Chat.Chat[]> {
      const currentUuid:any = uuid || this.active;
      const cached = this.chat.find((item) => item.uuid === currentUuid)?.data ?? [];
    
      if (cached.length > 0) {
        return cached;
      }
    
      // 缓存无数据，调用接口获取
      const remoteRes: any = await getMessageList({ id: currentUuid });
      if (remoteRes.code === 200 && remoteRes.rows) {
        const remoteList = remoteRes.rows;
        const newList: Chat.Chat[] = [];
    
        for (const newItem of remoteList) {
          if (newItem?.role != null) {
            newItem.dateTime = newItem.createTime;
            newItem.text = newItem.content;
            newItem.inversion = true;
            newItem.conversationOptions = null;
            newItem.error = false;
            newItem.requestOptions = {
              prompt: newItem.content,
              options: null,
            };
            if (newItem.role === 'assistant') {
              newItem.requestOptions.options = {};
              newItem.inversion = false;
            }
            newItem.model = newItem.modelName;
            newList.push(newItem);
          }
        }
    
        const chatIndex = this.chat.findIndex(item => item.uuid === currentUuid);
        if (chatIndex !== -1) {
          this.chat[chatIndex].data = [...this.chat[chatIndex].data, ...newList];
        } else {
          this.chat.push({ uuid: currentUuid, data: newList });
        }
    
        this.recordState();
        return newList;
      }
    
      return [];
    },
		//  async getChatByUuid(uuid:any){
		//     console.log("uuid",uuid)
		//     let chatList=[]
		//     if(uuid){
		//       chatList=   this.chat.find(item => item.uuid == uuid)?.data ?? []
		//     }else {
		//       chatList =this.chat.find(item => item.uuid == this.active)?.data ?? []
		//     }
		//     if(chatList.length) return chatList
		//     let newId=uuid||this.active
		//     const remoteRes: any = await getMessageList({ id:newId})

		//     if (remoteRes.code === 200 && remoteRes.rows) {

		//       console.log("========remoteRes",remoteRes)
		//       let remoteList=remoteRes.rows
		//       let newList=[]
		//       for (const newItem of remoteList) {
		//         if (newItem?.role != null) {
		//           newItem.dateTime=newItem.createTime
		//           newItem.text = newItem.content;
		//           newItem.inversion=true
		//           newItem.requestOptions={
		//             prompt:newItem.content,
		//             options:null
		//           }
		//           if(newItem.role=="assistant"){
		//             newItem.requestOptions.options={}
		//             newItem.inversion=false
		//           }
		//           newItem.model =newItem.modelName
		//           newList.push(newItem)

		//         }
		//       }
		//       this.chat.push({
		//         uuid: newId,
		//         data:newList,
		//       })
		//       this.recordState()
		//       return newList
		//     }
		//     return []

		//   },

		// const remoteRes: any = await getMessageList({ id: sessionId });

		async initializeData() {
			let userId = getUser()?.userId || null;
			const res: any = await getSessionList({ userId });
			if (res.code === 200) {
				const serverData = res.rows;
				for (const item of serverData) {
					if (item?.id != null) {
						item.title = item.sessionContent;
						item.uuid = item.id;
						item.isEdit = false;
					}
				}
				console.log("===>serverData", serverData);
				this.history = serverData;
				if (serverData.length > 0) {
					const sessionId = serverData[0].uuid;
					this.active = sessionId;
					const remoteRes: any = await getMessageList({ id: sessionId });

					if (remoteRes.code === 200 && remoteRes.rows) {
						console.log("========remoteRes", remoteRes);
						let remoteList = remoteRes.rows;
						let newList = [];
						for (const newItem of remoteList) {
							if (newItem?.role != null) {
								newItem.dateTime = newItem.createTime;
								newItem.text = newItem.content;
								newItem.inversion = true;
								newItem.conversationOptions = null;
								newItem.error = false;
								newItem.requestOptions = {
									prompt: serverData[0].title,
									options: null,
								};
								if (newItem.role == "assistant") {
									newItem.requestOptions.options = {};
									newItem.inversion = false;
								}
								newItem.model = newItem.modelName;
								newList.push(newItem);
							}
						}
						console.log("newList", newList);
						const chatIndex = this.chat.findIndex(
							(item) => item.uuid === sessionId
						);
						console.log("=========", chatIndex);
						if (chatIndex !== -1) {
							this.chat[chatIndex] = {
								uuid: sessionId,
								data: newList,
							};
						} else {
							this.chat.push({
								uuid: sessionId,
								data: newList,
							});
						}

						console.log("=========", this.chat[chatIndex]);

						this.recordState();
					}
				}
			}
		},

		setUsingContext(context: boolean) {
			this.usingContext = context;
			this.recordState();
		},

		async addHistory(history: Chat.History, chatData: Chat.Chat[] = []) {
			console.log("addHistory", history);
			const res: any = await createSession({
				sessionContent: history.title,
			});
			// let uuid=res.data.id
			this.history.unshift(history);
			this.chat.unshift({ uuid: String(history.uuid), data: chatData });
			this.active = history.uuid;
			this.reloadRoute(history.uuid);
		},

		updateHistory(uuid: string, edit: Partial<Chat.History>) {
			const index = this.history.findIndex((item) => item.uuid === uuid);
			if (index !== -1) {
				this.history[index] = { ...this.history[index], ...edit };
				this.recordState();
			}
		},

		async deleteHistory(index: number) {
			let newItem: any = this.history[index];
			// removeSession()
			console.log("item", newItem);
			let id = newItem.id || null;
			const res: any = await removeSession(id);
			if (res.code == 200 || !id) {
				this.history.splice(index, 1);
				this.chat.splice(index, 1);

				if (this.history.length === 0) {
					this.active = null;
					this.reloadRoute();
					return;
				}

				if (index > 0 && index <= this.history.length) {
					const uuid = this.history[index - 1].uuid;
					this.active = uuid;
					this.reloadRoute(uuid);
					return;
				}

				if (index === 0) {
					if (this.history.length > 0) {
						const uuid = this.history[0].uuid;
						this.active = uuid;
						this.reloadRoute(uuid);
					}
				}

				if (index > this.history.length) {
					const uuid = this.history[this.history.length - 1].uuid;
					this.active = uuid;
					this.reloadRoute(uuid);
				}
			}
		},

		async setActive(uuid: string) {
			this.active = uuid;
			return await this.reloadRoute(uuid);
		},

		getChatByUuidAndIndex(uuid: string, index: number) {
			if (!uuid) {
				if (this.chat.length) return this.chat[0].data[index];
				return null;
			}
			const chatIndex = this.chat.findIndex((item) => item.uuid === uuid);
			if (chatIndex !== -1) return this.chat[chatIndex].data[index];
			return null;
		},

		addChatByUuid(uuid: string, chat: Chat.Chat) {
			if (!uuid) {
				if (this.history.length === 0) {
					const uuid = String(Date.now());
					this.history.push({ uuid, title: chat.text, isEdit: false });
					this.chat.push({ uuid, data: [chat] });
					this.active = uuid;
					this.recordState();
				} else {
					this.chat[0].data.push(chat);
					if (this.history[0].title === "New Chat")
						this.history[0].title = chat.text;
					this.recordState();
				}
			}

			const index = this.chat.findIndex((item) => item.uuid === uuid);
			if (index !== -1) {
				this.chat[index].data.push(chat);
				if (this.history[index].title === "New Chat")
					this.history[index].title = chat.text;
				this.recordState();
			}
		},

		updateChatByUuid(uuid: string, index: number, chat: Chat.Chat) {
			if (!uuid) {
				if (this.chat.length) {
					this.chat[0].data[index] = chat;
					this.recordState();
				}
				return;
			}

			const chatIndex = this.chat.findIndex((item) => item.uuid === uuid);
			if (chatIndex !== -1) {
				this.chat[chatIndex].data[index] = chat;
				this.recordState();
			}
		},

		updateChatSomeByUuid(
			uuid: string,
			index: number,
			chat: Partial<Chat.Chat>
		) {
			if (!uuid) {
				if (this.chat.length) {
					this.chat[0].data[index] = { ...this.chat[0].data[index], ...chat };
					this.recordState();
				}
				return;
			}

			const chatIndex = this.chat.findIndex((item) => item.uuid === uuid);
			if (chatIndex !== -1) {
				this.chat[chatIndex].data[index] = {
					...this.chat[chatIndex].data[index],
					...chat,
				};
				this.recordState();
			}
		},

		deleteChatByUuid(uuid: string, index: number) {
			if (!uuid) {
				if (this.chat.length) {
					this.chat[0].data.splice(index, 1);
					this.recordState();
				}
				return;
			}

			const chatIndex = this.chat.findIndex((item) => item.uuid === uuid);
			if (chatIndex !== -1) {
				this.chat[chatIndex].data.splice(index, 1);
				this.recordState();
			}
		},

		clearChatByUuid(uuid: string) {
			if (!uuid) {
				if (this.chat.length) {
					this.chat[0].data = [];
					this.recordState();
				}
				return;
			}

			const index = this.chat.findIndex((item) => item.uuid === uuid);
			if (index !== -1) {
				this.chat[index].data = [];
				this.recordState();
			}
		},

		clearHistory() {
			this.$state = { ...defaultState() };
			this.recordState();
		},

		async reloadRoute(uuid?: string) {
			this.recordState();

			await router.push({
				name: homeStore.myData.local == "draw" ? "draw" : "Chat",
				params: { uuid },
			});
		},

		recordState() {
			setLocalState(this.$state);
		},
	},
});

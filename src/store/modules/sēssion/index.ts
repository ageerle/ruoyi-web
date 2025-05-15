import { defineStore } from "pinia";
import {
	getAllData,
	setAllData,
	updateOne,
	deleteOne,
} from "@/utils/storage/DBIndex";
import {
	getSessionList,
	removeSession,
	changeSessionList,
	getMessage,
} from "@/api/bot";

import { getUser } from "@/store/modules/auth/helper";
// gettUser
import { ref } from "vue";

export const useDataStore = defineStore("data", () => {
	const items = ref<any[]>([]);

	const setItems = (data: any[]) => {
		items.value = data;
	};

	const updateItem = (updated: any) => {
		const idx = items.value.findIndex((i) => i.id === updated.id);
		if (idx !== -1) items.value[idx] = updated;
	};

	const deleteItem = (id: number|string) => {
		items.value = items.value.filter((i) => i.id !== id);
	};

	const restoreItems = (backup: any[]) => {
		items.value = backup;
	};

	// 初始化（先本地再接口）
	const initializeData = async () => {
		const localData = await getAllData();
		console.log("===>localData", localData);
		setItems(localData);
		let userId = getUser().userId || null;
		const res: any = await getSessionList({ userId });
		console.log("===>res", res);
		if (res.code === 200) {
			const serverData = res.rows;
			for (const item of serverData) {
				if (item?.id != null) {
					item.title = item.sessionTitle;
					item.uuid = item.userId;
					item.isEdit = item.false;
				}
			}

			if (JSON.stringify(serverData) !== JSON.stringify(localData)) {
				setItems(serverData);
				await setAllData(serverData);
			}
		}
	};

	const updateItemAction = async (updatedItem: any) => {
		const backup = [...items.value];
		updateItem(updatedItem);

		const success = await changeSessionList(updatedItem);
		if (!success) {
			restoreItems(backup);
		} else {
			await updateOne(updatedItem);
		}
	};

	const deleteItemAction = async (id: number | string) => {
		const backup = [...items.value];
		deleteItem(id);

		const success = await removeSession(id);
		if (!success) {
			restoreItems(backup);
		} else {
			await deleteOne(id);
		}
	};

	return {
		items,
		initializeData,
		updateItemAction,
		deleteItemAction,
	};
});

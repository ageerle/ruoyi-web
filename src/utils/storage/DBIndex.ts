/**
 * 使用 IndexedDB 存储
 */
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "MyAppDB";
const DB_VERSION = 1;


export const STORE_SESSION = "session";
export const STORE_MESSAGE = "messages";
export const STORE_ACTIVE = "active";

interface DataItem {
	id: number|string; // keyPath
	sessionId?: number|string;
	[key: string]: any;
}

let dbPromise: Promise<IDBPDatabase>;

function initDB(): Promise<IDBPDatabase> {
	if (!dbPromise) {
		dbPromise = openDB(DB_NAME, DB_VERSION, {
			upgrade(db, oldVersion) {
				console.log("upgrade", oldVersion);
				console.log("db.objectStoreNames", db.objectStoreNames);
				
				if (!db.objectStoreNames.contains(STORE_SESSION)) {
					db.createObjectStore(STORE_SESSION, { keyPath: "id" });
				}
				if (!db.objectStoreNames.contains(STORE_MESSAGE)) {
					console.log("创建message store");
					const store = db.createObjectStore(STORE_MESSAGE, { keyPath: "id" });
					store.createIndex("sessionId", "sessionId"); // 添加索引
				} else if (oldVersion < 2) {
					const store = db.transaction(STORE_MESSAGE, "versionchange").objectStore(STORE_MESSAGE);
					if (!store.indexNames.contains("sessionId")) {
						store.createIndex("sessionId", "sessionId");
					}
				}
				if (!db.objectStoreNames.contains(STORE_ACTIVE)) {
					db.createObjectStore(STORE_ACTIVE, { keyPath: "id" });
				}
			},
		});
	}
	return dbPromise;
}

/**
 * 获取所有数据
 */
export async function getAllData(storeName: string): Promise<DataItem[]> {
	console.log("getAllData",storeName);
	try {
		const db = await initDB();
		return await db.getAll(storeName);
	} catch (err) {
		console.error("Failed to get all data:", err);
		return [];
	}
}

/**
 * 全量设置数据（会先清空原有数据）
 */
export async function setAllData(storeName: string,data: DataItem[]): Promise<void> {
	if (!Array.isArray(data)) return;

	try {
		const db = await initDB();
		const tx = db.transaction(storeName, "readwrite");
		const store = tx.store;

		await store.clear();
		for (const item of data) {
			if (item?.id != null) {
				await store.put(item);
			}
		}

		await tx.done;
	} catch (err) {
		console.error("Failed to set all data:", err);
	}
}

/**
 * 更新或新增单个对象
 */
export async function updateOne(storeName: string,item: DataItem): Promise<void> {

	try {
		const db = await initDB();
		console.log("======item", item);
		await db.put(storeName, item);
	} catch (err) {
		console.error("Failed to update one item:", err);
	}
}

/**
 * 删除单个对象
 */
export async function deleteOne(storeName: string, id: number|string): Promise<void> {
	

	try {
		const db = await initDB();
		await db.delete(storeName, id);
	} catch (err) {
		console.error("Failed to delete item:", err);
	}
}

/**
 * 根据 id 获取单个数据
 */
export async function getOne(storeName: string, id: number|string): Promise<DataItem | undefined> {
	if (id == null || typeof id !== "number") return;

	try {
		const db = await initDB();
		return await db.get(storeName, id);
	} catch (err) {
		console.error("Failed to get one item:", err);
		return undefined;
	}
}

/**
 * 清空所有数据
 */
export async function clearAllData(storeName: string,): Promise<void> {
	try {
		const db = await initDB();
		await db.clear(storeName);
	} catch (err) {
		console.error("Failed to clear all data:", err);
	}
}


/**
 * 根据 sessionId 获取所有消息
 */
export async function getMessagesBySessionId(sessionId: string | number): Promise<DataItem[]> {
	try {
		const db = await initDB();
		return await db.getAllFromIndex(STORE_MESSAGE, "sessionId", sessionId);
	} catch (err) {
		console.error("Failed to get messages by sessionId:", err);
		return [];
	}
}

/**
 * 删除某个 sessionId 下的所有消息
 */
export async function deleteMessagesBySessionId(sessionId: string | number): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_MESSAGE, "readwrite");
    const store = tx.store;
    const index = store.index("sessionId");

    const messages = await index.getAllKeys(sessionId);
    for (const key of messages) {
      await store.delete(key);
    }

    await tx.done;
  } catch (err) {
    console.error("Failed to delete messages by sessionId:", err);
  }
}
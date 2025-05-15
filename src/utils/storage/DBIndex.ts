/**
 * 使用 IndexedDB 存储
 */
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "MyAppDB";
const STORE_NAME = "data";
const DB_VERSION = 1;

interface DataItem {
	id: number; // keyPath
	[key: string]: any;
}

let dbPromise: Promise<IDBPDatabase>;

function initDB(): Promise<IDBPDatabase> {
	if (!dbPromise) {
		dbPromise = openDB(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME, { keyPath: "id" });
				}
			},
		});
	}
	return dbPromise;
}

/**
 * 获取所有数据
 */
export async function getAllData(): Promise<DataItem[]> {
	try {
		const db = await initDB();
		return await db.getAll(STORE_NAME);
	} catch (err) {
		console.error("Failed to get all data:", err);
		return [];
	}
}

/**
 * 全量设置数据（会先清空原有数据）
 */
export async function setAllData(data: DataItem[]): Promise<void> {
	if (!Array.isArray(data)) return;

	try {
		const db = await initDB();
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.store;

		await store.clear();
		console.log("==data", data);
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
export async function updateOne(item: DataItem): Promise<void> {
	if (!item || item.id == null) {
		console.warn("updateOne failed: missing item or id");
		return;
	}

	try {
		const db = await initDB();
		await db.put(STORE_NAME, item);
	} catch (err) {
		console.error("Failed to update one item:", err);
	}
}

/**
 * 删除单个对象
 */
export async function deleteOne(id: number|string): Promise<void> {
	if (id == null || typeof id !== "number") {
		console.warn("deleteOne failed: invalid id", id);
		return;
	}

	try {
		const db = await initDB();
		await db.delete(STORE_NAME, id);
	} catch (err) {
		console.error("Failed to delete item:", err);
	}
}

/**
 * 根据 id 获取单个数据
 */
export async function getOne(id: number): Promise<DataItem | undefined> {
	if (id == null || typeof id !== "number") return;

	try {
		const db = await initDB();
		return await db.get(STORE_NAME, id);
	} catch (err) {
		console.error("Failed to get one item:", err);
		return undefined;
	}
}

/**
 * 清空所有数据
 */
export async function clearAllData(): Promise<void> {
	try {
		const db = await initDB();
		await db.clear(STORE_NAME);
	} catch (err) {
		console.error("Failed to clear all data:", err);
	}
}

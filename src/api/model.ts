import request from "@/utils/request/req";

/**
 * 查询未隐藏模型
 * @returns
 */
export function modelList() {
	return request({
		url: "/system/model/modelList",
		method: "get",
	});
}

/**
 * 根据分类查询模型
 *
 * @returns
 */
export function getModelListByCategory(category: string) {
	return request({
		url: "/system/model/list",
		method: "get",
		params: {
			category,
		},
	});
}

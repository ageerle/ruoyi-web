import request from "@/utils/request/req";

/**
 * 查询未隐藏模型
 * @returns
 */
export function modelList(category: string) {
	return request({
		url: "/system/model/modelList",
		method: "get",
		params: {
			category,
		},
	});
}

/**
 * 查询所有模型
 *
 * @returns
 */
export function list(category: string) {
	return request({
		url: "/system/model/list",
		method: "get",
		params: {
			category,
		},
	});
}

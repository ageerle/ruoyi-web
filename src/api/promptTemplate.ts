import request from "@/utils/request/req";

/**
 * 查询提示词模板
 *
 * @returns
 */
export function getPromptTemplateListByCategory(category: string) {
	return request({
		url: "/system/promptTemplate/list",
		method: "get",
		params: {
			category,
		},
	});
}

import request from "@/utils/request/req";

export interface KnowledgeReq {
	id: string; // 知识库id
	kid: string; // 附件id
	uid: string; //  用户id
	kname: string; // 知识库名称
	description: string; // 知识库描述
}

export interface KnowledgeDelReq {
	id: string; // 附件id
}

export interface KnowledgeDetailDelReq {
	kid: string; // 附件id
	docId: string; // 文档id
}

export interface SimpleGenerate {
	model: string;
	randomness: number;
	stability_boost: number;
	voiceId: string;
	text: string;
}

export function getKnowledge(pageNum: number, pageSize: number) {
	return request({
		url: "/knowledge/list",
		method: "get",
		params: { pageNum, pageSize },
	});
}

export function getKnowledgeByRole(pageNum: number, pageSize: number) {
	return request({
		url: "/knowledge/listByRole",
		method: "get",
		params: { pageNum, pageSize },
	});
}

export function createKnowledgeReq(params: KnowledgeReq) {
	return request({
		url: "/knowledge/save",
		method: "post",
		data: params,
	});
}

export function delKnowledge(params: KnowledgeDelReq) {
	return request({
		url: "/knowledge/remove/" + params.id,
		method: "post",
	});
}

export function getKnowledgeDetail(kid: string) {
	return request({
		url: "/knowledge/detail/" + kid,
		method: "get",
	});
}

export function delKnowledgeDetail(params: KnowledgeDetailDelReq) {
	return request({
		url: "knowledge/attach/remove/" + params.docId,
		method: "post",
	});
}

export function getfragmentList(docId: string) {
	return request({
		url: "/knowledge/fragment/list/" + docId,
		method: "get",
	});
}

import request from '@/utils/request/req';
export interface KnowledgeReq {
	id:string; // 知识库id
	kid:string; // 附件id
	uid:string;//  用户id  
	kname:string; // 知识库名称
	description:string;// 知识库描述 
}

export interface SimpleGenerate {
	model: string,
	randomness: number,
	stability_boost: number,
	voiceId: string,
	text: string
}

export function createKnowledgeReq(params:KnowledgeReq) {
	return request({
		url: '/knowledge/save',
		method: 'post',
		data: params,
	})
}

export function getKnowledge() {
	return request({
		url: '/knowledge/list',
		method: 'get',
	})
}


export function getKnowledgeDetail(kid: string) {
	return request({
		url: '/knowledge/detail/'+kid,
		method: 'get',
	})
}


export function getfragmentList(docId: string) {
	return request({
		url: '/knowledge/fragment/list/'+docId,
		method: 'get',
	})
}




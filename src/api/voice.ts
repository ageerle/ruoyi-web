import request from '@/utils/request/req';
export interface RoleReq {
	name:string; // 角色名称
	description:string; //角色描述
	prompt:string;//音频地址  
}

export interface SimpleGenerate {
	model: string,
	randomness: number,
	stability_boost: number,
	voiceId: string,
	text: string
}

export function createRole(params:RoleReq) {
	return request({
		url: '/system/voice/add',
		method: 'post',
		data: params,
	})
}


export function simpleGenerateReq(params:SimpleGenerate) {
	return request({
		url: '/system/voice/simpleGenerate',
		method: 'post',
		data: params,
	})
}

export function getRole() {
	return request({
		url: '/system/voice/list',
		method: 'get',
	})
}



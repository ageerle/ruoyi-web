import request from '@/utils/request/req';

export interface RoleReq {
	name:string; // 角色名称
	description:string; //角色描述
	prompt:string;//音频地址  
	avatar: string; //头像地址
}

export interface SimpleGenerate {
	model: string,
	randomness: number,
	stability_boost: number,
	voiceId: string,
	text: string
}

export interface Character {
	id: string;
	name: string;
	description: string;
	voicesId: string;
	avatar: string;
	previewAudio: string;
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

export function delRole(id:string) {
	return request({
		url: '/system/voice/'+ id,
		method: 'delete',
	})
}

export function getRole() {
	return request({
		url: '/system/voice/list',
		method: 'get',
	})
}

/**
 * 获取声音市场角色
 * 
 * @returns  市场角色
 * 
 */
export function getRoleList() {
	return request({
		url: '/system/voice/roleList',
		method: 'get'
	})
}

/**
 * 收藏声音市场角色
 *  
 */
export function copyRoleList(item: any) {
	return request({
		url: '/system/voice/copyRole',
		method: 'post',
		data: item
	})
}








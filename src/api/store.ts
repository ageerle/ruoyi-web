import request from '@/utils/request/req';

export interface RoleReq {
	name:string; // 名称
	description:string; //描述
	avatar: string; //头像地址
	appUrl:string;//应用地址  
}

export interface SimpleGenerate {
	model: string,
	randomness: number,
	stability_boost: number,
	voiceId: string,
	text: string
}

export interface Character {
	id:string;
	name:string; // 名称
	description:string; //描述
	avatar: string; //头像地址
	appUrl:string;//应用地址  
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
 * 获取应用信息
 * 
 * @returns 应用列表
 * 
 */
export function getAppList() {
	return request({
		url: '/system/store/appList',
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








import request from '@/utils/request/req';

/**
 * 查询未隐藏模型
 * @returns 
 */
export function modelList() {
	return request({
		url: '/system/model/modelList',
		method: 'get',
	})
}

/**
 * 查询所有模型
 * 
 * @returns 
 */
export function list() {
	return request({
		url: '/system/model/list',
		method: 'get',
	})
}






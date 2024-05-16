import request from '@/utils/request/req';

/**
 * 查询未隐藏模型
 */
export function getmodelList() {
	return request({
		url: '/system/model/modelList',
		method: 'get',
	})
}

/**
 * 查询所有模型
 */
export function list() {
	return request({
		url: '/system/model/list',
		method: 'get',
	})
}






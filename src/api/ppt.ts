import request from '@/utils/request/req';

// 获取API Token
export function getApiToken() {
	return request({
		url: '/system/model/getPPT',
		method: 'get',
	})
}

// 成功回调
export function successCallback() {
	return request({
		url: '/ppt/successCallback',
		method: 'post',
	})
}

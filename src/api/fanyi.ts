import request from '@/utils/request/req';

export function translation(data: any) {
	return request({
		url: '/chat/translation',
		method: 'post',
		data: data
	})
}

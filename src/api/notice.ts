import request from '@/utils/request/req';

export function getNotice() {
	return request({
		url: '/system/notice/getNotice',
		method: 'get',
	})
}
export function getInform() {
	return request({
		url: '/system/notice/list',
		method: 'get',
	})
}

export function readNotice(noticeId: string) {
	return request({
		url: '/system/noticeState',
		method: 'put',
		data: {"noticeId":noticeId}
	})
}
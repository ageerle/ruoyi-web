import request from '@/utils/request/req';

export function listByUser(params: { pageNum: number; pageSize: number }) {
	return request({
	  url: '/system/message/listByUser',
	  method: 'get',
	  params
	});
}

export function getGpts(params: { pageNum: number; pageSize: number }) {
	return request({
	  url: '/system/gpts/list',
	  method: 'get',
	  params
	});
}

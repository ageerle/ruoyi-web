import request from '@/utils/request/req';
export interface OrderReq {
	money:string; // 商品价格
	name:string; //商品名称
}

export function payUrl(params:OrderReq) {
	return request({
		url: '/pay/payUrl',
		method: 'post',
		data: params,
	})
}

export function getOrderInfo(orderNo:string) {
	return request({
		url: '/pay/orderInfo',
		method: 'post',
		data: {"orderNo":orderNo}
	  });
}


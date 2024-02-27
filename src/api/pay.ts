import { post} from '@/utils/request/'
import request from '@/utils/request/req';
export interface OrderReq {
	money:string; // 商品价格
	name:string; //商品名称
}

export function payUrl(params:OrderReq) {
	return post({
		url: '/pay/payUrl',
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


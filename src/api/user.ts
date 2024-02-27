import {LoginFrom} from "@/typings/user";
import request from '@/utils/request/req';
/**
 * 用户登录
 */
export function doLogin<T>(params:LoginFrom) {
	return request({
		url: '/auth/login',
		headers: {
			isToken: false
		},
		method: 'post',
		data: params
	  });
}

/**
 * 用户注册
 */
export function doRegist<T>(username: string, password: string,code:string) {
	return request({
		url: '/auth/register',
		method: 'post',
		data: {username, password,code},
	})
}

/**
 * 重置密码
 */
export function reset<T>(username: string, password: string,code:string) {
	return request({
		url: '/auth/reset/password',
		method: 'post',
		data: {username, password,code},
	})
}

/**
 * 获取邮箱验证码
 */
export function getVerificationCode(username:string) {
	return request({
		url:'/resource/email/code',
		method: 'post',
		data:{username}
	})
}


/**
 * 获取用户登录信息
 */
export function getUserInfo() {
	return request({
		url:'/system/user/getInfo',
		method: 'get',
	})
}

/**
 * 修改用户名称
 */
export function editUserNmae(nickName:string) {
	return request({
		url:'/system/user/editName',
		method: 'post',
		data:{nickName}
	})
}

/**
 * 退出登录
 */
export function loginOut() {
	return request({
		url:'/auth/logout',
		method: 'post',
	})
}
import request from '@/utils/request/req';
import { AxiosPromise } from 'axios';

export interface RobConfigVO {
	/**
	 * 主键
	 */
	id: string | number;
  
	/**
	 * 用户id
	 */
	userId: string | number;
  
	/**
	 * 机器唯一码
	 */
	uniqueKey: string;
  
	/**
	 * 备注（微信号）
	 */
	remark: string;
  
	/**
	 * 指定好友回复开关
	 */
	toFriend: number;
  
	/**
	 * 指定群回复开关
	 */
	toGroup: number;
  
	/**
	 * 默认好友回复开关
	 */
	defaultFriend: number;
  
	/**
	 * 默认群回复开关
	 */
	defaultGroup: number;
  
	/**
	 * 对外接口开关
	 */
	fromOut: number;
  
	/**
	 * 机器启用1禁用0
	 */
	enable: number;
  
  }
  
  export interface RobConfigForm  {
	/**
	 * 主键
	 */
	id?: string | number;
  
	/**
	 * 用户id
	 */
	userId?: string | number;
  
	/**
	 * 机器唯一码
	 */
	uniqueKey?: string;
  
	/**
	 * 备注（微信号）
	 */
	remark?: string;
  
	/**
	 * 指定好友回复开关
	 */
	toFriend?: number;
  
	/**
	 * 指定群回复开关
	 */
	toGroup?: number;
  
	/**
	 * 默认好友回复开关
	 */
	defaultFriend?: number;
  
	/**
	 * 默认群回复开关
	 */
	defaultGroup?: number;
  
	/**
	 * 对外接口开关
	 */
	fromOut?: number;
  
	/**
	 * 机器启用1禁用0
	 */
	enable?: number;
  
  }
  
  export interface RobConfigQuery  {
	/**
	 * 用户id
	 */
	userId?: string | number;
  
	/**
	 * 机器唯一码
	 */
	uniqueKey?: string;
  
	/**
	 * 指定好友回复开关
	 */
	toFriend?: number;
  
	/**
	 * 指定群回复开关
	 */
	toGroup?: number;
  
	/**
	 * 默认好友回复开关
	 */
	defaultFriend?: number;
  
	/**
	 * 默认群回复开关
	 */
	defaultGroup?: number;
  
	/**
	 * 对外接口开关
	 */
	fromOut?: number;
  
	/**
	 * 机器启用1禁用0
	 */
	enable?: number;
  
  }
  

/**
 * 获取微信二维码
 * @returns
 */
export function getQr(uniqueKey: string) {
	return request({
		url: '/getQr',
		method: 'post',
		params: {
            uniqueKey: uniqueKey
        }
	})
}

/**
 * 查询登录状态
 * @returns 
 */
export function wxlogin(uniqueKey: string) {
	return request({
		url: '/wxLogin',
		method: 'post',
		params: {
            uniqueKey: uniqueKey
        }
	})
}

/**
 * 初始化微信数据微信
 * @returns 
 */
export function wxinit(uniqueKey: string) {
	return request({
		url: '/wxInit',
		method: 'post',
		params: {
            uniqueKey: uniqueKey
        }
	})
}

/**
 * 退出微信
 * @returns 
 */
export function wxLogout(uniqueKey: string) {
	return request({
		url: '/wxLogout',
		method: 'post',
		params: {
            uniqueKey: uniqueKey
        }
	})
}


/**
 * 查询【请填写功能名称】列表
 * @param query
 * @returns {*}
 */

export const listRobConfig = (query?: RobConfigQuery): AxiosPromise<RobConfigVO[]> => {
	return request({
	  url: '/system/robConfig/list',
	  method: 'get',
	  params: query
	});
  };
  
  /**
   * 查询【请填写功能名称】详细
   * @param id
   */
  export const getRobConfig = (id: string | number): AxiosPromise<RobConfigVO> => {
	return request({
	  url: '/system/robConfig/' + id,
	  method: 'get'
	});
  };
  
  /**
   * 新增【请填写功能名称】
   * @param data
   */
  export const addRobConfig = (data: RobConfigForm) => {
	return request({
	  url: '/system/robConfig',
	  method: 'post',
	  data: data
	});
  };
  
  /**
   * 修改【请填写功能名称】
   * @param data
   */
  export const updateRobConfig = (data: RobConfigForm) => {
	return request({
	  url: '/system/robConfig',
	  method: 'put',
	  data: data
	});
  };
  
  /**
   * 删除【请填写功能名称】
   * @param id
   */
  export const delRobConfig = (id: string | number | Array<string | number>) => {
	return request({
	  url: '/system/robConfig/' + id,
	  method: 'delete'
	});
  };
  
  /**
   * 获取当前用户绑定机器人列表
   */
  export function getRobConfigByUser() {
	return request({
		url: '/system/robConfig/getRobConfig',
		method: 'get',
	})
}
export interface LoginFrom {
	username: string // 用户名
	password: string // 用户密码
	type: string // 登录类型
}

export interface LoginUserInfo {
	userId:bigint;// 用户id
	nickName:string; //用户账号
	avatar:string; // 用户头像
	userBalance:number; // 账户余额
}

export interface UserData {
	token:string; // 登录token
	user:LoninUserInfo; //用户信息
}
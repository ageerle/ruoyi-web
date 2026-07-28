export interface LoginDTO {
  username: string;
  password: string;
  code?: string;
  clientId?: string;
  grantType?: string;
  tenantId?: string;
  uuid?: string;
  // 二次确认密码
  confirmPassword?: string;
}

export interface LoginVO {
  access_token?: string;
  token?: string;
  userInfo?: LoginUser;
}

/**
 * LoginUser，登录用户身份权限
 */
export interface LoginUser {
  /**
   * 微信头像
   */
  avatar?: string;
  /**
   * 浏览器类型
   */
  browser?: string;
  /**
   * 部门ID
   */
  deptId?: number;
  /**
   * 部门名
   */
  deptName?: string;
  /**
   * 过期时间
   */
  expireTime?: number;
  /**
   * 登录IP地址
   */
  ipaddr?: string;
  /**
   * 获取登录id
   */
  loginId?: string;
  /**
   * 登录地点
   */
  loginLocation?: string;
  /**
   * 登录时间
   */
  loginTime?: number;
  /**
   * 菜单权限
   */
  menuPermission?: string[];
  /**
   * 用户名
   */
  nickName?: string;
  /**
   * 操作系统
   */
  os?: string;
  /**
   * 数据权限 当前角色ID
   */
  roleId?: number;
  /**
   * 角色权限
   */
  rolePermission?: string[];
  /**
   * 角色对象
   */
  roles?: RoleDTO[];
  /**
   * 租户ID
   */
  tenantId?: string;
  /**
   * 用户唯一标识
   */
  token?: string;
  /**
   * 用户ID
   */
  userId?: number;
  /**
   * 用户名
   */
  username?: string;
  /**
   * 用户类型
   */
  userType?: string;
}

/**
 * RoleDTO，角色
 */
export interface RoleDTO {
  /**
   * 数据范围（1：所有数据权限；2：自定义数据权限；3：本部门数据权限；4：本部门及以下数据权限；5：仅本人数据权限）
   */
  dataScope?: string;
  /**
   * 角色ID
   */
  roleId?: number;
  /**
   * 角色权限
   */
  roleKey?: string;
  /**
   * 角色名称
   */
  roleName?: string;
}

// 邮箱验证码
export interface EmailCodeDTO {
  /**
   * 邮箱（后端 GET /resource/email/code 按 query 参数 email 接收）
   */
  email: string;
}

// 邮箱注册
export interface RegisterDTO {
  /**
   * 邮箱（注册时作为用户名 username 提交给后端）
   */
  username: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 验证码
   */
  code: string;
  /**
   * 确认密码
   */
  confirmPassword?: string;
  /**
   * 客户端 id（后端 RegisterBody 继承 LoginBody，clientId 为必填）
   */
  clientId?: string;
  /**
   * 授权类型
   */
  grantType?: string;
  /**
   * 租户 ID
   */
  tenantId?: string;
}

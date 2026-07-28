import type { EmailCodeDTO, LoginDTO, LoginVO, RegisterDTO } from './types';
import { get, post } from '@/utils/request';

export const login = (data: LoginDTO) => post<LoginVO>('/auth/login', data).json();

// 邮箱验证码（后端 GET /resource/email/code，按 query 参数 email 接收）
export function emailCode(data: EmailCodeDTO) {
  return get('/resource/email/code', { email: data.email }).json();
}

// 注册账号
export const register = (data: RegisterDTO) => post('/auth/register', data).json();

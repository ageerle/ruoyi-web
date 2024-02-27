import type { Router } from 'vue-router'
import { getToken } from '@/store/modules/auth/helper'

const whiteList = ['/login', '/regist','/resetpassword']; // 不重定向白名单

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    if (getToken()) {
        if (to.path === '/login') {
          next({ path: '/' });
        }else{
          next();
        }
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        next({ name: 'Login' });
      }
    }
  });
}

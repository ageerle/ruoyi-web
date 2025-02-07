import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import { ChatLayout } from '@/views/chat/layout'
import mjlayout from '@/views/mj/layout.vue'
import soundLayout from '@/views/sound/layout.vue'
import sunoLayout from '@/views/suno/layout.vue'
import lumaLayout from '@/views/luma/layout.vue'
import knowLayout from '@/views/knowledge/layout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: ChatLayout,
    redirect: '/chat',
    children: [
      {
        path: '/chat/:uuid?',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
      },
    ],
  },
   {
    path: '/g',
    name: 'g',
    component: ChatLayout,
    redirect: '/g/g-2fkFE8rbu',
    children: [
      {
        path: '/g/:gid',
        name: 'GPTs',
        component: () => import('@/views/chat/index.vue'),
      },
    ],
  },

   {
    path: '/m',
    name: 'm',
    component: ChatLayout,
    redirect: '/m/gpt-3.5-turbo',
    children: [
      {
        path: '/m/:gid',
        name: 'Model',
        component: () => import('@/views/chat/index.vue'),
      },
    ],
  },

  {
    path: '/draw',
    name: 'Rootdraw',
    component: mjlayout,
    redirect: '/draw/index',
    children: [
      {
        path: '/draw/:uuid?',
        name: 'draw',
        component: () => import('@/views/mj/draw.vue'),
      },
    ],
  },

  {
    path: '/sound',
    name: 'Sound',
    component: soundLayout,
    redirect: '/sound/t',
    children: [
      {
        path: 't',
        name: 'sound1',
        component: () => import('@/views/sound/index.vue'),
      },
    ],
  },
  
  {
    path: '/roleList',
    name: 'RoleList',
    component: ChatLayout,
    redirect: '/roleList/t',
    children: [
      {
        path: 't',
        name: 'roleList1',
        component: () => import('@/views/sound/roleList.vue'),
      },
    ],
  },

  {
    path: '/wxbot',
    name: 'Wxbot',
    component: ChatLayout,
    redirect: '/wxbot/t',
    children: [
      {
        path: 't',
        name: 'wxbot1',
        component: () => import('@/views/wxbot/bot.vue'),
      },
    ],
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: knowLayout,
    redirect: '/knowledge/t',
    children: [
      {
        path: 't',
        name: 'knowledge1',
        component: () => import('@/views/knowledge/index.vue'),
      },
    ],
  },

  {
    path: '/annex',
    name: 'Annex',
    component: knowLayout,
    redirect: '/annex/t',
    children: [
      {
        path: 't',
        name: 'annex1',
        component: () => import('@/views/knowledge/annex.vue'),
      },
    ],
  },

  {
    path: '/fragment',
    name: 'Fragment',
    component: knowLayout,
    redirect: '/fragment/t',
    children: [
      {
        path: 't',
        name: 'fragment1',
        component: () => import('@/views/knowledge/fragment.vue'),
      },
    ],
  },

  // {
  //   path: '/music',
  //   name: 'music',
  //   component: sunoLayout,
  //   redirect: '/music/index',
  //   children: [
  //     {
  //       path: '/music/:uuid?',
  //       name: 'music',
  //       component: () => import('@/views/suno/music.vue'),
  //     },
  //   ],
  // },

  // {
  //   path: '/video',
  //   name: 'video',
  //   component: lumaLayout,
  //   redirect: '/video/index',
  //   children: [
  //     {
  //       path: '/video/:uuid?',
  //       name: 'video',
  //       component: () => import('@/views/luma/video.vue'),
  //     },
  //   ],
  // },

  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/regist',
    name: 'regist',
    component: () => import('@/views/regist/index.vue'),
  },
  {
    path: '/resetpassword',
    name: 'resetpassword',
    component: () => import('@/views/resetpassword/index.vue'),
  },
  
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/500/index.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}

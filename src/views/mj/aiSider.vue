<script setup lang="ts">
import { computed,defineAsyncComponent ,ref, onMounted} from "vue";
import { PromptStore, SvgIcon} from '@/components/common'
import { getConfigKey } from '@/api/user';
import { useBasicLayout } from '@/hooks/useBasicLayout'
const { isMobile } = useBasicLayout()
import { removeToken } from '@/store/modules/auth/helper'
import { NTooltip, useMessage } from 'naive-ui'
import { homeStore,useChatStore } from '@/store'
import { loginOut,getUserInfo} from '@/api/user'
import { UserData } from "@/typings/user"
import { defaultSetting,UserInfo } from '@/store/modules/user/helper'
import { useRouter } from 'vue-router'
import { getToken } from "@/store/modules/auth/helper";
import to from "await-to-js";
const chatStore = useChatStore()
//import gallery from '@/views/gallery/index.vue'

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))


const st= ref({'show':false,showImg:false, menu:[],active:'chat'})
const router1 = useRouter()
const userInfo = ref<UserInfo>(defaultSetting().userInfo)
const message = useMessage()
const show = ref(false)

const isLogin =computed(  () => {
  return localStorage.getItem('TOKEN')
});

import { router } from '@/router'

const goHome =computed(  () => {
  return router.currentRoute.value.name
});

onMounted(() => {
  getLogo();
  getLoginUserInfo();
});

/**
 * 获取默认头像
 */
 async function getLogo() {
  const [err1, res1] = await to(getConfigKey("logoImage"));
		if (err1) {
			console.error("获取配置失败", err1.message);
		} else {
      userInfo.value.avatar  = res1.msg;
 }
}

/**
 * 获取当前登录用户信息
 */
 async function getLoginUserInfo() {
  // 用户未登录,不需要获取用户信息
  if(!getToken()){
      return
  }
  const [err, newUserInfo] = await to(getUserInfo<UserData>());
      if (err) {
       // message.error(err.toString())
        console.log(err.toString())
      }
  if(newUserInfo){
    if(newUserInfo.data.user.avatar){
      userInfo.value.avatar = newUserInfo.data.user.avatar;
    }
    userInfo.value.name = newUserInfo.data.user.nickName;
    userInfo.value.userBalance = newUserInfo.data.user.userBalance;
    userInfo.value.userName = newUserInfo.data.user.userName;
    isLogin.value = true
  }
}

const chatId= computed(()=>chatStore.active??'1002' );/**
 * 退出登录
 */
 async function handleReset() {
    await loginOut()
    // 删除用户token
    removeToken();
    // 跳转到登录页面
    router1.push('/login')
}

async function longin() {
    // 跳转到登录页面
    router1.push('/login')
}


</script>
<template>
<!-- <div class="flex-shrink-0 w-[60px] z-[1000]  h-full nav-bar" v-if="!isMobile">
    <div class="flex h-full select-none flex-col items-center justify-between bg-[#e8eaf1] px-2 pt-4 pb-8 dark:bg-[#25272d]">
        <div class="flex flex-col space-y-4 flex-1 nemu-bar">
            <a :href="`#/chat/${chatId}`"    @click="st.active='chat';homeStore.setMyData({act:'chat'})" class="router-link-active nemu-item">
                <n-tooltip placement="right" trigger="hover">
                  <template #trigger>
                    <div  class="flex h-full items-center py-1 flex-row " :class="[ goHome =='Chat' ? 'active' : '']">
                     <IconSvg icon="message" width="18" height="18"></IconSvg>
                     <span class="text-[18px]">{{$t('mjtab.chat')}}</span>
                    </div>
                 </template>
                AI Chat
                </n-tooltip>
            </a>

            <a   @click="homeStore.setMyData({act:'showgpts'}) " class="nemu-item">
                <n-tooltip placement="right" trigger="hover">
                  <template #trigger>
                    <div  class="flex h-full items-center   py-1 flex-row" >
                      <IconSvg icon="Application" width="18" height="18"></IconSvg>
                     <span class="text-[18px]">{{$t('mjtab.store')}}</span>
                    </div>
                  </template>
                    ChatGPT Store
                </n-tooltip>
            </a>

            <a :href="`#/draw/${chatId}`" @click="st.active='draw'" class="nemu-item">
                <n-tooltip placement="right" trigger="hover">
                  <template #trigger>
                    <div  class="flex h-full items-center   py-1 flex-row" :class="[goHome=='draw' ? 'active' : '']">
                      <IconSvg icon="Vector" width="18" height="18"></IconSvg>
                     <span class="text-[18px]">{{$t('mjtab.draw')}}</span>
                    </div>
                  </template>
                    {{$t('mjtab.drawinfo')}}
                </n-tooltip>
            </a>

    
          <a :href="`#/music`" @click="st.active='music';homeStore.setMyData({act:'music'}) " class="nemu-item">
						<n-tooltip placement="right" trigger="hover">
							<template #trigger>
								<div class="flex h-full items-center py-1 flex-row" :class="[st.active=='music' ? 'active' : '']">
									<IconSvg icon="music1" width="18" height="18"></IconSvg>
									<span class="text-[18px]"> {{ $t('suno.menu') }}</span>
								</div>
							</template>
              {{ $t('suno.menuinfo') }}
						</n-tooltip>
					</a>

          <a :href="`#/knowledge`" @click="st.active = 'knowledge'; homeStore.setMyData({ local: 'knowledge' })"
					class="nemu-item">
					<n-tooltip placement="right" trigger="hover">
						<template #trigger>
							<div class="flex h-full items-center py-1 flex-row" :class="[st.active == 'knowledge' ? 'active' : '']">
								<IconSvg icon="Book" width="18" height="18"></IconSvg>
								<span class="text-[18px]">{{ $t('mjtab.knowledge') }}</span>
							</div>
						</template>
						{{ $t('mjtab.knowledgeinfo') }}
					</n-tooltip>
				</a>
        </div>


        <div class="user-info" :style="{height: isLogin ? '144px' : '90px', bottom: isLogin ? '84px' : '24px'}">

          <div v-show="isLogin">
              <div class="top" >
              <div class="avatar">
                <img :src="userInfo.avatar" alt="">
                <div class="circle"></div>
              </div>
              <p class="user-name">{{ userInfo.name ?? '熊猫助手' }}</p>
              <div class="user-free">¥ {{ userInfo.userBalance }}</div>
              <p class="user-email">{{ userInfo.userName }}</p>
            </div>

            <div class="user-bottom" @click="show = true">
              <NButton block>
                {{ $t('store.siderButton') }}
              </NButton>
            </div>
          </div>

          <div v-show="!isLogin" class="user-bottom"  @click="longin">
            <NButton block>
                {{ $t('store.login') }}
            </NButton>
          </div>

        </div>

        <div v-if="isLogin" class="user-footer" v-show="isLogin">
          <div class="settings" @click="st.show = true">
            <IconSvg icon="Setting" width="24" height="22"></IconSvg>
            {{ $t('setting.setting') }}
          </div>
          <div class="log-out" @click="handleReset">
            <IconSvg icon="Logout" width="24" height="24"></IconSvg>
            {{ $t('mjset.logout') }}
          </div>
        </div>
    </div>
</div> -->
 <!-- <Setting v-if="st.show" v-model:visible="st.show" />
 <PromptStore v-model:visible="show"></PromptStore> -->

</template>





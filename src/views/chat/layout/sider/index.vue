<script setup lang='ts'>
import { computed,defineAsyncComponent , onMounted} from "vue";
import { ref, watch } from 'vue'
import { NButton, NLayoutSider, useDialog } from 'naive-ui'
import List from './List.vue'
import Footer from './Footer.vue'
import { useAppStore, useChatStore, homeStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { IconSvg, PromptStore, SvgIcon } from '@/components/common'
import { t } from '@/locales'
import { defaultSetting,UserInfo } from '@/store/modules/user/helper'
import { useRouter } from 'vue-router'
import { loginOut,getUserInfo} from '@/api/user'
import { removeToken } from '@/store/modules/auth/helper'
import to from "await-to-js";
import { getToken } from "@/store/modules/auth/helper";
import { useRoute } from 'vue-router';

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))

const appStore = useAppStore()
const chatStore = useChatStore()
const dialog = useDialog()

const { isMobile } = useBasicLayout()
const show = ref(false)


const collapsed = computed(() => appStore.siderCollapsed)


onMounted(() => {
  getLoginUserInfo();
});

function handleAdd() {
  chatStore.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false })
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

function handleClearAll() {
  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.clearHistoryConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearHistory()
      if (isMobile.value)
        appStore.setSiderCollapsed(true)
    },
  })
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
      height: '100%'
    }
  }
  if (appStore.theme == 'dark') {
    return {
      height: 'calc(100%)',
      marginTop: '0px',
      borderTopLeftRadius: '0px',
      borderBottomLeftRadius: '0px',
      backgroundColor: '#232627'
    }
  } else {
    return {
      height: 'calc(100%)',
      marginTop: '0px',
      borderTopLeftRadius: '0px',
      borderBottomLeftRadius: '0px',
      backgroundColor: '#fff'
    }
  }
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)

const router1 = useRouter()
const userInfo = ref<UserInfo>(defaultSetting().userInfo)
const st= ref({'show':false,showImg:false, menu:[],active:'chat'})

const isLogin =computed(  () => {
  return localStorage.getItem('TOKEN')
});



async function longin() {
    // 跳转到登录页面
    router1.push('/login')
}

async function store() {
    // 跳转到应用商店
    router1.push('/store')
}

 async function handleReset() {
    await loginOut()
    // 删除用户token
    removeToken();
    // 跳转到登录页面
    router1.push('/login')
}


/**
 * 获取当前登录用户信息
 */
 async function getLoginUserInfo() {
  // 用户未登录,不需要获取用户信息
  if(!getToken()){
      return
  }
  const [err, newUserInfo] = await to(getUserInfo());
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

</script>

<template>
  <NLayoutSider :collapsed="collapsed" :collapsed-width="0" :width="348"
    :show-trigger="isMobile ? false : 'arrow-circle'" collapse-mode="transform" bordered
    v-if="homeStore.myData.local == 'Chat'" :style="getMobileClass" @update-collapsed="handleUpdateCollapsed">
    <div class="flex flex-col h-full char-sider" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4 top-new-button">
          <NButton block @click="handleAdd">
            <IconSvg icon="add"></IconSvg>&nbsp;&nbsp;
            {{ $t('chat.newChatButton') }}
          </NButton>
        </div>
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List />
        </div>
        <div class="flex items-center p-4 space-x-4" v-if="isMobile">
          <div class="flex-1">
            <NButton block @click="show = true">
              {{ $t('store.siderButton') }}
            </NButton>
          </div>
          <NButton @click="handleClearAll">
            <SvgIcon icon="ri:close-circle-line" />
          </NButton>
        </div>
      </main>
      <Footer v-if="isMobile"></Footer>
    </div>
    <!-- <div class="nav-bar">
      <div class="user-info" :style="{ height: isLogin ? '144px' : '90px', bottom: isLogin ? '84px' : '24px' }">

        <div v-show="isLogin">
          <div class="top">
            <div class="avatar">
              <img :src="userInfo.avatar" alt="">
              <div class="circle"></div>
            </div>
            <div>
              <p class="user-name">{{ userInfo.userName ?? '熊猫助手' }}</p>
              <n-button @click="show = true" style="float: right;" size="small" tertiary>充值</n-button>
            </div>

            <div> 
              <span class="user-free">¥ {{ userInfo.userBalance }}元</span>
            </div>
          </div>

          <div class="user-bottom" @click="store">
            <Button block>
        
              {{ $t('store.siderButton') }}
            </Button>
          </div>
        </div>

        <div v-show="!isLogin" class="user-bottom" @click="longin">
          <Button block>
            {{ $t('store.login') }}
          </Button>
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
    </div> -->


    
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 w-full h-full bg-black/40" @click="handleUpdateCollapsed" />
  </template>

  <Setting v-if="st.show" v-model:visible="st.show" />
  <PromptStore v-model:visible="show"></PromptStore>


</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { NButton, NInput, NTag, NSelect, useMessage, NUpload, UploadFileInfo } from 'naive-ui'
import type { Language, Theme } from '@/store/modules/app/helper'
import { SvgIcon } from '@/components/common'
import { useAppStore } from '@/store'
import { t } from '@/locales'
import { getToken } from '@/store/modules/auth/helper'
import { getUserInfo,editUserNmae } from '@/api/user'
import to from "await-to-js";

onMounted(() => { getLoginUserInfo() });

const appStore = useAppStore()
const message = useMessage()

const ms = useMessage()

const theme = computed(() => appStore.theme)

const userBalance = ref(0)

const userGrade = ref("0")

const name = ref('')

const token = getToken()

let fileList = ref<UploadFileInfo[]>([
  {
    id: 'avatar',
    name: '头像预览',
    status: 'finished',
    url: 'http://panda-1253683406.cos.ap-guangzhou.myqcloud.com/panda/2024/01/03/0e3600b455914b0dade9943f281be19b.png'
  },
])

const language = computed({
  get() {
    return appStore.language
  },
  set(value: Language) {
    appStore.setLanguage(value)
  },
})

const themeOptions: { label: string; key: Theme; icon: string }[] = [
  {
    label: 'Auto',
    key: 'auto',
    icon: 'ri:contrast-line',
  },
  {
    label: 'Light',
    key: 'light',
    icon: 'ri:sun-foggy-line',
  },
  {
    label: 'Dark',
    key: 'dark',
    icon: 'ri:moon-foggy-line',
  },
]

const languageOptions: { label: string; key: Language; value: Language }[] = [
  { label: '简体中文', key: 'zh-CN', value: 'zh-CN' },
  { label: '繁體中文', key: 'zh-TW', value: 'zh-TW' },
  { label: 'English', key: 'en-US', value: 'en-US' },
  { label: '한국어', key: 'ko-KR', value: 'ko-KR' },
  { label: 'Русский язык', key: 'ru-RU', value: 'ru-RU' },
]

const headers = {
  Authorization: `Bearer ${token}`
}

/** 查询用户信息 */
async function getLoginUserInfo() {
  const [err, newUserInfo] = await to(getUserInfo());
  if (err) {
        message.error(err.toString())
  }
  if(newUserInfo){
    userBalance.value = newUserInfo.data.user.userBalance
    fileList.value[0].url = newUserInfo.data.user.avatar
    userGrade.value = newUserInfo.data.user.userGrade
    name.value =  newUserInfo.data.user.nickName
  }
}
/** 查询用户名称 */
async function updateUserInfo(nickName:string) {
  const [err] = await to(editUserNmae(nickName));
  if (err) {
        message.error(err.toString())
        return
  }
  ms.success(t('common.success'))
}

function handleFinish({
  event
}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) {
  const ext = (event?.target as XMLHttpRequest).response
  fileList.value[0].url = ext;
  message.success('上传成功！')
}



</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">头像</span>
        <n-upload action="/api/system/user/edit/avatar"
          :max=1
          list-type="image-card"
          :default-file-list="fileList"
          :headers="headers" @finish="handleFinish">
          点击上传
        </n-upload>
      </div>

      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">账户余额</span>
        <div class="flex-1">
          <span style="font-size:small">{{ userBalance }}</span>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">会员等级</span>
        <div class="flex-1">
          <n-tag type="success">
            <span v-if="userGrade == '0'">免费用户</span>
            <span v-if="userGrade == '1'">高级会员</span>
          </n-tag>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
        <div class="w-[200px]">
          <NInput v-model:value="name" placeholder="请输入用户名称" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo(name)">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.language') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <NSelect style="width: 140px" :value="language" :options="languageOptions"
            @update-value="value => appStore.setLanguage(value)" />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.theme') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <template v-for="item of themeOptions" :key="item.key">
            <NButton size="small" :type="item.key === theme ? 'primary' : undefined" @click="appStore.setTheme(item.key)">
              <template #icon>
                <SvgIcon :icon="item.icon" />
              </template>
            </NButton>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

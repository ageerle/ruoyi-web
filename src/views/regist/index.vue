<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { doRegist, getVerificationCode } from '@/api/user'
import defaultAvatar from '@/assets/avatar.jpg'
import { t } from '@/locales'
import { useBasicLayout } from '@/hooks/useBasicLayout'
const { isMobile } = useBasicLayout()

interface ModelType {
  password: string
  account: string,
  verificationCode: string
}

const router = useRouter()
const message = useMessage()
const user = ref<ModelType>(Object.create(null))

const handleValidateButtonClick = async (e: MouseEvent) => {
  e.preventDefault()
  const { account, password, verificationCode } = user.value
  if (!validateAccount(account)) {
    message.error(t('reset.invalid_account'))
    user.value.account = ''
    return
  }
  if (!verificationCode) {
    message.error(t('reset.empty_verification_code'))
    return
  }
  user.value.password = ''
  await doRegist(account, password, verificationCode)
  message.success(t('reset.registration_success'))
  router.push('/Login')
}

function validateAccount(account: string) {
  if (!account)
    return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(account);
}

const isCounting = ref(false)
const countdown = ref(60)
const buttonText = ref(t('reset.get_verification_code'))
async function startCountdown() {
  let checkResult = validateAccount(user.value.account)
  if (!checkResult) {
    message.warning(t('reset.invalid_account'))
  }

  if (isCounting.value) {
    return;
  }

  try {
    await getVerificationCode(user.value.account);
  } catch (error) {
    message.warning((error as Error).message)
  }

  isCounting.value = true;
  buttonText.value = countdown.value + t('reset.seconds_retry');

  const timer = setInterval(() => {
    countdown.value--;
    buttonText.value = countdown.value + t('reset.seconds_retry');

    if (countdown.value === 0) {
      clearInterval(timer);
      isCounting.value = false;
      countdown.value = 60;
      buttonText.value = t('reset.get_verification_code');
    }
  }, 1000);
}
</script>

<template>
  <div id="app">
    <br><br>
    <br><br>
    <div class="flex justify-center" data-v-0ee1b774="">
      <img style="width: 120px; height: 120px; border-radius: 60px;" :src="defaultAvatar" alt="Robot Icon" class="h-12 mt-8 w-fit hover:cursor-pointer md:mt-0 md:h-16" data-v-0ee1b774="">
    </div>
    <br>
    <div class="relative w-full mt-10 overflow-hidden bg-white shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:h-min sm:max-w-4xl sm:rounded-lg lg:max-w-5xl 2xl:max-w-6xl login-box" :style="{width: isMobile ? '100%' : '880px'}" data-v-0ee1b774="">
      <div class="px-6 pt-4 pb-8 sm:px-10 footer-login " data-v-0ee1b774="">
        <main class="mx-auto sm:max-w-4xl lg:max-w-5xl 2xl:max-w-6xl" data-v-0ee1b774="">
          <div class="nuxt-loading-indicator" style="position: fixed; top: 0px; right: 0px; left: 0px; pointer-events: none; width: 0%; height: 3px; opacity: 0; background: rgb(45, 212, 191); transition: width 0.1s ease 0s, height 0.4s ease 0s, opacity 0.4s ease 0s; z-index: 999999;"></div>
          <div>
            <div>
              <div class="flex flex-col justify-center min-h-full my-4 space-y-8 sm:px-6 lg:px-8">
                <div class="sm:mx-auto sm:w-full sm:max-w-md">
                  <h2 class="text-3xl font-bold tracking-tight text-center text-gray-900">{{ $t('register.create_account') }}</h2>
                  <p class="mt-2 text-sm text-center text-gray-600">
                    {{ $t('reset.or') }}
                    <a href="#/login" style="font-size: 18px; color: #0084FF" class="font-semibold text-teal-500 hover:text-teal-600">{{ $t('reset.login') }}</a>
                    {{ $t('reset.if_account') }}
                  </p>
                </div>
                <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                  <form class="space-y-6" :style="{width: !isMobile ? '580px' : 'calc(100% - 20px)', marginLeft: isMobile ? '10px' : 'calc(50% - 290px)'}">
                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700">{{ $t('reset.email') }}</label>
                      <div class="mt-1">
                        <input id="email" v-model="user.account" :allow-input="(val) => { return !/[^A-Za-z0-9_@.]/g.test(val) }" maxlength="32" :placeholder="$t('reset.enter_email')" name="email" type="email" autocomplete="email" required="true" class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm">
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">{{ $t('reset.verification_code') }}</label>
                      <div class="flex justify-between mt-1">
                        <input maxLength="6" v-model="user.verificationCode" :placeholder="$t('reset.enter_verification_code')" name="verification_code" type="text" required="true" class="w-2/3 px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm">
                        <button style="margin-top: 0;" type="button" @click="startCountdown" :disabled="isCounting" class="w-1/3 px-3 py-2 ml-2 text-sm font-medium text-white bg-teal-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">{{ buttonText }}</button>
                      </div>
                    </div>
                    <div>
                      <label for="password" class="block text-sm font-medium text-gray-700">{{ $t('reset.password') }}</label>
                      <div class="mt-1">
                        <input id="password" maxLength="16" v-model="user.password" :placeholder="$t('reset.enter_password')" name="password" type="password" required="true" class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm">
                      </div>
                    </div>
                    <div>
                      <button @click="handleValidateButtonClick" type="submit" class="flex inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition bg-teal-500 bg-teal-600 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-teal-800 hover:bg-teal-700 focus:ring-teal-500 hover:bg-teal-600 focus:ring-teal-400">
                        {{ $t('reset.register') }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style>

  #app {
    /* background-image: url('@/assets/background.jpg'); */
    background-color: #141718;
    background-size: cover;
    background-repeat: no-repeat;
  }

</style>

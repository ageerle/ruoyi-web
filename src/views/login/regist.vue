<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import {
  NButton, NInput, NSpin, NText, useMessage,
  NIcon, useThemeVars
} from "naive-ui";
import {
  PersonOutline,
  LockClosedOutline,
  KeyOutline,
  LogInOutline
} from '@vicons/ionicons5';

import { doRegist, getVerificationCode } from '@/api/user'
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const message = useMessage();
const themeVars = useThemeVars();

// 表单状态管理
const registerForm = reactive({
  username: '',
  code: '',
  password: '',
  confirmPassword: ''
});

// 加载状态管理
const registerLoading = ref(false);
const pageLoading = ref(false);

// 表单验证
const formErrors = reactive({
  username: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
});

// 验证表单
function validateForm() {
  let isValid = true;
  
  // 用户名验证
  if (!registerForm.username) {
    formErrors.username = t('register.invalid_account');
    isValid = false;
  } else if (registerForm.username.length < 3) {
    formErrors.username = t('register.usernameTooShort');
    isValid = false;
  } else {
    formErrors.username = '';
  }

  // 邮箱验证
  if (!registerForm.username) {
    formErrors.email = t('register.enter_email');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.username)) {
    formErrors.email = t('register.invalidEmail');
    isValid = false;
  } else {
    formErrors.email = '';
  }

  // 验证码验证
  if (!registerForm.code) {
    formErrors.code = t('register.codeRequired');
    isValid = false;
  } else {
    formErrors.code = '';
  }

  // 密码验证
  if (!registerForm.password) {
    formErrors.password = t('register.passwordRequired');
    isValid = false;
  } else if (registerForm.password.length < 6) {
    formErrors.password = t('register.passwordTooShort');
    isValid = false;
  } else {
    formErrors.password = '';
  }

  // 确认密码验证
  if (!registerForm.confirmPassword) {
    formErrors.confirmPassword = t('register.confirmPasswordRequired');
    isValid = false;
  } else if (registerForm.password !== registerForm.confirmPassword) {
    formErrors.confirmPassword = t('register.passwordMismatch');
    isValid = false;
  } else {
    formErrors.confirmPassword = '';
  }

  return isValid;
}

// 用户注册
async function handleRegister(e: MouseEvent) {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    registerLoading.value = true;
    await doRegist(
      registerForm.username,
      registerForm.password,
      registerForm.code,
    );
    message.success(t("register.registration_success"));
    router.push("/login");
  } catch (error: any) {
    message.error(error.message || t("register.registration_failed"));
  } finally {
    registerLoading.value = false;
  }
}

// 验证码发送相关
const isSending = ref(false);
const countdown = ref(60);
const codeButtonText = computed(() => {
  return isSending.value ? `${countdown.value}s` : t('register.get_verification_code');
});

async function sendVerificationCode() {
  // 验证邮箱
  if (!registerForm.username) {
    message.error("用户名不能为空!");
    return;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.username)) {
     message.error("请输入正确的邮箱!");
    return;
  }

  if (isSending.value) return;

  try {
    isSending.value = true;
    await getVerificationCode(registerForm.username);
    message.success(t('register.send_success'));
    
    // 开始倒计时
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        isSending.value = false;
      }
    }, 1000);
  } catch (error: any) {
    message.error(error.message || t("register.sendCodeFailed"));
    isSending.value = false;
  }
}

// 计算背景样式，适配暗黑模式
const brandSectionStyle = computed(() => {
  const isDark = themeVars.value.bodyColor.startsWith('#1') ||
    themeVars.value.bodyColor.startsWith('#2') ||
    themeVars.value.bodyColor.startsWith('#3');

  return {
    background: isDark
      ? 'linear-gradient(135deg, #003b8e, #0058d9)'
      : 'linear-gradient(135deg, #1867c0, #5cbbf6)'
  };
});
</script>

<template>
  <div class="login-container">
    <NSpin :show="pageLoading">
      <div class="login-content">
        <!-- 左侧品牌区域 -->
        <div class="brand-section" :style="brandSectionStyle">
          <div class="brand-content">
            <h1 class="brand-title">AI知识库系统</h1>
            <p class="brand-description">
              企业级智能知识管理平台，助力数字化转型
            </p>
          </div>
        </div>

        <!-- 右侧注册表单 -->
        <div class="form-wrapper">
  
          <div class="login-methods">
            <div class="active-method">{{ $t("register.create_account") }}</div>
          </div>

          <div class="form-content">
            <!-- 用户名输入 -->
            <div class="input-group">
              <div class="input-label-row">
                <NText strong class="input-label">
                  {{ $t("register.email") }}
                </NText>
                <div v-if="formErrors.username" class="error-message">{{ formErrors.username }}</div>
              </div>
              <NInput v-model:value="registerForm.username" :placeholder="$t('register.enter_email')" round clearable
                class="custom-input" :status="formErrors.username ? 'error' : undefined">
                <template #prefix>
                  <NIcon :component="PersonOutline" />
                </template>
              </NInput>
            </div>

            <!-- 验证码输入 -->
            <div class="input-group">
              <div class="input-label-row">
                <NText strong class="input-label">
                  {{ $t("register.verification_code") }}
                </NText>
                <div v-if="formErrors.code" class="error-message">{{ formErrors.code }}</div>
              </div>
              <div class="verification-code-row">
                <NInput v-model:value="registerForm.code" :placeholder="$t('register.enter_verification_code')" round
                  class="verification-input" :status="formErrors.code ? 'error' : undefined">
                  <template #prefix>
                    <NIcon :component="KeyOutline" />
                  </template>
                </NInput>
                <NButton :disabled="isSending" @click="sendVerificationCode" class="send-code-button">
                  {{ codeButtonText }}
                </NButton>
              </div>
            </div>

            <!-- 密码输入 -->
            <div class="input-group">
              <div class="input-label-row">
                <NText strong class="input-label">
                  {{ $t("register.password") }}
                </NText>
                <div v-if="formErrors.password" class="error-message">{{ formErrors.password }}</div>
              </div>
              <NInput v-model:value="registerForm.password" type="password" :placeholder="$t('register.enter_password')" round
                show-password-on="click" class="custom-input" :status="formErrors.password ? 'error' : undefined">
                <template #prefix>
                  <NIcon :component="LockClosedOutline" />
                </template>
              </NInput>
            </div>

            <!-- 确认密码输入 -->
            <div class="input-group">
              <div class="input-label-row">
                <NText strong class="input-label">
                  {{ $t("register.confirm_password") }}
                </NText>
                <div v-if="formErrors.confirmPassword" class="error-message">{{ formErrors.confirmPassword }}</div>
              </div>
              <NInput v-model:value="registerForm.confirmPassword" type="password" :placeholder="$t('register.enter_confirm_password')" round
                show-password-on="click" class="custom-input" :status="formErrors.confirmPassword ? 'error' : undefined">
                <template #prefix>
                  <NIcon :component="LockClosedOutline" />
                </template>
              </NInput>
            </div>

            <!-- 注册按钮 -->
            <div class="action-buttons">
              <NButton type="primary" block :loading="registerLoading" @click="handleRegister" class="register-button">
                <template #icon>
                  <NIcon :component="LogInOutline" />
                </template>
                {{ $t("register.register") }}
              </NButton>
            </div>

            <!-- 返回登录 -->
            <div class="login-prompt">
              {{ $t("register.if_account") }}
              <NButton text type="primary" @click="router.push('/login')">
                {{ $t("register.go_login") }}
              </NButton>
            </div>
          </div>
        </div>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--n-body-color);
  padding: 20px;
}

.login-content {
  display: flex;
  width: 900px;
  max-width: 100%;
  min-height: 500px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

html.dark .login-content {
  outline: 2px solid rgb(17, 19, 17) !important;
}

/* 左侧品牌区域 */
.brand-section {
  flex: 1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.brand-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;
}

.brand-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 300px;
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.9);
}

/* 右侧表单区域 */
.form-wrapper {
  flex: 1;
  background: var(--n-color-modal);
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.form-title {
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-methods {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.active-method {
  font-size: 16px;
  font-weight: 500;
  color: var(--n-text-color);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--n-primary-color);
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.input-label {
  font-size: 14px;
}

.error-message {
  font-size: 12px;
  color: var(--n-error-color);
}

.custom-input {
  transition: all 0.3s ease;
}

.verification-code-row {
  display: flex;
  gap: 10px;
}

.verification-input {
  flex: 1;
}

.send-code-button {
  min-width: 100px;
}

.action-buttons {
  margin-bottom: 1.5rem;
}

.register-button {
  height: 40px;
  font-size: 16px;
}

.login-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--n-text-color-3);
  margin-top: auto;
  padding-top: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
    width: 100%;
  }

  .brand-section {
    padding: 30px;
    min-height: 150px;
  }

  .form-wrapper {
    padding: 30px 20px;
  }

  .brand-title {
    font-size: 2rem;
  }
  
  .verification-code-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .send-code-button {
    width: 100%;
  }
}
</style>

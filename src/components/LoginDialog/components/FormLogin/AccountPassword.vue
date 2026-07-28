<!-- 账号密码登录表单 -->
<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
import type { LoginDTO } from '@/api/auth/types';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/api';
import { useUserStore } from '@/stores';
import { useLoginFormStore } from '@/stores/modules/loginForm';
import { useSessionStore } from '@/stores/modules/session';

const userStore = useUserStore();
const sessionStore = useSessionStore();
const loginFromStore = useLoginFormStore();

const formRef = ref<FormInstance>();
const isSubmitting = ref(false);

const formModel = reactive<LoginDTO>({
  username: '',
  password: '',
  clientId: import.meta.env.VITE_CLIENT_ID,
  grantType: 'password',
  tenantId: '000000',
  uuid: 'a5705def96be468f80e4b8bde3127c31',
});

const rules = reactive<FormRules<LoginDTO>>({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入登录密码', trigger: 'blur' }],
});

const router = useRouter();
async function handleSubmit() {
  if (isSubmitting.value)
    return;

  try {
    isSubmitting.value = true;
    await formRef.value?.validate();
    const res = await login(formModel);
    const loginData = res?.data ?? res;
    const token = loginData?.access_token || loginData?.token;
    if (!token)
      throw new Error('登录响应中缺少访问令牌');
    userStore.setToken(token);
    // res.data.userInfo && userStore.setUserInfo(res.data.userInfo);
    userStore.resetAuthExpiredHandling();
    ElMessage.success('登录成功');
    userStore.closeLoginDialog();
    // 立刻获取回话列表
    await sessionStore.requestSessionList(1, true);
    const redirectPath = userStore.consumeLoginRedirectPath();
    router.replace(redirectPath || '/');
  }
  catch (error) {
    console.error('请求错误:', error);
    ElMessage.error(error instanceof Error ? error.message : '登录失败，请稍后重试');
  }
  finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="custom-form">
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      class="login-form"
      @submit.prevent="handleSubmit"
    >
      <el-form-item prop="username">
        <el-input v-model="formModel.username" placeholder="请输入账号">
          <template #prefix>
            <el-icon>
              <User />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="formModel.password"
          placeholder="请输入登录密码"
          type="password"
          show-password
        >
          <template #prefix>
            <el-icon>
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          class="submit-btn"
          type="primary"
          native-type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          立即登录
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 注册登录 -->
    <div class="form-tip font-size-12px flex items-center">
      <span>没有账号，</span>
      <span class="link-action" @click="loginFromStore.setLoginFormType('RegistrationForm')">
        立即注册
      </span>
    </div>
    <p class="security-tip">
      登录即代表你同意平台服务条款，我们会妥善保护你的账号信息。
    </p>
  </div>
</template>

<style scoped lang="scss">
.custom-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-form {
  width: 100%;
}

.submit-btn {
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgb(37 99 235 / 18%);
}

.link-action {
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
}

.security-tip {
  margin: 0;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.6;
}

:deep(.el-input__wrapper) {
  min-height: 44px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgb(148 163 184 / 18%);
}

:deep(.el-input__inner) {
  font-size: 13px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px rgb(37 99 235 / 48%);
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-form-item__error) {
  padding-top: 5px;
  font-size: 12px;
  line-height: 1.25;
}
</style>

<!-- 注册表单 -->
<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
import type { RegisterDTO } from '@/api/auth/types';
import { useCountdown } from '@vueuse/core';
import { reactive, ref } from 'vue';
import { emailCode, register } from '@/api';
import { useLoginFormStore } from '@/stores/modules/loginForm';

const loginFromStore = useLoginFormStore();
const countdown = shallowRef(60);
const { start, stop, resume } = useCountdown(countdown, {
  onComplete() {
    resume();
  },
  onTick() {
    countdown.value--;
  },
});

const formRef = ref<FormInstance>();

const formModel = ref<RegisterDTO>({
  username: '',
  password: '',
  code: '',
  confirmPassword: '',
});

const rules = reactive<FormRules<RegisterDTO>>({
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (value !== formModel.value.password) {
          return new Error('两次输入的密码不一致');
        }
        return true;
      },
      trigger: 'change',
    },
  ],
  username: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (!isEmail(value)) {
          return new Error('请输入正确的邮箱');
        }
        return true;
      },
      trigger: 'blur',
    },
  ],
});

function isEmail(email: string) {
  const emailRegex = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;
  return emailRegex.test(email);
}
async function handleSubmit() {
  try {
    await formRef.value?.validate();
    const params: RegisterDTO = {
      username: formModel.value.username,
      password: formModel.value.password,
      code: formModel.value.code,
      // 后端 RegisterBody 继承自 LoginBody，clientId / grantType 为必填项，
      // 且需指定租户，否则注册会被 @Validated 拦截或落到空租户。
      clientId: import.meta.env.VITE_CLIENT_ID,
      grantType: 'password',
      tenantId: '000000',
    };
    await register(params);
    ElMessage.success('注册成功');
    formRef.value?.resetFields();
    resume();
  }
  catch (error) {
    console.error('请求错误:', error);
  }
}

// 获取验证码
async function getEmailCode() {
  if (formModel.value.username === '') {
    ElMessage.error('请输入邮箱');
    return;
  }
  if (!isEmail(formModel.value.username)) {
    return;
  }
  if (countdown.value > 0 && countdown.value < 60) {
    return;
  }
  try {
    start();
    // 后端按 query 参数 email 接收，用户端把邮箱放在 username 字段输入。
    await emailCode({ email: formModel.value.username });
    ElMessage.success('验证码发送成功');
  }
  catch (error) {
    console.error('请求错误:', error);
    stop();
  }
}
</script>

<template>
  <div class="custom-form">
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      class="register-form"
      @submit.prevent="handleSubmit"
    >
      <el-form-item prop="username">
        <el-input v-model="formModel.username" placeholder="请输入邮箱" autocomplete="off">
          <template #prefix>
            <el-icon>
              <Message />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="code">
        <el-input v-model="formModel.code" placeholder="请输入验证码" autocomplete="off">
          <template #prefix>
            <el-icon>
              <Bell />
            </el-icon>
          </template>

          <template #suffix>
            <div class="code-trigger" @click="getEmailCode">
              {{ countdown === 0 || countdown === 60 ? "获取验证码" : `${countdown} s` }}
            </div>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input v-model="formModel.password" placeholder="请输入密码" autocomplete="off">
          <template #prefix>
            <el-icon>
              <Unlock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input v-model="formModel.confirmPassword" placeholder="请确认密码" autocomplete="off">
          <template #prefix>
            <el-icon>
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="submit-btn" type="primary" native-type="submit">
          注册
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 返回登录 -->
    <div class="form-tip font-size-12px flex items-center">
      <span>已有账号，</span>
      <span
        class="link-action"
        @click="loginFromStore.setLoginFormType('AccountPassword')"
      >
        返回登录
      </span>
    </div>
    <p class="security-tip">
      注册即代表你同意平台服务条款，邮箱仅用于验证身份与账号安全。
    </p>
  </div>
</template>

<style scoped lang="scss">
.custom-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.register-form {
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

.code-trigger {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  cursor: pointer;
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
  min-height: 42px;
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
  margin-bottom: 16px;
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

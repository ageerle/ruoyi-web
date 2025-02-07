<template>
  <n-card title="微信机器人" :bordered="false" v-if="showCard">
    <div class="top-controls">
      <p class="assistant-title">{{ botName }}</p>
      <n-button type="info" tertiary @click="getQrCode">刷新二维码</n-button>
      <n-button type="error" tertiary @click="out">退出登录</n-button>
      <!-- <n-button type="info" tertiary @click="login">检查登录</n-button>
      <n-button type="info" tertiary @click="initData">初始化</n-button> -->
      <n-button type="warning" tertiary>配置</n-button>
      <n-button type="success" tertiary>修改</n-button>
      <n-button type="error" tertiary>删除</n-button>
    </div>
    <n-alert type="warning">
      <!-- 假设使用一个简单的图标，例如来自字体图标库的 -->
      <i class="icon-class">🔔</i> <!-- 使用表情符号作为图标示例 -->
      请尽快用手机微信扫码确认登录
    </n-alert>
    <div class="qr-code">
      <n-image :src=qrCode> </n-image>
    </div>
    <div class="bottom-buttons">
    </div>
  </n-card>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { NAlert, NImage, NCard, NButton, useMessage } from 'naive-ui';
import { getQr, wxlogin, wxinit, wxLogout, getRobConfigByUser } from '@/api/bot';
import to from 'await-to-js';
const message = useMessage();
const showCard = ref(false);
const qrCode = ref('');
const botName = ref('');
const uniqueKey = ref('');

// 定义轮询间隔时间
let intervalId: string | number | NodeJS.Timer | undefined;
const POLLING_INTERVAL = 10000;

onMounted(async () => {
  getList()
});

async function getList() {
  const [err, result] = await to(getRobConfigByUser());
  if (err) {
    message.error(err.message);
  } else {
    if (result.data.length > 0) {
      showCard.value = true
      // 给机器人名称赋值
      botName.value = result.data[0].botName
      uniqueKey.value = result.data[0].uniqueKey
    } else {
      showCard.value = false
      message.error("暂无权限,请联系管理员开通!");
    }
  }
}

/**
 * 加载二维码数据
 */
async function getQrCode() {
  const [err, result] = await to(getQr(uniqueKey.value))
  if (err) {
    message.error(err.message);
  } else {
    qrCode.value = result as unknown as string

    // 开始定时器
    intervalId = setInterval(login, POLLING_INTERVAL);
  }
}

onUnmounted(() => {
  // 页面组件卸载前清除定时器，避免内存泄漏
  if (intervalId !== undefined) {
    clearInterval(intervalId);
  }
});

// 查询登录状态
async function login() {
  const [err, result] = await to(wxlogin(uniqueKey.value));
  if (err) {
    message.error(err.message)
    clearInterval(intervalId);
  } else {
    if (result) {
      clearInterval(intervalId);
      message.success("登录成功,正在加载数据!")
      initData()
    }
  }
}

/**
 * 初始化数据
 */
async function initData() {
  const [err] = await to(wxinit(uniqueKey.value));
  if (err) {
    message.error(err.message)
  } else {
    message.success("数据加载完成!")
  }
}

/**
 * 退出登录
 */
async function out() {
  const [err] = await to(wxLogout(uniqueKey.value));
  if (err) {
    message.error(err.message)
  } else {
    message.success("已退出登录!")
  }
}

</script>


<style scoped>
.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* 使用视口高度确保垂直居中 */
  padding: 20px;
  /* 防止卡片触碰到视口边缘 */
}

.n-card {
  width: 100%;
  /* 或者可以设置为具体宽度，例如 600px */

}

.n-button {
  margin-right: 10px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.top-controls,
.bottom-buttons,
.qr-code {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-controls {
  justify-content: space-between;
  /* 确保元素在容器两端 */
  height: 60px;
  /* 增加高度 */
}

.qr-code {
  justify-content: center;
  padding: 20px 0;
  /* 给二维码增加上下间隔 */
}

.bottom-buttons {
  justify-content: space-between;
}

.assistant-title {
  font-size: 20px;
  flex-grow: 1;
  /* 让标题占据多余的空间，推动按钮到右侧 */
}

/* 设置 n-alert 为 flex 容器，使其内容居中 */
.n-alert {

  display: flex;
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  text-align: center;
  /* 文本居中 */
}
</style>
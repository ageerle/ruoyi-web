<script setup lang='ts'>
import { computed, ref, onUnmounted, watch } from 'vue'
import { NModal, NButton, NImage, NInput, NDivider, NCard, NIcon, NSpace, NTag } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { payUrl, getOrderInfo } from '@/api/pay'
import to from "await-to-js"
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { 
  AtCircle as MessageIcon,
  RocketOutline as RobotIcon,
  ImageOutline as ImageIcon
} from '@vicons/ionicons5'

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()
const { isMobile } = useBasicLayout()
const emit = defineEmits<Emit>()

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

const message = useMessage()

// 支付相关状态
const showPayModal = ref(false)
const imageUrl = ref("")
const orderMoney = ref("9.9")
const orderName = ref("初级套餐")
const orderNo = ref("")
let intervalId: string | number | NodeJS.Timer | undefined;

// 获取支付二维码
async function getPayUrl(money: string, name: string) {
  try {
    const response = await payUrl({ money: money, name: name });
    imageUrl.value = response.data.url;
    orderMoney.value = money
    orderName.value = name
    orderNo.value = response.data.orderNo
    showPayModal.value = true
    intervalId = setInterval(fetchData, POLLING_INTERVAL);
  } catch (error) {
    message.error('获取支付二维码失败')
  }
}

// 获取订单信息
async function fetchData() {
  const [err, result] = await to(getOrderInfo(orderNo.value));
  if (err) {
    message.error(err.message)
    showPayModal.value = false;
    clearInterval(intervalId);
  } else {
    if (result.data.paymentStatus === '2') {
      message.success('您的订单已成功支付。感谢您的购买。')
      showPayModal.value = false;
      clearInterval(intervalId);
    }
  }
}

// 定义轮询间隔时间，例如每5秒轮询一次
const POLLING_INTERVAL = 5000;

onUnmounted(() => {
  if (intervalId !== undefined) {
    clearInterval(intervalId);
  }
});

// 监听showPayModal,如果弹框关闭了,则取消定时器
watch(showPayModal, (newValue) => {
  if (!newValue) {
    clearInterval(intervalId);
  }
});

// 充值金额选项
const defaultAmounts = ref([
  { value: '9.9', label: '¥9.9', name: '初级套餐' },
  { value: '29.9', label: '¥29.9', name: '标准套餐' },
  { value: '59.9', label: '¥59.9', name: '高级套餐' }
])

// 自定义金额输入
const customAmount = ref('')
const selectedAmount = ref('9.9')
const isCustomAmount = ref(false)

// 获取当前选择的金额
const currentAmount = computed(() => {
  return isCustomAmount.value ? customAmount.value : selectedAmount.value
})

// 获取当前套餐名称
const currentPlanName = computed(() => {
  if (isCustomAmount.value) {
    return `自定义充值${customAmount.value}元`
  }
  const plan = defaultAmounts.value.find(item => item.value === selectedAmount.value)
  return plan ? plan.name : '初级套餐'
})

// 修改支付函数
async function handleRecharge() {
  if (isCustomAmount.value && (!customAmount.value || isNaN(Number(customAmount.value)))) {
    message.error('请输入有效的充值金额')
    return
  }
  
  const amount = currentAmount.value
  loading.value = true
  
  try {
    // 演示模式下
    message.success('本系统仅用于演示，暂不支持此功能！')
    // 模拟获取支付二维码
    setTimeout(() => {
      loading.value = false
      // 这里可以改为真实的支付二维码URL
      imageUrl.value = 'https://ts.tc.mm.bing.net'
      orderMoney.value = amount
      orderName.value = currentPlanName.value
      showPayModal.value = true
    }, 1000)
    
    // 实际环境下取消注释以下代码
    // await getPayUrl(amount, currentPlanName.value)
  } catch (error) {
    message.error('充值请求失败')
  } finally {
    loading.value = false
  }
}

const loading = ref<boolean>(false)

// 模型能力分类
const modelFeatures = [
  {
    title: '对话模型',
    icon: MessageIcon,
    items: ['通义千问', '文心一言', '讯飞星火', '智谱清言(ChatGLM)', '月之暗面(Kimi)', 'ChatGPT(3.5、4.0)']
  },
  {
    title: '图像生成',
    icon: ImageIcon,
    items: ['多模型支持', '更高分辨率1024*1024', '更好画图效果，支持MJ/SD']
  },
  {
    title: 'AI工具',
    icon: RobotIcon,
    items: ['文档对话，支持pdf、png等', '知识库在线问答']
  }
]
</script>

<template>
  <NModal 
    v-model:show="show" 
    :auto-focus="false" 
    preset="card" 
    style="max-width: 900px; position: fixed; left: 50%; top: 5vh; transform: translate(-50%, 0%);"
    :class="[isMobile ? 'mobile-recharge-modal' : 'recharge-modal']"
  >
    <div class="recharge-container" :class="{ 'mobile-layout': isMobile }">
      <!-- 左侧功能介绍 -->
      <div class="features-section" v-if="!isMobile">
        <h2 class="features-title">AI 平台能力</h2>
        
        <div v-for="(category, idx) in modelFeatures" :key="idx" class="feature-category">
          <div class="category-header">
            <n-icon size="20" :component="category.icon" />
            <span>{{ category.title }}</span>
          </div>
          
          <div class="feature-items">
            <n-tag 
              v-for="(item, i) in category.items" 
              :key="i"
              type="info"
              size="medium"
              class="feature-tag"
            >
              {{ item }}
            </n-tag>
          </div>
        </div>
        
        <div class="feature-footer">
          <p>充值后即可解锁全部高级功能</p>
        </div>
      </div>
      
      <!-- 右侧充值区域 -->
      <div class="payment-section">
        <h2 class="recharge-title">{{ $t('setting.recharge') }}</h2>
        
        <div class="amount-options">
          <div 
            v-for="(option, index) in defaultAmounts" 
            :key="index"
            class="amount-option" 
            :class="{ active: selectedAmount === option.value && !isCustomAmount }"
            @click="selectedAmount = option.value; isCustomAmount = false"
          >
            <div class="option-label">{{ option.label }}</div>
            <div class="option-name">{{ option.name }}</div>
          </div>
          <div 
            class="amount-option custom-option" 
            :class="{ active: isCustomAmount }"
            @click="isCustomAmount = true"
          >
            <div class="option-label">自定义</div>
          </div>
        </div>
        
        <div v-if="isCustomAmount" class="custom-amount-input">
          <n-input 
            v-model:value="customAmount" 
            type="text" 
            placeholder="请输入充值金额" 
            clearable
          >
            <template #prefix>¥</template>
          </n-input>
        </div>
        
        <div class="selected-amount">
          <span class="amount-label">充值金额：</span>
          <span class="amount-value">¥{{ currentAmount }}</span>
        </div>
        
        <n-button 
          type="primary" 
          block 
          :loading="loading" 
          @click="handleRecharge"
          class="recharge-button"
        >
          立即充值
        </n-button>
        
        <!-- 支付二维码区域 - 直接嵌入在右侧区域底部 -->
   <div v-if="showPayModal" class="payment-qrcode-container">
    <n-divider>支付方式</n-divider>
    <div class="qrcode-wrapper">
      <n-image width="200" height="200" object-fit="contain" :src="imageUrl" />
    </div>
    <p class="payment-instruction">请使用微信扫码支付{{ orderMoney }}元</p>
    <p class="payment-note">支付完成后将自动为您开通服务</p>
  </div>
      </div>
    </div>
  </NModal>
</template>

<style scoped>
.recharge-container {
  display: flex;
  gap: 24px;
}

.mobile-layout {
  flex-direction: column;
}

/* 左侧功能介绍区域 */
.features-section {
  flex: 1;
  padding: 20px;
  border-right: 1px solid var(--border-color, #e4e4e4);
}

.features-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 24px;
  text-align: center;
}

.feature-category {
  margin-bottom: 20px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}

.feature-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-tag {
  margin-bottom: 8px;
}

.feature-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 14px;
  color: var(--text-color-secondary, #999);
}

/* 右侧充值区域 */
.payment-section {
  flex: 1;
  padding: 20px;
  min-width: 300px;
}

.recharge-title {
  text-align: center;
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 500;
}

.amount-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.amount-option {
  padding: 16px 12px;
  text-align: center;
  border: 1px solid var(--border-color, #e4e4e4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-label {
  font-size: 18px;
  font-weight: 500;
}

.option-name {
  font-size: 12px;
  margin-top: 4px;
  color: var(--text-color-secondary, #999);
}

/* 悬停样式 */
.amount-option:hover {
  border-color: var(--primary-color, #eaeef3);
  /* 不修改文字颜色，保持与主题色一致 */
}

/* 选中样式 - 亮色模式 */
.amount-option.active {
  background-color: rgba(var(--primary-color-rgb, 32, 128, 240), 0.1);
  border-color: var(--primary-color, #e6ecf3);
}

/* 选中样式 - 暗黑模式 */
:root[data-theme='dark'] .amount-option.active {
  background-color: rgba(var(--primary-color-rgb, 64, 158, 255), 0.15);
  border-color: var(--primary-color, #0d0d0d);
}

/* 确保暗黑模式下的文字颜色可见 */
:root[data-theme='dark'] .option-name {
  color: var(--text-color-secondary, #aaa);
}

.custom-amount-input {
  margin-bottom: 20px;
}

.selected-amount {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  font-size: 16px;
}

.amount-value {
  color: var(--primary-color, #2080f0);
  font-weight: bold;
  margin-left: 8px;
}

/* 暗黑模式下金额值颜色调整 */
:root[data-theme='dark'] .amount-value {
  color: var(--primary-color, #409eff);
}

.recharge-button {
  height: 44px;
  font-size: 16px;
}
/* 二维码容器样式调整 */
.qrcode-wrapper {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #fff;
  border-radius: 4px;
}

/* 支付二维码区域样式 */
.payment-qrcode-container {
  margin-top: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  background-color: var(--card-color, #f9f9f9);
  border: 1px solid var(--border-color, #eee);
  transition: all 0.3s;
}

.payment-instruction {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color, #333);
}

.payment-note {
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-color-secondary, #999);
}

/* 暗黑模式适配 */
:root[data-theme='dark'] .payment-qrcode-container {
  background-color: var(--card-color, #333);
  border-color: var(--border-color, #444);
}

/* 移动端适配 */
.mobile-recharge-modal {
  width: 95%;
  max-width: 100%;
  margin: 0;
  top: 0 !important;
}

@media (max-width: 768px) {
  .amount-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .payment-qrcode-container {
    padding: 12px;
  }
  
  .payment-instruction {
    font-size: 14px;
  }
  
  .payment-note {
    font-size: 12px;
  }
}
</style>

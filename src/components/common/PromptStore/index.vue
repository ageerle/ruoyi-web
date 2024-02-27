<script setup lang='ts'>
import { computed, ref, onUnmounted, watch } from 'vue'
import { NCard, NTag, NSpace, NModal, NTabs, NButton, NTabPane, NImage, NTable} from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useMessage } from 'naive-ui'
import { payUrl, getOrderInfo } from '@/api/pay'
import to from "await-to-js";

interface Props {
	visible: boolean,
	title: string
}

interface Emit {
	(e: 'update:visible', visible: boolean): void
}
const props = defineProps<Props>()

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

const showMeVisible = ref(false)
const imageUrl = ref("")
const orderMoney = ref("9.9")
const orderName = ref("初级套餐")
const orderNo = ref("")
let intervalId: string | number | NodeJS.Timer | undefined;
// 获取支付二维码
async function getPayUrl(money: string, name: string) {
	showMeVisible.value = true;
	const response = await payUrl({ money: money, name: name });
	console.log("response===", response)
	imageUrl.value = response.data.url;
	orderMoney.value = money
	orderName.value = name
	orderNo.value = response.data.orderNo
	intervalId = setInterval(fetchData, POLLING_INTERVAL);
}

// 获取订单信息
async function fetchData() {
	const [err, result] = await to(getOrderInfo(orderNo.value));
	console.log("result===", result)
	if (err) {
		message.error(err.message)
		showMeVisible.value = false;
		// 停止轮询
		clearInterval(intervalId);
	} else {
		if (result.data.paymentStatus === '2') {
			message.success('您的订单已成功支付。感谢您的购买。')
			showMeVisible.value = false;
			// 停止轮询
			clearInterval(intervalId);
		}
	}
}

// 定义轮询间隔时间，例如每5秒轮询一次
const POLLING_INTERVAL = 5000;

onUnmounted(() => {
	// 页面组件卸载前清除定时器，避免内存泄漏
	if (intervalId !== undefined) {
		clearInterval(intervalId);
	}
});

// 监听showMeVisible,如果弹框关闭了,则取消定时器
watch(showMeVisible, (newValue, oldValue) => {
	if (!newValue) {
		// 页面关闭了,停止轮询
		clearInterval(intervalId);
	}
});


</script>

<template>
	<NModal v-model:show="show" :auto-focus="false" preset="card" style="max-width: 1100px;">
		<n-tabs type="line" size="large" :tabs-padding="20" pane-style="padding: 20px;">
			<n-tab-pane name=" 订阅计划">
				<div style=" display: flex; overflow: auto;
					justifyContent: center;
					alignItems: center;">

					<n-card title="初级套餐" hoverable :bordered="false" :segmented="{
						content: true,
						footer: 'soft'
					}">
						<template #header-extra>
							<span style="font-size: 20px;font-weight: bold;">9.9元</span>
						</template>

						<n-space vertical>
							<n-tag type="success" :bordered="false">
								解锁全部模型
							</n-tag>

							<n-tag type="success" :bordered="false">
								dall·e 3
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>

							<n-tag type="success" :bordered="false">
								midjourney
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								gpt-3.5-turbo-1106
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								gpt-4-1106-preview
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								gpt-4-1106-vision-preview
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>

						</n-space>
						<template #footer>
							<div @click="getPayUrl('9.9', '初级套餐')" class="outer-container">
									<NButton>
										立即充值
									</NButton>
							</div>
						</template>
					</n-card>

					<n-card title="中级套餐" hoverable :bordered="false" :segmented="{
						content: true,
						footer: 'soft'
					}">
						<template #header-extra>
							<span style="font-size: 20px;font-weight: bold;">30元</span>
						</template>
						<n-space vertical>
							<n-tag type="success" :bordered="false">
								解锁全部模型
							</n-tag>

							<n-tag type="success" :bordered="false">
								dall·e 3
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>

							<n-tag type="success" :bordered="false">
								midjourney
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								gpt-3.5-turbo-1106
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								gpt-4-1106-preview
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								gpt-4-1106-vision-preview
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="error" size="large"  :bordered="false">
							    限时双倍活动 充30送30
							</n-tag>
							<!-- <n-tag type="success" :bordered="false">
								10次退还卡
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								50次免费mj绘图
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag> -->
						</n-space>

						<template #footer>
							<div @click="getPayUrl('30', '中级套餐')"  class="outer-container">
									<NButton>
										立即充值
									</NButton>
								</div>
						</template>
					</n-card>

					<n-card title="高级套餐" hoverable :bordered="false" :segmented="{
						content: true,
						footer: 'soft'
					}">
						<template #header-extra>
							<span style="font-size: 20px;font-weight: bold;">60元</span>
						</template>
						<n-space vertical>
							<n-tag type="success" :bordered="false">
								解锁全部模型
							</n-tag>

							<n-tag type="success" :bordered="false">
								dall·e 3
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>

							<n-tag type="success" :bordered="false">
								midjourney
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								gpt-3.5-turbo-1106
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								gpt-4-1106-preview
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								gpt-4-1106-vision-preview
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>

							<n-tag type="error" size="large"  :bordered="false">
							    限时双倍活动 充60送60
							</n-tag>
							<!-- <n-tag type="success" :bordered="false">
								30次退还卡
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag>
							<n-tag type="success" :bordered="false">
								200次免费mj绘图
								<template #icon>
									<SvgIcon icon="icon-park-twotone:correct" />
								</template>
							</n-tag> -->
						</n-space>

						<template #footer>
							<div @click="getPayUrl('60', '高级套餐')" class="outer-container">
									<NButton>
										立即充值
									</NButton>
							</div>
						</template>
					</n-card>
				</div>
			</n-tab-pane>
			<n-tab-pane name="收费标准">
				<div style=" display: flex; overflow: auto;
					justifyContent: center;
					alignItems: center;">
						<n-table :bordered="false" :single-line="false">

							<thead>
							<tr>
								<th>模型名称(通常1000个Token约等于750个英文单词或者400~500个汉字)</th>
								<th>价格</th>
								<th>说明</th>
							</tr>
							</thead>
							<tbody>
							<tr>
								<td>gpt-3.5-turbo-1106</td>
								<td>0.03元/1K tokens</td>
								<td>GPT3.5最新模型,用于文本生成、对话系统、内容摘要等</td>
							</tr>
							<tr>
								<td>net-gpt-3.5-turbo</td>
								<td>0.03元/次</td>
								<td>使用langchain 实现的联网功能，联网没有上下文</td>
							</tr>
							<tr>
								<td>net-gpt-4</td>
								<td>0.03元/次</td>
								<td>使用langchain 实现的联网功能，联网没有上下文</td>
							</tr>
							<tr>
								<td>gpt-4-1106-preview</td>
								<td>0.3元/1K tokens</td>
								<td>最新版GPT-4,相对GPT-3.5更先进、拥有更多的参数和更强大的语言处理能力</td>

							</tr>
							<tr>
								<td>gpt-4-1106-vision-preview</td>
								<td>0.3元/1K tokens</td>
								<td> GPT-4 的一个包含视觉处理能力的预览版本，结合了视觉信息处理的能力</td>
							</tr>
							<tr>
								<td>gpt4all</td>
								<td>0.3元/次</td>
								<td>同时拥有联网查询，高级数据分析，画图 DALL.E功能,GPT 会自动识别并调取相关能力工具</td>

							</tr>
							<tr>
								<td>gpt-4-gizmo</td>
								<td>0.3元/次</td>
								<td>gpts商店中的模型,使用方式:gpt-4-gizmo-g-xxx</td>
							</tr>
							<tr>
								<td>dall·e 3</td>
								<td>0.3元/次</td>
								<td>DALL·E 是一个专注于图像生成的模型</td>

							</tr>
							<tr>
								<td>dall·e 3(1790px)</td>
								<td>0.6元/次</td>
								<td>DALL·E 是一个专注于图像生成的模型</td>
							</tr>
							<tr>
								<td>midjourney</td>
								<td>0.3元/次</td>
								<td>目前最强的AI绘图模型</td>
							</tr>
							</tbody>
						</n-table>
				</div>
			</n-tab-pane>
		</n-tabs>
	</NModal>

	<NModal v-model:show="showMeVisible" :title="orderName" :auto-focus="false" preset="card"
		style="width: 95%; max-width: 266px;">
    <n-image
      width="220"
      :src="imageUrl"
    />
		<span v-if="orderMoney">请使用微信扫码支付{{ orderMoney }}元</span>
	</NModal>
</template>
<style scoped>
.n-card {
	max-width: 280px;
	height: 500PX;
	margin-left: 30px;
	margin-right: 30px;
}

.n-gradient-text {
	font-size: 18px;
}

.outer-container {
    display: flex; /* 设置外部容器为 Flexbox */
    justify-content: center; /* 水平居中对齐子项目 */
}
</style>

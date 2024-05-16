<script setup lang='ts'>
import { computed, ref, onUnmounted, watch, h, onMounted } from 'vue'
import { NCard, NTag, NSpace, NModal, NTabs, NButton, NTabPane, NImage, NDataTable } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useMessage } from 'naive-ui'
import { payUrl, getOrderInfo } from '@/api/pay'
import { list } from '@/api/model'

import to from "await-to-js";

onMounted(() => {
	// 查询模型未隐藏信息
	modeList()
});

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

const pagination = ref({
	page: 1,
	pageSize: 10,
	showSizePicker: true,
	pageSizes: [10, 20, 30, 40],
	onChange: (page: number) => {
		pagination.value.page = page;
	},
	onUpdatePageSize: (pageSize: number) => {
		pagination.value.pageSize = pageSize;
		pagination.value.page = 1;
	}
});

const createColumns = () => {
	return [
		...(false
			? [{
				title: '主键',
				key: 'id',
				width: 80,
				ellipsis: true,
			}]
			: []),
		{
			title: '模型名称',
			key: 'modelDescribe'
		},
		{
			title: '价格',
			key: 'modelPrice'
		},
		{
			title: '计费方式',
			key: 'modelType',
			render: (row: any) => {
				let text, type;
				switch (row.modelType) {
					case "1":
						text = 'token计费';
						type = 'success'; // 绿色标签
						break;
					case "2":
						text = '次数计费';
						type = 'info'; // 蓝色标签
						break;
					default:
						text = '未知计费方式';
						type = 'default'; // 默认灰色标签
				}
				// 直接使用导入的 NTag 组件，设置相应的属性
				return h(NTag, {
					type: type,
					size: 'medium',
					round: true
				}, {
					default: () => text
				});
			}
		},
		{
			title: '备注',
			key: 'remark'
		},

	]
}
const columns = ref(createColumns());

const tableData = ref([]);

const modeList = async () => {
	try {
		// 发起一个请求
		const [err, result] = await to(list());

		if (err) {
			message.error(err.message)
		} else {
			tableData.value = result.rows
		}
	} catch (error) {
		console.error('Error fetching data:', error);
	}
};
</script>



<template>
	<NModal v-model:show="show" :auto-focus="false" preset="card" style="max-width: 1100px;">
		<n-tabs type="line" size="large" :tabs-padding="20" pane-style="padding: 20px;">
			<n-tab-pane name=" 订阅计划">
				<div style=" display: flex; overflow: auto;">
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
				<span style="color: red;">1000个Token大约相当于750个英文单词或400至500个汉字。在按Token计费的模型中，每使用1000个Token将进行一次扣费。</span>
				<div class="flex h-full">
					<main class="flex-1 overflow-hidden h-full">
						<n-data-table :columns="columns" :data="tableData" :pagination="pagination" />
					</main>
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
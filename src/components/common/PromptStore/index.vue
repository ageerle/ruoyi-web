<script setup lang='ts'>
import { computed, ref, onUnmounted, watch, onMounted, h } from 'vue'
import { NCard, NTag, NSpace, NModal, NTabs, NButton, NTabPane, NImage, NDataTable, NInput, NSwitch } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { payUrl, getSPayUrl, getOrderInfo, redeemKey, listPlan } from '@/api/pay'
import to from "await-to-js";
import { modelList } from '@/api/model'
import { t } from '@/locales';
import { useBasicLayout } from '@/hooks/useBasicLayout'

onMounted(() => {
	fetchData1()
	// 查询套餐信息
	fetchPackages()
});

interface Props {
	visible: boolean,
	title: string
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

// 卡密信息
const redeem = ref("")
// 兑换卡密
async function handleRedeemKey(money: string, name: string) {

	const [err, result] = await to(redeemKey({
		code: redeem.value,
		id: '',
		userId: '',
		amount: 0,
		status: '',
		balanceBefore: 0,
		balanceAfter: 0,
		remark: ''
	}));
	if (err) {
		message.error(err.message)
	} else {
		message.success("兑换成功!")
	}
	console.log("result===", result)
}

const showMeVisible = ref(false)
const imageUrl = ref("")
const orderMoney = ref("9.9")
const orderName = ref("初级套餐")
const orderNo = ref("")
let intervalId: string | number | NodeJS.Timer | undefined;

// 获取支付二维码
async function getPayUrl(money: string, name: string) {
	message.success('本系统仅用于演示，暂不支持此功能！')
	return;
	showMeVisible.value = true;
	const response = await payUrl({ money: money, name: name });
	imageUrl.value = response.data.url;
	orderMoney.value = money
	orderName.value = name
	orderNo.value = response.data.orderNo
	intervalId = setInterval(fetchData, POLLING_INTERVAL);
}

// 跳转到支付地址
async function getPayUrl1(money: string, name: string) {
	message.success('本系统仅用于演示，暂不支持此功能！')
	return;
	loading.value = true
	const [err, result] = await to(getSPayUrl({ money: money, name: name }));
	if (err) {
		message.error(err.message)
		loading.value = false
		return
	}

	// window.location.href = response;
	window.open(result, '_blank', 'noopener,noreferrer');
	setTimeout(() => {
		loading.value = false
	}, 3000)
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
			title: t('model.name'),
			key: 'modelDescribe',
			width: 60,
		},
		{
			title: t('model.price'),
			key: 'modelPrice',
			width: 60,
		},
		{
			title: t('model.type'),
			key: 'modelType',
			width: 20,
			render: (row: any) => {
				let text, type;
				switch (row.modelType) {
					case "1":
						text = 'Token billing';
						type = 'success'; // 绿色标签
						break;
					case "2":
						text = 'Frequency billing';
						type = 'info'; // 蓝色标签
						break;
					default:
						text = 'Unknown billing';
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
			title: t('model.remark'),
			key: 'remark',
			width: 200,
		},

	]
}

const tableData = ref([]);

const fetchData1 = async () => {
	try {
		// 发起一个请求
		const [err, result] = await to(modelList());

		if (err) {
			message.error(err.message)
		} else {
			tableData.value = result.data;
		}
	} catch (error) {
		console.error('Error fetching data:', error);
	}
};

const columns = ref(createColumns());
const subscriptionPlans = ref([]);
const subscriptionPlansYear = ref([]);
async function fetchPackages() {
	// 发起一个请求
	const [err, result] = await to(listPlan());
	if (err) {
		message.error(err.message)
	} else {
		subscriptionPlans.value = result.data.filter(e=>e.duration < 32);
		subscriptionPlansYear.value = result.data.filter(e=>e.duration > 32);
		console.log("subscriptionPlans.value==",subscriptionPlans.value)
	}
}
const active = ref(false)
const loading = ref<boolean>(false)
</script>

<template>
	<NModal v-model:show="show" :auto-focus="false" preset="card" :style="{maxWidth: '1100px', position: 'fixed', left: '50%', top: isMobile ? '2vh' : '10vh', transform: 'translate(-50%, 0%)'}" :class="[isMobile ? 'plan-draw mobile-plan-draw' : 'plan-draw']">
		<n-tabs type="line" size="large" :tabs-padding="20" pane-style="padding: 20px;" class="plan-tabs">
			<n-tab-pane :name="$t('setting.plan')">
				<!-- <div class="change-combo">
					<span :class="[active ? '' : 'active-span']">Monthly</span>
					<n-switch style="zoom: 1.5" v-model:value="active"  size="large"/>
					<span :class="[active ? 'active-span' : '']">Annually</span>
				</div> -->
				<div style="display: flex; overflow: auto;" class="plan-content" v-if="active ? subscriptionPlansYear.length : subscriptionPlans.length">
					<div class="plan-item" v-for="(plan, index) in active ? subscriptionPlansYear.slice(0, 3) : subscriptionPlans.slice(0, 3)" :key="index">
						<div class="header">
							<span class="title">{{ plan.name }}</span>
							<p style="float: right">
							<span class="price">{{$t('store.unit')}}{{ plan.price }}</span>
							<span class="date"></span></p>
						</div>
						<div class="content">
							<div class="option-item" v-for="(feature, fIndex) in plan.planDetail.split(',')" :key="fIndex">
								<div class="quanquan">
									<IconSvg icon="gou"></IconSvg>
								</div>
								<p>{{ feature }}</p>
							</div>
						</div>
						<n-button class="footer" :loading="loading" @click="getPayUrl(plan.price, plan.name)"><IconSvg icon="add"></IconSvg>{{  $t('setting.recharge') }}</n-button>
					</div>
				</div>
			</n-tab-pane>
			<n-tab-pane :name="$t('setting.charge')">
				<span style="color: #D84C10; font-size: 14px;">{{  $t('store.token') }}</span>
				<div class="flex h-full draw-table-box" style="margin-top: 15px;max-width: 90vw; overflow: auto;">
					<main class="flex-1 h-full">
						<n-data-table style="min-width: 700px" :bordered="false" :columns="columns" :data="tableData" :pagination="pagination" />
					</main>
				</div>
			</n-tab-pane>
			<n-tab-pane :name="$t('setting.exchange')">
				<div class="input-button-container">
					<n-input v-model:value="redeem" type="text" :placeholder="$t('store.input')" style="width: 70%" />
					<n-button :bordered="false" type="success" @click="handleRedeemKey">{{  $t('store.redeemKey') }}</n-button>
				</div>
			</n-tab-pane>
		</n-tabs>
	</NModal>

	<NModal v-model:show="showMeVisible" :title="orderName" :auto-focus="false" preset="card"
		style="width: 95%; max-width: 266px;">
		<n-image width="220" :src="imageUrl" />
		<span v-if="orderMoney">请使用微信扫码支付{{ orderMoney }}元</span>
	</NModal>
</template>
<style scoped>

.n-gradient-text {
	font-size: 18px;
}

.outer-container {
	display: flex;
	/* 设置外部容器为 Flexbox */
	justify-content: center;
	/* 水平居中对齐子项目 */
}
</style>

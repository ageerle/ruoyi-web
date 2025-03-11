<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useMessage, NButton, NInput, NImage, NModal, NCard } from "naive-ui";
import { LoginFrom } from "@/typings/user";
import {
	getConfigKey,
	getMpQrCode,
	getLoginType,
	authSystem,
} from "@/api/user";
import { useUserStore } from "@/store/modules/user";
import to from "await-to-js";
import { useI18n } from "vue-i18n";
import { useBasicLayout } from "@/hooks/useBasicLayout";
const { isMobile } = useBasicLayout();
const { t } = useI18n();

const userStore = useUserStore();
const router = useRouter();
const message = useMessage();
const user = ref<LoginFrom>(Object.create(null));

// 点击登录
let loginLoading = ref(false);
async function handleValidateButtonClick(e: MouseEvent) {
	e.preventDefault();
	const { username, password } = user.value;
	// if (!validateAccount(username)) {
	// 	message.error(t("login.accountFormatError"));
	// 	return;
	// }
	if (username && password) {
		loginLoading.value = true;
		const [err] = await to(userStore.userLogin(user.value));
		if (!err) {
			message.success(t("login.loginSuccess"));
			await router.push("/");
			loginLoading.value = false;
		} else {
			message.error(err.message);
			loginLoading.value = false;
		}
	} else {
		message.error(t("login.usernameOrPasswordEmpty"));
	}
}

function validateAccount(account: string) {
	if (!account) {
		return false;
	}
	const phoneRegex = /^1[3456789]\d{9}$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(account) || phoneRegex.test(account);
}

const handleRegistBtnClick = async (e: MouseEvent) => {
	router.push("/regist");
};

const copyright = ref("");

const logo = ref("");

const activate = ref(false);

const code = ref("");

// 在组件挂载后执行异步操作
onMounted(async () => {
	const [err, res] = await to(getConfigKey("copyright"));
	if (err) {
		console.error("获取配置失败", err.message);
	} else {
		copyright.value = res.msg;
	}
});

const activeTab = ref("login");

const showModal = ref(false);

// 登录二维码
const qrCode = ref("");
const ticket = ref("");

let intervalId: string | number | NodeJS.Timer | undefined;
// 定义轮询间隔时间，例如每3秒轮询一次
const POLLING_INTERVAL = 3000;

async function handleWxLogin() {
	
	showModal.value = true
	//获取二维码信息
	const [err1, res1] = await to(getMpQrCode());
	if (err1) {
		message.error("获取二维码失败: " + err1.message);
	} else {
		qrCode.value = res1.data.qrCodeUrl;
		ticket.value = res1.data.ticket;
		intervalId = setInterval(slectLoginType, POLLING_INTERVAL);
	}
	
}

// 1. 定时查询是否登录成功
async function slectLoginType() {
	const [err, res] = await to(getLoginType(ticket.value));
	if (!err) {
		console.log("res.token", res);
		if (res.data.token) {
			// 2. 登录成功,保存token
			userStore.userQrLogin(res.data.token);
			clearInterval(intervalId);
			// 3. 跳转到主页
			message.success(t("login.loginSuccess"));
			await router.push("/");
		}
	}
}

onUnmounted(() => {
	// 页面组件卸载前清除定时器，避免内存泄漏
	if (intervalId !== undefined) {
		clearInterval(intervalId);
	}
});
</script>

<template>
	<div id="app">
		<br /><br /><br /><br />
		<div class="flex justify-center mt-8 md:mt-0">
			<img style="border-radius: 60px; width: 120px; height: 120px" :src="logo" alt="Robot Icon"
				class="h-12 w-fit hover:cursor-pointer md:h-16" />
		</div>
		<br />
		<div class="relative w-full bg-white mt-10 overflow-hidden shadow-xl ring-1 sm:mx-auto sm:h-min sm:max-w-4xl sm:rounded-lg lg:max-w-5xl 2xl:max-w-6xl login-box"
			:style="{ width: isMobile ? '100%' : '880px' }">
			<div class="px-6 pt-4 pb-8 sm:px-10">
				<main class="mx-auto sm:max-w-4xl lg:max-w-5xl 2xl:max-w-6xl">
					<div v-if="activeTab === 'login'">
						<!-- 登录表单 -->
						<div class="flex flex-col justify-center my-4 space-y-8">
							<div class="mx-auto w-full max-w-md">
								<h2 class="text-3xl font-bold text-center text-gray-900">
									{{ $t("login.login") }}
								</h2>
								<p class="mt-2 text-sm text-center text-gray-600 login-desc">
									{{ $t("login.or") }}
									<a @click="handleRegistBtnClick"
										class="font-semibold text-teal-500 hover:text-teal-600">{{ $t("login.register")
										}}</a>
									{{ $t("login.andExperience") }}
								</p>
							</div>
							<div class="mx-auto w-full max-w-sm">
								<form class="space-y-6" :style="{
									width: !isMobile ? '580px' : 'calc(100% - 20px)',
									marginLeft: isMobile ? '10px' : 'calc(50% - 290px)',
								}">
									<div>
										<label for="email" class="block text-sm font-medium text-gray-700">{{
											$t("login.emailOrPhone") }}</label>
										<div class="mt-1">
											<input id="email" v-model="user.username"
												:allow-input="(val: string) => { return !/[^A-Za-z0-9_@.]/g.test(val) }"
												maxlength="32" :placeholder="$t('login.enterEmailOrPhone')" name="email"
												type="email" autocomplete="email" required
												class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:border-teal-500 focus:outline-none focus:ring-teal-500" />
										</div>
									</div>
									<div>
										<label for="password" class="block text-sm font-medium text-gray-700">{{
											$t("login.password") }}</label>
										<div class="mt-1">
											<input id="password" maxLength="16" v-model="user.password"
												:placeholder="$t('login.enterPassword')" name="password" type="password"
												required
												class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:border-teal-500 focus:outline-none focus:ring-teal-500" />
										</div>
										<a style="color: #0084ff; font-weight: 500" href="#/resetpassword"
											class="float-right mt-2 text-sm font-semibold text-teal-500 hover:text-teal-600">{{
												$t("login.forgotPassword") }}</a>
									</div>
									<div class="footer-login">
										<n-button :loading="loginLoading" @click="handleValidateButtonClick">{{
											$t("login.login") }}</n-button>

										<n-button @click="handleWxLogin">微信登录</n-button>
									</div>
								</form>
							</div>
						</div>
					</div>

					<!-- 扫码登录 -->
					<n-modal
						v-model:show="showModal"
						title="请扫描下方二维码登录"
						preset="card"
						draggable
						:style="{ width: '400px' }"
 						 >
   					 <n-image width="350" :src="qrCode" />
 					</n-modal>
				</main>
			</div>
		</div>
		<div class="footer">
			<a target="_blank" style="color: #999999; font-size: 14px" href="https://beian.miit.gov.cn/">
				&nbsp;{{ copyright }}
			</a>
		</div>
		<!-- <div v-if="!activate" id="specialDiv">
			<p>
				{{ $t("login.systemNotActivated") }}
				<n-button size="small" secondary strong @click="showModal = true">{{
					$t("login.activate")
				}}</n-button>
			</p>
		</div> -->
	</div>
	<!-- <n-modal v-model:show="showModal">
		<n-card
			style="width: 600px"
			:bordered="false"
			size="huge"
			role="dialog"
			aria-modal="true"
		>
			<p class="text-sm text-center" style="margin-right: 10px">
				{{ $t("login.enterAuthCode") }}
			</p>
			<br />
			<div style="display: flex; align-items: center; justify-content: center">
				<input
					id="code"
					v-model="code"
					maxlength="32"
					:placeholder="$t('login.activationCode')"
					class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:border-teal-500 focus:outline-none focus:ring-teal-500"
				/>
				<n-button style="margin-left: 10px" @click="sysAuth()">{{
					$t("login.activate")
				}}</n-button>
			</div>
		</n-card>
	</n-modal> -->
</template>

<style scoped>
#app {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	/* background-image: url('@/assets/background.jpg'); */
	background-color: #141718;
	background-size: cover;
	background-repeat: no-repeat;
}

.footer {
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
	width: 100%;
	margin-top: auto;
}

.custom-card {
	width: 500px;
}

input {
	color: black !important;
}

#specialDiv {
	position: relative;
	/* 使内部的绝对定位元素相对定位 */
}

#specialDiv p {
	position: absolute;
	/* 绝对定位 */
	bottom: 0;
	/* 将元素对齐到底部 */
	right: 0;
	/* 将元素对齐到右边 */
	margin: 0;
	/* 去除默认的段落外边距 */
}
</style>

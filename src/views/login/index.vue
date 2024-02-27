<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage} from 'naive-ui'
import { LoginFrom } from '@/typings/user'
import defaultAvatar from '@/assets/avatar.jpg'
import { useUserStore } from '@/store/modules/user'
import to from "await-to-js";

const userStore = useUserStore()
const router = useRouter()
const message = useMessage()
const user = ref<LoginFrom>(Object.create(null))

// const rules = {
//   account: {
//     required: true,
//     message: '请输入用户名',
//     trigger: ['input', 'blur'],
//   },
//   password: {
//     required: true,
//     message: '请输入密码',
//     trigger: ['input', 'blur'],
//   },
// }

// 点击登录
async function handleValidateButtonClick(e: MouseEvent){
	e.preventDefault()
	const { username, password } = user.value
	if (!validateAccount(username)) {
		message.error("账号格式不正确!")
		return
	}
	if (username && password) {
		const [err] = await to(userStore.userLogin(user.value));
		if (!err) {
			message.success("登录成功!")
			await router.push('/');
		}else{
			message.error(err.message)
		}
	} else {
		message.error("用户名或者密码不能为空!")
	}
}

function validateAccount(account:string) {
    if(!account){
        return false
    }
    const phoneRegex = /^1[3456789]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(account) || phoneRegex.test(account);;
}


const handleRegistBtnClick = async (e: MouseEvent) => {
  router.push('/regist')
}
</script>

<template>
	<div id="app">
		<br><br>
		<br><br><br>
		<div class="flex justify-center" data-v-0ee1b774="">
			<img :src="defaultAvatar" alt="Robot Icon" class="h-12 mt-8 w-fit hover:cursor-pointer md:mt-0 md:h-16"
				data-v-0ee1b774="">
		</div>
		<br>
		<div class="relative w-full mt-10 overflow-hidden bg-white shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:h-min sm:max-w-4xl sm:rounded-lg lg:max-w-5xl 2xl:max-w-6xl"
			data-v-0ee1b774="">
			<div class="px-6 pt-4 pb-8 sm:px-10" data-v-0ee1b774="">
				<main class="mx-auto sm:max-w-4xl lg:max-w-5xl 2xl:max-w-6xl" data-v-0ee1b774=""><!--[--><!--[--><!--[-->
					<div class="nuxt-loading-indicator"
						style="position: fixed; top: 0px; right: 0px; left: 0px; pointer-events: none; width: 0%; height: 3px; opacity: 0; background: rgb(45, 212, 191); transition: width 0.1s ease 0s, height 0.4s ease 0s, opacity 0.4s ease 0s; z-index: 999999;">
					</div>
					<div>
						<div>
							<div class="flex flex-col justify-center min-h-full my-4 space-y-8 sm:px-6 lg:px-8">
								<div class="sm:mx-auto sm:w-full sm:max-w-md">
									<h2 class="text-3xl font-bold tracking-tight text-center text-gray-900">登录</h2>
									<p class="mt-2 text-sm text-center text-gray-600"> 或者
										<a @click="handleRegistBtnClick" style="font-size: 18px"
											class="font-semibold text-teal-500 hover:text-teal-600">注册</a> 并免费体验熊猫助手
									</p>
								</div>
								<div class="sm:mx-auto sm:w-full sm:max-w-sm">
									<form class="space-y-6">
										<div>
											<label for="email"
												class="block text-sm font-medium text-gray-700">邮箱或者电话号码</label>
											<div class="mt-1">

												<input id="email" v-model="user.username"
													:allow-input="(val: string) => { return !/[^A-Za-z0-9_@.]/g.test(val) }"
													maxlength="32" placeholder="请输入邮箱或者电话号码" name="email" type="email"
													autocomplete="email" required="true"
													class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm">
											</div>
										</div>
										<div>
											<label for="password" class="block text-sm font-medium text-gray-700">密码</label>
											<div class="mt-1">
												<input id="password" maxLength="16" v-model="user.password"
													placeholder="请输入密码" name="password" type="password" required="true"
													class="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm">
											</div>

											<a href="#/resetpassword"
												style="font-size: 15px; float: right; margin-top: 10PX; margin-bottom: 10px;"
												class="font-semibold text-teal-500 hover:text-teal-600">忘记密码? </a>
										</div>
										<div>

										</div>
										<div>
											<button @click="handleValidateButtonClick"
												class="flex inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition bg-teal-500 bg-teal-600 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-teal-800 hover:bg-teal-700 focus:ring-teal-500 hover:bg-teal-600 focus:ring-teal-400">
												登录</button>
										</div>
									</form>
								</div>
							</div>
						</div>
				</div>
			</main>
		</div>
	</div>
	<div 
			style="position:absolute;top:100%;text-align:center;bottom:0;margin:0 auto;width:100%;color: #999999"
		>
			<img src='http://cdn.beiruijk.com/0be25a8d779aee40433aaca76c5f6ce.jpg'
					style="display: inline-block; vertical-align: middle;"/>
			<a
				target="_blank"
				style="color: #999999;font-size: 14px; display: inline-block; vertical-align: middle;"
				href="https://beian.miit.gov.cn/"
			> &nbsp;鄂ICP备2023007672号-1</a>
			<span style="color: #999999;font-size: 14px">&nbsp; @2023 熊猫助手</span>
	</div>
</div>

</template>

<style scoped>
	#app {
		background-image: url('@/assets/background.jpg');
		background-size: cover;
		background-repeat: no-repeat;
	}
	.forgot {
		top: 1px;
		right: 6px;
		font-size: 12px;
		color: var(--font-gray);
	}
</style>

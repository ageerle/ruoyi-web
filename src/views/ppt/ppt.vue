<template>
	<div id="ppt-container">
		<!-- 这里可以是SDK初始化后生成的内容 -->
	</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { getApiToken, successCallback } from '@/api/ppt';
import { useMessage } from 'naive-ui';

const message = useMessage();

// 假设SDK文件在public目录下
const sdkScriptUrl = '/docmee-ui-sdk-iframe.min.js';
let token = '';

async function getToken() {
	const res = await getApiToken();
	if (res.code == 200) {
		token = res.data.apiKey;
		initPPT();
	} else {
		message.error('获取API Token失败');
	}
}

onMounted(() => {
	getToken();
});

function initPPT() {
	// 动态加载SDK脚本
	const script = document.createElement('script');
	script.src = sdkScriptUrl;
	script.onload = () => {
		// 假设SDK提供了一个全局对象或方法来初始化
		if (window.DocmeeUI) {
			// 初始化 UI iframe
			const docmeeUI = new window.DocmeeUI({
				pptId: null,
				token: token, // token
				container: document.querySelector("#ppt-container"), // 挂载 iframe 的容器
				page: "creator", // 'creator' 创建页面; 'dashboard' PPT列表; 'customTemplate' 自定义模版; 'editor' 编辑页（需要传pptId字段）
				lang: "zh", // 国际化
				mode: "light", // light 亮色模式, dark 暗色模式
				isMobile: false, // 移动端模式
				background: "linear-gradient(-157deg,#f57bb0, #867dea)", // 自定义背景
				padding: "40px 20px 0px",
				async onMessage(message) {
					console.log("监听事件", message);
					if (message.type === "invalid-token") {
						console.log("token 认证错误");
						// 更换新的 token
						// let newToken = createApiToken()
						// docmeeUI.updateToken(newToken)
					} else if (message.type === "beforeGenerate") {
						const { subtype, fields } = message.data;
						if (subtype === "outline") {
							console.log("即将生成ppt大纲", fields);
							return true;
						} else if (subtype === "ppt") {
							console.log("即将生成ppt", fields);
							const res = await successCallback();
							if (res.code == 200) {
								docmeeUI.sendMessage({
									type: "success",
									content: "继续生成PPT",
								});
								return true;
							} else {
								message.error('生成PPT失败');
								return false;
							}
						}
					} else if (message.type === "beforeCreateCustomTemplate") {
						const { file, totalPptCount } = message.data;
						console.log("用户自定义完整模版，PPT文件：", file.name);
						if (totalPptCount < 2) {
							console.log("用户积分不足，不允许制作自定义完整模版");
							return false;
						}
						return true;
					} else if (message.type == "pageChange") {
						pageChange(message.data.page);
					} else if (message.type === "beforeDownload") {
						const { id, subject } = message.data;
						return `PPT_${subject}.pptx`;
					} else if (message.type == "error") {
						if (message.data.code == 88) {
							alert("您的次数已用完");
						} else {
							alert("发生错误：" + message.data.message);
						}
					}
				},
			});
		} else {
			console.error("DocmeeUI SDK未加载");
		}
	};
	document.body.appendChild(script);
}
</script>

<style scoped lang="less">
#ppt-container {
	width: 100%;
	height: calc(100% - 20px);
	overflow: hidden;
}
</style>

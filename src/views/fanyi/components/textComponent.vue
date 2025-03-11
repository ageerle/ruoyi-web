<template>
	<div class="translation-container">
		<div class="translation-panel input-panel">
			<div class="panel-header">
				<div class="header-title">
					<div>输入文本</div>
				</div>
				<div
					class="voice-input"
					@click="goASR"
					:class="{ active: st.micStart }"
				>
					<IconSvg icon="voice" width="18px" height="18px"></IconSvg>
					<span>语音输入</span>
				</div>
			</div>

			<div class="input-wrapper">
				<n-input
					v-model:value="prompt"
					type="textarea"
					class="text-input"
					placeholder="请在此输入需要翻译的文本..."
					:autosize="{ minRows: 10, maxRows: 15 }"
				/>
				<!-- <div class="input-decoration"></div> -->
			</div>

			<div class="translation-controls">
				<div class="control-group">
					<label>目标语言</label>
					<n-select v-model:value="targetLanguage" :options="options1" />
				</div>

				<div class="control-group">
					<label>翻译模型</label>
					<n-select
						v-model:value="model"
						:options="modelListData"
						value-field="modelDescribe"
						label-field="modelName"
					/>
				</div>

				<n-button
					class="translate-button"
					@click="handleTranslation"
					type="primary"
					:disabled="isLoading"
				>
					<IconSvg
						v-if="!isLoading"
						icon="translate"
						width="18px"
						height="18px"
					></IconSvg>
					<template v-if="!isLoading">开始翻译</template>
					<template v-else>翻译中...</template>
				</n-button>
			</div>
		</div>

		<div class="translation-panel result-panel">
			<div class="panel-header">
				<div class="header-title">
					<div>翻译结果</div>
				</div>
			</div>

			<div class="result-content" v-if="!isLoading">
				<template v-if="parsedResult.original || parsedResult.translated">
					<div class="result-section original">
						<div class="section-header">
							<div class="section-icon">原</div>
							<h3>原文内容</h3>
						</div>
						<div class="section-body">{{ parsedResult.original }}</div>
					</div>

					<div class="result-divider">
						<div class="divider-line"></div>
						<div class="divider-icon">
							<IconSvg icon="arrow-down" width="16px" height="16px"></IconSvg>
						</div>
						<div class="divider-line"></div>
					</div>

					<div class="result-section translated">
						<div class="section-header">
							<div class="section-icon">译</div>
							<h3>翻译结果</h3>
						</div>
						<div class="section-body">{{ parsedResult.translated }}</div>
					</div>
				</template>

				<div class="empty-result" v-else>
					<div class="empty-illustration">
						<!-- <div class="empty-icon">
							<IconSvg icon="translate-empty" width="32px" height="32px"></IconSvg>
						</div> -->
					</div>
					<p>翻译结果将显示在这里</p>
					<small>请在左侧输入文本并点击"开始翻译"</small>
				</div>
			</div>

			<div class="loading-container" v-else>
				<div class="loading-animation">
					<div class="loading-spinner"></div>
					<div class="loading-spinner-shadow"></div>
				</div>
				<p>正在翻译中，请稍候...</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { t } from "@/locales";
import { ref, onMounted } from "vue";
import { NInput, NSelect, NButton, useMessage } from "naive-ui";
import { Recognition } from "@/api";
import { modelList } from "@/api/model";
import { translation } from "@/api/fanyi";

const modelListData = ref([]);
const message = useMessage();
const prompt = ref("");
const targetLanguage = ref("中文");
const model = ref("");
const parsedResult = ref({ original: "", translated: "" });
const isLoading = ref(false);

// 语言选项配置
const options1 = ref([
	{ label: "中文", value: "中文" },
	{ label: "英文", value: "英文" },
]);

// 语音识别状态
const st = ref({
	micStart: false,
});

onMounted(() => {
	getModelList();
});

async function getModelList() {
	try {
		const res = await modelList();
		modelListData.value = res.data;
		model.value = modelListData.value[0]?.modelDescribe || "";
	} catch (error) {
		console.error("获取模型列表失败:", error);
		message.error("获取模型列表失败");
	}
}

async function handleTranslation() {
	if (!prompt.value.trim()) {
		message.warning("请输入需要翻译的文本");
		return;
	}

	isLoading.value = true;
	try {
		const res = await translation({
			prompt: prompt.value,
			targetLanguage: targetLanguage.value,
			model: model.value,
		});

		// 解析返回的 Markdown 格式结果
		const matches = res.match(/\*\*原文\*\*\s*:(.*?)\s*\*\*翻译\*\*\s*:(.*)/s);
		if (matches) {
			parsedResult.value = {
				original: matches[1].trim(),
				translated: matches[2].trim(),
			};
		} else {
			parsedResult.value = {
				original: prompt.value,
				translated: res,
			};
		}
	} catch (error) {
		console.error("翻译失败:", error);
		message.error("翻译失败，请稍后重试");
	} finally {
		isLoading.value = false;
	}
}

// 语音识别ASR
const goASR = () => {
	if (st.value.micStart) return; // 防止重复启动

	const originalText = prompt.value;
	const rec = new Recognition();

	rec
		.setOpt({
			timeOut: 2000,
			onStart: () => {
				message.info(t("mj.micRec"));
				st.value.micStart = true;
			},
			listener: (result) => {
				prompt.value = originalText + result;
			},
			onEnd: () => {
				message.info(t("mj.micRecEnd"));
				st.value.micStart = false;
				rec.recognition = null; // 清理实例，避免内存泄漏
			},
		})
		.start();
};
</script>

<style scoped lang="less">
.translation-container {
	display: flex;
	gap: 28px;
	padding: 32px;
	min-height: calc(100vh - 60px);
	// background: linear-gradient(135deg, #f8faff 0%, #f0f4fa 100%);

	@media (max-width: 1200px) {
		flex-direction: column;
		padding: 20px;
		gap: 20px;
	}
}

.translation-panel {
	flex: 1;
	display: flex;
	flex-direction: column;
	border-radius: 20px;
	// background-color: #ffffff;
	box-shadow: 0 10px 40px rgba(31, 45, 61, 0.08);
	overflow: hidden;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	position: relative;

	&:hover {
		box-shadow: 0 15px 45px rgba(31, 45, 61, 0.12);
	}

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #1890ff, #36cfc9);
		z-index: 1;
	}

	&.input-panel::before {
		background: linear-gradient(90deg, #1890ff, #36cfc9);
	}

	&.result-panel::before {
		background: linear-gradient(90deg, #722ed1, #1890ff);
	}
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 22px 28px;
	border-bottom: 1px solid #f0f0f0;

	.header-title {
		display: flex;
		align-items: center;
		gap: 12px;

		.title-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 36px;
			height: 36px;
			border-radius: 12px;
			// background-color: rgba(24, 144, 255, 0.1);
			color: #1890ff;

			&.result-icon {
				// background-color: rgba(114, 46, 209, 0.1);
				color: #722ed1;
			}
		}

		h2 {
			margin: 0;
			font-size: 18px;
			font-weight: 600;
			color: #262626;
			letter-spacing: 0.5px;
		}
	}
}

.voice-input {
	display: flex;
	align-items: center;
	gap: 8px;
	// padding: 10px 18px;
	border-radius: 30px;
	// background-color: #f5f7fa;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	border: 1px solid transparent;

	&:hover {
		// background-color: #e6f7ff;
		color: #1890ff;
		border-color: rgba(24, 144, 255, 0.3);
		transform: translateY(-2px);
	}

	&.active {
		// background-color: #e6f7ff;
		color: #1890ff;
		border-color: rgba(24, 144, 255, 0.3);
		animation: pulse 1.5s infinite;
	}

	span {
		font-size: 14px;
		font-weight: 500;
	}
}

@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
	}
}

.input-wrapper {
	flex: 1;
	padding: 24px 28px 16px;
	position: relative;

	.input-decoration {
		position: absolute;
		bottom: 16px;
		left: 28px;
		right: 28px;
		height: 60px;
		// background: linear-gradient(
		// 	to top,
		// 	rgba(255, 255, 255, 1) 0%,
		// 	rgba(255, 255, 255, 0) 100%
		// );
		pointer-events: none;
		z-index: 1;
		opacity: 0.8;
	}
}

.text-input {
	position: relative;
	z-index: 0;

	:deep(.n-input__textarea) {
		font-size: 16px;
		line-height: 1.8;
		padding: 20px;
		border-radius: 16px;
		// border: 1px solid #e8e8e8;
		// background-color: #fafafa;
		resize: none;
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

		&:focus {
			border-color: #1890ff;
			box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.15);
			// background-color: #ffffff;
		}
	}
}

.translation-controls {
	padding: 16px 28px 28px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 10px;

		label {
			font-size: 14px;
			font-weight: 500;
			color: #595959;
			margin-left: 4px;
		}
	}

	:deep(.n-select) {
		.n-base-selection {
			border-radius: 12px;
			transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
			border: 1px solid #e8e8e8;

			&:hover {
				border-color: #1890ff;
			}

			&:focus,
			&.n-base-selection--active {
				border-color: #1890ff;
				box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.15);
			}
		}
	}

	.translate-button {
		grid-column: span 2;
		height: 52px;
		font-size: 16px;
		font-weight: 500;
		border-radius: 12px;
		margin-top: 12px;
		background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
		border: none;
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
		}

		&:active {
			transform: translateY(0);
		}
	}
}

.result-content {
	flex: 1;
	padding: 24px 28px;
	overflow-y: auto;
}

.result-section {
	padding: 20px;
	border-radius: 16px;
	margin-bottom: 20px;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	border: 1px solid transparent;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
	}

	&.original {
		// background-color: #f9f9f9;

		&:hover {
			border-color: #e8e8e8;
		}
	}

	&.translated {
		// background-color: #f0f7ff;

		&:hover {
			border-color: rgba(24, 144, 255, 0.3);
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;

		.section-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			border-radius: 10px;
			font-weight: bold;
			font-size: 14px;

			.original & {
				// background-color: #f0f0f0;
				color: #595959;
			}

			.translated & {
				// background-color: #1890ff;
				color: white;
			}
		}

		h3 {
			margin: 0;
			font-size: 16px;
			font-weight: 600;

			.translated & {
				color: #1890ff;
			}
		}
	}

	.section-body {
		font-size: 15px;
		line-height: 1.8;
		white-space: pre-wrap;
		word-break: break-word;
		padding: 0 4px;

		.translated & {
			color: #1890ff;
		}
	}
}

.result-divider {
	display: flex;
	align-items: center;
	margin: 28px 0;

	.divider-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(to right, transparent, #e8e8e8, transparent);
	}

	.divider-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, #1890ff, #096dd9);
		color: white;
		margin: 0 20px;
		box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3);
		animation: float 3s ease-in-out infinite;
	}
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-6px);
	}
}

.empty-result {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #8c8c8c;
	text-align: center;
	padding: 40px 0;

	.empty-illustration {
		margin-bottom: 24px;
		position: relative;

		.empty-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 80px;
			height: 80px;
			border-radius: 50%;
			// background-color: #f5f5f5;
			color: #bfbfbf;
			position: relative;
			z-index: 1;

			&::after {
				content: "";
				position: absolute;
				width: 100%;
				height: 100%;
				border-radius: 50%;
				// background-color: rgba(24, 144, 255, 0.05);
				z-index: -1;
				animation: ripple 2s linear infinite;
			}
		}
	}

	p {
		font-size: 18px;
		margin-bottom: 12px;
		font-weight: 500;
	}

	small {
		font-size: 14px;
		opacity: 0.7;
		max-width: 240px;
		line-height: 1.6;
	}
}

@keyframes ripple {
	0% {
		transform: scale(1);
		opacity: 0.4;
	}
	100% {
		transform: scale(1.5);
		opacity: 0;
	}
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: 40px 0;

	.loading-animation {
		position: relative;
		margin-bottom: 24px;

		.loading-spinner {
			width: 60px;
			height: 60px;
			border: 4px solid rgba(24, 144, 255, 0.1);
			border-left-color: #1890ff;
			border-radius: 50%;
			animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
		}

		.loading-spinner-shadow {
			position: absolute;
			top: 15px;
			left: 0;
			width: 60px;
			height: 10px;
			background: radial-gradient(
				ellipse at center,
				rgba(0, 0, 0, 0.1) 0%,
				rgba(0, 0, 0, 0) 80%
			);
			border-radius: 50%;
			z-index: -1;
			animation: shadow 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
		}
	}

	p {
		font-size: 16px;
		color: #595959;
		font-weight: 500;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@keyframes shadow {
	0%,
	100% {
		transform: scale(1, 1);
		opacity: 0.3;
	}
	50% {
		transform: scale(1.2, 1);
		opacity: 0.1;
	}
}

:deep(.icon-svg) {
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>

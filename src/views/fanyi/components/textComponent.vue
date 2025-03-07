<template>
	<div class="name-textBox">
		<div class="name-textBox-left">
			<n-input
				v-model:value="prompt"
				type="textarea"
				rows="15"
				placeholder="请输入文本"
			/>
			<div class="name-selectBox">
				<div
					style="
						display: flex;
						justify-content: space-between;
						align-items: center;
					"
				>
					<span style="width: 100px; font-size: 15px; font-weight: bold"
						>语音录入：</span
					>
					<div>
						<IconSvg
							icon="voice"
							width="22px"
							height="22px"
							@click="goASR"
						></IconSvg>
					</div>
				</div>
				<div
					style="
						display: flex;
						justify-content: space-between;
						align-items: center;
					"
				>
					<span style="width: 100px; font-size: 15px; font-weight: bold"
						>目标语言：</span
					>
					<n-space vertical style="width: 100%">
						<n-select v-model:value="targetLanguage" :options="options1" />
					</n-space>
				</div>

				<div
					style="
						display: flex;
						justify-content: space-between;
						align-items: center;
					"
				>
					<span style="width: 100px; font-size: 15px; font-weight: bold"
						>模型：</span
					>
					<n-space vertical style="width: 100%">
						<n-select
							v-model:value="model"
							:options="modelListData"
							value-field="modelDescribe"
							label-field="modelName"
						/>
					</n-space>
				</div>

				<div>
					<n-button
						style="width: 100%"
						@click="handleTranslation"
						type="primary"
						>翻译</n-button
					>
				</div>
			</div>
		</div>
		<div class="name-textBox-right">
			<div class="name-textBox-right-content">
				{{ translationResult }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { t } from "@/locales";
import { SvgIcon, PromptStore } from "@/components/common";
import { ref, onMounted } from "vue";
import { NInput, NSelect, NButton, useMessage, NDropdown } from "naive-ui";
import { Recognition } from "@/api";
import { modelList } from "@/api/model";
import { translation } from "@/api/fanyi";
const modelListData = ref([]);
import { useIconRender } from "@/hooks/useIconRender";
const { iconRender } = useIconRender();
const st = ref({
	fileBase64: [],
	isLoad: 0,
	isShow: false,
	showMic: false,
	micStart: false,
});
const drOption = [
	{
		label: t("mj.micWhisper"),
		key: "whisper",
		icon: iconRender({ icon: "ri:openai-fill" }),
	},
	{
		label: t("mj.micAsr"),
		icon: iconRender({ icon: "ri:chrome-line" }),
		key: "asr",
	},
];

const handleSelectASR = (value) => {
	console.log(value);
};

const prompt = ref("");
// const sourceLanguage = ref("英文");
const targetLanguage = ref("中文");
const translationResult = ref("");
const model = ref("");
const options = ref([
	// { label: '自动设别', value: '' },
	{ label: "中文", value: "中文" },
	{ label: "英文", value: "英文" },
]);
const options1 = ref([
	{ label: "中文", value: "中文" },
	{ label: "英文", value: "英文" },
]);

onMounted(() => {
	getModelList();
});

async function getModelList() {
	const res = await modelList();
	modelListData.value = res.data;
	model.value = modelListData.value[0].modelDescribe;
}

async function handleTranslation() {
	if (!prompt.value) {
		return;
	}
	const res = await translation({
		prompt: prompt.value,
		// sourceLanguage: sourceLanguage.value,
		targetLanguage: targetLanguage.value,
		model: model.value,
	});
	translationResult.value = res;
}

//语音识别ASR
// let mvalue = ref("");
const ms = useMessage();
const goASR = () => {
	console.log("触发语音识别");

	const olod = prompt.value;
	const rec = new Recognition();
	let rz = "";
	rec
		.setListener((r) => {
			//mlog('result ', r  );
			rz = r;
			prompt.value = r;
			console.log("识别结果222", prompt.value);

			st.value.micStart = true;
		})
		.setOnEnd(() => {
			//mlog('rec end');
			prompt.value = olod + rz;
			console.log("识别结果1111", prompt.value);
			ms.info(t("mj.micRecEnd"));
			st.value.micStart = false;
		})
		.setOpt({
			timeOut: 2000,
			onStart: () => {
				ms.info(t("mj.micRec"));
				st.value.micStart = true;
			},
		})
		.start();
};
</script>

<style scoped lang="less">
.name-textBox {
	display: flex;
	justify-content: center;

	.name-textBox-left {
		width: 49%;
		height: calc(100vh - 50px);
		overflow: hidden;
		overflow-y: scroll;
		border-radius: 10px;
		border: 2px solid #f0f0f0;
		padding: 10px;
		margin-right: 20px;

		.name-selectBox {
			// display: flex;
			// justify-content: space-between;
			// margin-bottom: 10px;

			div {
				flex: 1;
				margin-top: 10px;
			}
		}
	}

	.name-textBox-right {
		width: 49%;
		height: calc(100vh - 50px);
		border-radius: 10px;

		.name-selectBox {
			margin-bottom: 10px;
		}

		.name-textBox-right-content {
			height: calc(100vh - 50px);
			border: 2px solid #f0f0f0;
			border-radius: 10px;
		}
	}
}
</style>

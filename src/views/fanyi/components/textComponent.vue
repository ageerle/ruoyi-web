<template>
	<div class="name-textBox">
		<div class="name-textBox-left">
			<div class="name-selectBox">
				<div>
					<n-space vertical>
						<n-select v-model:value="sourceLanguage" :options="options" />
					</n-space>
				</div>
				<div>
					<n-space vertical>
						<n-select v-model:value="targetLanguage" :options="options1" />
					</n-space>
				</div>

				<div style="display: flex; align-items: center;">
					<n-space vertical>
						<n-select v-model:value="model" :options="modelListData" value-field="modelDescribe"
							label-field="modelName" />
					</n-space>
				</div>

				<n-button @click="handleTranslation" type="primary">翻译</n-button>
			</div>
			<n-input v-model:value="prompt" type="textarea" placeholder="请输入文本" :resizable="false" />

		</div>
		<div class="name-textBox-right">
			<div class="name-textBox-right-content">
				{{ translationResult }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NInput, NSelect, NButton } from 'naive-ui'
import { modelList } from '@/api/model'
import { translation } from '@/api/fanyi'
const modelListData = ref([])



const prompt = ref('')
const sourceLanguage = ref('英文')
const targetLanguage = ref('中文')
const translationResult = ref('')
const model = ref('')
const options = ref([
	// { label: '自动设别', value: '' },
	{ label: '中文', value: '中文' },
	{ label: '英文', value: '英文' },
])
const options1 = ref([
	{ label: '中文', value: '中文' },
	{ label: '英文', value: '英文' },
])

onMounted(() => {
	getModelList()
})

async function getModelList() {
	const res = await modelList()
	modelListData.value = res.data
	model.value = modelListData.value[0].modelDescribe
}

async function handleTranslation() {
	if (!prompt.value) {
		return;
	}
	const res = await translation({
		prompt: prompt.value,
		sourceLanguage: sourceLanguage.value,
		targetLanguage: targetLanguage.value,
		model: model.value,
	})
	translationResult.value = res
}
</script>

<style scoped lang="less">
.name-textBox {
	display: flex;

	:deep(.n-input) {

		.n-input__border,
		.n-input__state-border {
			border: none !important;
		}

		textarea {
			min-height: 500px !important;
		}
	}

	.name-textBox-left {
		flex: 1;
		height: calc(100vh - 100px);
		border-radius: 10px;

		padding: 10px;

		.name-selectBox {
			display: flex;
			justify-content: space-between;
			margin-bottom: 10px;

			div {
				flex: 1;
			}
		}
	}

	.name-textBox-right {
		flex: 1;
		min-height: 500px;
		border-radius: 10px;
		padding: 10px;


		.name-selectBox {
			margin-bottom: 10px;
		}

		.name-textBox-right-content {
			min-height: 500px;
			border: 1px solid #ccc;
			border-radius: 10px;
			padding: 10px;
			margin-top: 40px;
		}
	}



	div {
		margin-right: 20px;
	}
}
</style>

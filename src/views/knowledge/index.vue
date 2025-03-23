<script setup lang="ts">
import { h, onMounted, reactive, ref } from "vue";
import {
	NButton,
	NDataTable,
	DrawerPlacement,
	NDrawer,
	NDrawerContent,
	NForm,
	NFormItem,
	NInput,
	// NDivider,
	NSpace,
	useMessage,
	NGrid,
	NGi,
	NSwitch,
	NInputNumber,
	NSelect,
} from "naive-ui";
import {
	createKnowledgeReq,
	getKnowledge,
	delKnowledge,
} from "@/api/knowledge";
import to from "await-to-js";
import { useRouter } from "vue-router";
import { t } from "@/locales";

onMounted(() => {
	fetchData();
});

const router = useRouter();
const message = useMessage();

// 初始化表单数据对象
const formValue = ref({
	id: "", // 知识库id
	kid: "", // 附件id
	uid: "", // 用户id
	kname: "", // 知识库名称
	share: "0", // 是否分享
	description: "", // 知识库描述
	knowledgeSeparator: "", // 知识分隔符
	questionSeparator: "", // 提问分隔符
	overlapChar: 50, // 重叠字符数
	retrieveLimit: 3, // 知识库中检索的条数
	textBlockSize: 500, // 文本块大小
	vector: "", //  向量库
	vectorModel: "", //  向量模型
});

async function submitForm() {
	// 关闭弹框
	active.value = false;
	// 发起一个请求
	const [err, result] = await to(createKnowledgeReq(formValue.value));
	console.log("result===", result);
	if (err) {
		message.error(err.message);
	} else {
		message.success("添加成功");
		// 重新获取数据，更新表格
		await fetchData();
	}
}

async function delKnowledgeForm(kid: string) {
	// 发起一个请求
	const req = {
		kid: kid, // 附件id
	};
	const [err] = await to(delKnowledge(req));
	if (err) {
		message.error("操作失败!");
	} else {
		message.success("删除成功!");
	}
	// 重新获取数据，更新表格
	await fetchData();
}

function handleActionButtonClick(row: any, action1: string): void {
	// 跳转到知识库附件页面
	router.push({ path: "/annex/t", query: { kid: row.id } });
}

function handleUpdateValue(value: string) {
	formValue.value.share = value;
}

// 定义一个激活抽屉的函数，接受一个 DrawerPlacement 类型的参数
const activate = (place: DrawerPlacement) => {
	active.value = true;
	placement.value = place;
};

// 使用 ref 来创建响应式变量
const active = ref(false);
const placement = ref<DrawerPlacement>("right");

const getVector = reactive([
	{ label: "weaviate", value: "weaviate" },
	{ label: "milvus", value: "milvus" },
]);

const getVectorModel = reactive([
	{ label: "text-embedding-3-small", value: "text-embedding-3-small" },
	{ label: "bge-large-zh-v1.5", value: "quentinz/bge-large-zh-v1.5" },
]);

const createColumns = () => {
	return [
		...(false
			? [
					{
						title: "ID",
						key: "id",
						width: 80,
						ellipsis: true,
					},
			  ]
			: []),
		{
			title: t("knowledge.number"),
			key: "kid",
			width: 200,
		},
		{
			title: t("knowledge.name"),
			key: "kname",
			width: 200,
		},
		{
			title: t("knowledge.description"),
			key: "description",
			width: 200,
		},
		{
			title: t("knowledge.actions"),
			key: "actions",
			width: 200,
			render: (row: any) => {
				return [
					h(
						NButton,
						{
							onClick: () => delKnowledgeForm(row.kid),
							style: "margin-left: 8px; color: #FF4500;",
							class: "table-button",
							bordered: false,
						},
						{ default: () => t("knowledge.delete") }
					),

					h(
						NButton,
						{
							onClick: () => handleActionButtonClick(row, "action3"),
							style: "margin-left: 8px; color: #32CD32;",
							class: "table-button",
							bordered: false,
						},
						{ default: () => t("knowledge.attachment") }
					),
				];
			},
		},
	];
};

const tableData = ref([]);

const fetchData = async () => {
	try {
		// 发起一个请求
		const [err, result] = await to(getKnowledge());
		console.log("result===", result);
		if (err) {
			message.error(err.message);
		} else {
			tableData.value = result.rows;
		}
	} catch (error) {
		console.error("Error fetching data:", error);
	}
};

const columns = ref(createColumns());
</script>

<template>
	<div class="knowledge-container">
		<div class="knowledge-header">
			<n-button
				@click="activate('right')"
				type="primary"
				:bordered="false"
				class="create-button"
			>
				{{ $t("knowledge.createKnowledgeBase") }}
			</n-button>
		</div>

		<div class="knowledge-table-wrapper">
			<n-data-table
				striped
				:bordered="false"
				:columns="columns"
				:data="tableData"
				class="knowledge-table"
			/>
		</div>
	</div>

	<n-drawer
		class="knowledge-drawer"
		v-model:show="active"
		:width="800"
		:placement="placement"
		display-directive="show"
		:mask-closable="false"
	>
		<n-drawer-content
			:title="$t('knowledge.createKnowledgeBase')"
			class="drawer-content"
			closable
		>
			<n-space vertical>
				<n-form
					ref="formRef"
					:label-width="100"
					:model="formValue"
					class="knowledge-form"
					label-placement="left"
				>
					<n-grid :cols="24" :x-gap="24" :y-gap="16">
						<n-gi :span="12">
							<n-form-item label="知识库名称" required>
								<n-input
									v-model:value="formValue.kname"
									placeholder="请输入知识库名称"
									clearable
								/>
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="分隔符">
								<n-input
									v-model:value="formValue.knowledgeSeparator"
									placeholder="请输入知识分隔符"
									clearable
								/>
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="检索条数" required>
								<n-input-number
									v-model:value="formValue.retrieveLimit"
									placeholder="请输入检索条数"
									:min="1"
									:max="10"
									class="full-width"
								/>
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="文本块大小" required>
								<n-input-number
									v-model:value="formValue.textBlockSize"
									placeholder="请输入文本块大小"
									:min="100"
									:max="2000"
									class="full-width"
								/>
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="重叠字符">
								<n-input-number
									v-model:value="formValue.overlapChar"
									placeholder="请输入重叠字符数"
									:min="0"
									:max="200"
									class="full-width"
								/>
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="向量库" required>
								<n-select
									:options="getVector"
									v-model:value="formValue.vector"
									placeholder="请选择向量库"
									clearable
								></n-select>
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="提问分割符">
								<n-input
									v-model:value="formValue.questionSeparator"
									placeholder="请输入提问分割符"
									clearable
								/>
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="向量模型" required>
								<n-select
									:options="getVectorModel"
									v-model:value="formValue.vectorModel"
									placeholder="请选择向量模型"
									clearable
								></n-select>
							</n-form-item>
						</n-gi>

						<n-gi :span="24">
							<n-form-item :label="$t('knowledge.knowledgeDescription')">
								<n-input
									maxlength="1000"
									type="textarea"
									v-model:value="formValue.description"
									:placeholder="$t('knowledge.enterKnowledgeDescription')"
									:autosize="{ minRows: 3, maxRows: 5 }"
									show-count
								/>
							</n-form-item>
						</n-gi>

						<n-gi :span="24">
							<n-form-item label="是否公开" label-placement="left">
								<n-switch
									size="large"
									checked-value="1"
									unchecked-value="0"
									@update:value="handleUpdateValue"
								>
									<template #checked>是</template>
									<template #unchecked>否</template>
								</n-switch>
							</n-form-item>
						</n-gi>
					</n-grid>
				</n-form>
			</n-space>

			<template #footer>
				<div>
					<n-button
						@click="active = false"
						:bordered="true"
						style="margin-right: 10px"
					>
						取消
					</n-button>
					<n-button @click="submitForm" :bordered="false" type="primary">
						{{ $t("knowledge.add") }}
					</n-button>
				</div>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>

<style scoped>
.knowledge-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 20px;
	border-radius: 8px;
}

.knowledge-header {
	display: flex;
	justify-content: flex-start;
	margin-bottom: 20px;
}

.create-button {
	padding: 10px 20px;
	font-weight: 500;
	font-size: 14px;
	border-radius: 6px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
	height: 40px;
	min-width: 120px;
}

.create-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.knowledge-table-wrapper {
	flex: 1;
	overflow: hidden;
	border-radius: 8px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.knowledge-table {
	--n-td-color: transparent;
	--n-td-color-hover: rgba(0, 0, 0, 0.02);
	--n-td-text-color: #333;
	--n-border-color: #f0f0f0;
}

.knowledge-drawer {
	--n-body-padding: 24px;
}

.drawer-content {
	padding: 0;
}

.drawer-header {
	padding: 16px 24px;
	border-bottom: 1px solid #f0f0f0;
}

.drawer-title {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	color: #333;
}

.drawer-description {
	color: #666;
	margin: 16px 24px;
	font-size: 14px;
	line-height: 1.6;
}

.drawer-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding: 16px 24px;
	border-top: 1px solid #f0f0f0;
}

.knowledge-form {
	padding: 0 24px 24px;
}

.knowledge-form :deep(.n-form-item-label) {
	font-weight: 500;
	/* color: #333; */
}

.knowledge-form :deep(.n-form-item-feedback-wrapper) {
	min-height: 18px;
}

.knowledge-form :deep(.n-input),
.knowledge-form :deep(.n-input-number),
.knowledge-form :deep(.n-select) {
	width: 100%;
	border-radius: 6px;
	height: 40px;
}

.knowledge-form :deep(.n-input .n-input__input-el),
.knowledge-form :deep(.n-input-number-input),
.knowledge-form :deep(.n-base-selection) {
	height: 40px;
	font-size: 14px;
}

.knowledge-form :deep(.n-input:hover),
.knowledge-form :deep(.n-input-number:hover),
.knowledge-form :deep(.n-select:hover) {
	border-color: #18a058;
}

.knowledge-form :deep(.n-input:focus),
.knowledge-form :deep(.n-input-number:focus),
.knowledge-form :deep(.n-select:focus) {
	border-color: #18a058;
	box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.2);
}

.knowledge-form :deep(.n-input-number) {
	width: 100%;
}

.knowledge-form :deep(.n-button) {
	height: 40px;
	font-size: 14px;
}

.cancel-button {
	padding: 10px 20px;
	border-radius: 6px;
	transition: all 0.3s ease;
	height: 40px;
	min-width: 100px;
	font-size: 14px;
}

.cancel-button:hover {
}

.draw-button {
	padding: 10px 20px;
	font-weight: 500;
	border-radius: 6px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
	height: 40px;
	min-width: 100px;
	font-size: 14px;
}

.draw-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>

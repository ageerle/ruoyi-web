<script setup lang="ts">
import { h, onMounted, reactive, ref } from "vue";
import {
	NButton,
	// NDataTable, // NDataTable 已被移除，可以注释或删除
	DrawerPlacement,
	NDrawer,
	NDrawerContent,
	NForm,
	NFormItem,
	NInput,
	NSpace,
	useMessage,
	NGrid,
	NGi,
	NSwitch,
	NInputNumber,
	NSelect,
	NPagination,
	NCard, // 添加 NCard 导入
} from "naive-ui";
import {
	createKnowledgeReq,
	getKnowledge,
	delKnowledge,
} from "@/api/knowledge";
import { useRouter } from "vue-router";
import { t } from "@/locales";
import { getModelListByCategory } from "@/api/model";
import { getPromptTemplateListByCategory } from "@/api/promptTemplate";

onMounted(() => {
	fetchData(), getModelList(), getPromptTemplateList();
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
	vectorModelName: "weaviate", //  向量库
	embeddingModelName: "baai/bge-m3", //  向量模型
	promptTemplateId: "", //  提示词模板ID
});

async function submitForm() {
	// 关闭弹框
	active.value = false;
	const result = await createKnowledgeReq(formValue.value);
	if (result.code == 200) {
		message.success("添加成功");
		// 重新获取数据，更新表格
		await fetchData();
	}
}

async function delKnowledgeForm(id: string) {
	// 发起一个请求
	const req = {
		id: id, // 附件id
	};
	const result = await delKnowledge(req);
	if (result.code == 200) {
		message.success("删除成功!");
	} else {
		message.error("删除失败!" + result.data.msg);
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
]);

const getVectorModel = ref([]);
const getPromptTemplate = ref([]);

async function getModelList() {
	try {
		const res = await getModelListByCategory('vector');
		getVectorModel.value = res.rows;
	} catch (error) {
		message.error("获取模型列表失败");
	}
}

async function getPromptTemplateList() {
	try {
		const res = await getPromptTemplateListByCategory('vector');
		getPromptTemplate.value = res.rows;
	} catch (error) {
		message.error("获取提示词模板列表失败");
	}
}


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
							onClick: () => delKnowledgeForm(row.id),
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

const pagination = reactive({
	page: 1,
	pageSize: 12,
	itemCount: 0,
	pageSizes: [12, 24, 36, 48],
	onUpdatePage: (page: number) => {
		pagination.page = page;
		fetchData();
	},
	onUpdatePageSize: (pageSize: number) => {
		pagination.pageSize = pageSize;
		pagination.page = 1;
		fetchData();
	},
});

const fetchData = async () => {
	// 发起一个请求
	const result = await getKnowledge(pagination.page, pagination.pageSize);
	if (result.code == 200) {
		tableData.value = result.rows;
		console.log('Knowledge data:', result);
		pagination.itemCount = result.total; // 根据后端返回的数据结构，使用 total 作为总数
	}
};


</script>

<template>
	<div class="page-container">
		<div class="create-app-panel">
			<n-button type="primary" @click="activate('right')">
				创建知识库
			</n-button>
		</div>

		<div class="content-panel">
			<div class="knowledge-card-list">
				<n-grid :x-gap="8" :y-gap="8" :cols="4" item-responsive responsive="screen">
					<n-gi v-for="item in tableData" :key="item.id">
						<n-card :title="item.kname" hoverable class="knowledge-card">
							<!-- Add icon and subtitle similar to the image -->
							<template #cover>
								<!-- Placeholder for an icon, e.g., using an NIcon component or an img tag -->
							</template>
							<div class="card-meta">
								<span class="card-author">{{ item.id || 'N/A2' }}</span> - <span class="card-date">{{ item.createTime || 'N/A1' }}</span>
							</div>
							<p class="card-description">{{ item.description }}</p>
							<template #action>
								<n-space justify="end">
									<n-button size="small" @click="handleActionButtonClick(item, 'action3')" type="primary" ghost>
										{{ $t("knowledge.attachment") }}
									</n-button>
									<n-button size="small" @click="delKnowledgeForm(item.id)" type="error" ghost>
										{{ $t("knowledge.delete") }}
									</n-button>
								</n-space>
							</template>
						</n-card>
					</n-gi>
				</n-grid>
			</div>

			<div class="pagination-wrapper">
				<n-pagination
					v-model:page="pagination.page"
					:item-count="pagination.itemCount"
					v-model:page-size="pagination.pageSize"
					:page-sizes="pagination.pageSizes"
					show-size-picker
					@update:page="pagination.onUpdatePage"
					@update:page-size="pagination.onUpdatePageSize"
				/>
			</div>
		</div>
	</div>

	<n-drawer class="knowledge-drawer" v-model:show="active" :width="800" :placement="placement"
		display-directive="show" :mask-closable="false">
		<n-drawer-content :title="$t('knowledge.createKnowledgeBase')" class="drawer-content" closable>
			<n-space vertical>
				<n-form ref="formRef" :label-width="100" :model="formValue" class="knowledge-form"
					label-placement="left">
					<n-grid :cols="24" :x-gap="24" :y-gap="16">
						<n-gi :span="12">
							<n-form-item label="知识库名称" required>
								<n-input v-model:value="formValue.kname" placeholder="请输入知识库名称" clearable />
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="分隔符">
								<n-input v-model:value="formValue.knowledgeSeparator" placeholder="请输入知识分隔符"
									clearable />
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="检索条数" required>
								<n-input-number v-model:value="formValue.retrieveLimit" placeholder="请输入检索条数" :min="1"
									:max="10" class="full-width" />
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="文本块大小" required>
								<n-input-number v-model:value="formValue.textBlockSize" placeholder="请输入文本块大小"
									:min="100" :max="2000" class="full-width" />
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="重叠字符">
								<n-input-number v-model:value="formValue.overlapChar" placeholder="请输入重叠字符数" :min="0"
									:max="200" class="full-width" />
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="向量库" required>
								<n-select :options="getVector" v-model:value="formValue.vectorModelName"
									placeholder="请选择向量库" clearable></n-select>
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="提问分割符">
								<n-input v-model:value="formValue.questionSeparator" placeholder="请输入提问分割符" clearable />
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="向量模型" required>
								<n-select :options="getVectorModel" v-model:value="formValue.embeddingModelName"
									value-field="modelName" label-field="modelName" placeholder="请选择向量模型"
									clearable></n-select>
							</n-form-item>
						</n-gi>

						<n-gi :span="12">
							<n-form-item label="提示词模板">
								<n-select
									:options="getPromptTemplate"
									v-model:value="formValue.promptTemplateId"
									value-field="id"
									label-field="templateContent"
									placeholder="请选择提示词模板"
									clearable
								>
								</n-select>
							</n-form-item>
						</n-gi>



						<n-gi :span="24">
							<n-form-item :label="$t('knowledge.knowledgeDescription')">
								<n-input maxlength="1000" type="textarea" v-model:value="formValue.description"
									:placeholder="$t('knowledge.enterKnowledgeDescription')"
									:autosize="{ minRows: 3, maxRows: 5 }" show-count />
							</n-form-item>
						</n-gi>

						<n-gi :span="24">
							<n-form-item label="是否公开" label-placement="left">
								<n-switch size="large" checked-value="1" unchecked-value="0"
									@update:value="handleUpdateValue">
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
					<n-button @click="active = false" :bordered="true" style="margin-right: 10px">
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
.page-container {
  min-height: 100vh;
  background-color: var(--n-color-body);
  padding: 20px;
  padding-top: 80px;
}

.create-app-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.panel-title {
	font-size: 16px;
	color: #888;
	margin-bottom: 15px;
	font-weight: bold;
}

.panel-button {
	display: flex;
	align-items: center;
	width: 100%;
	padding: 10px 15px;
	margin-bottom: 10px;
	font-size: 14px;
	color: #333;
	border-radius: 6px;
	transition: background-color 0.2s ease;
}

.panel-button:hover {
	background-color: #f0f2f5;
}

.content-panel {
	flex: 1; /* Takes the remaining space */
}


.knowledge-card {
	border-radius: 20px;
	overflow: hidden;
	transition: all 0.3s ease;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	margin: 10px; /* 添加上下左右 10px 边距 */
}

.knowledge-card:hover {
	transform: translateY(-5px); /* 更明显的悬停效果 */
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-meta {
	font-size: 12px;
	color: #999;
	margin-top: 5px;
	margin-bottom: 10px;
}

.card-author,
.card-date {
	color: #666;
}

.card-description {
	font-size: 14px;
	color: #666;
	min-height: 60px; /* 确保描述区域有最小高度 */
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 3; /* 限制描述显示3行 */
	-webkit-box-orient: vertical;
}

.pagination-wrapper {
	display: flex;
	justify-content: flex-end;
	margin-top: 20px;
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



.knowledge-table {
	--n-td-color: transparent;
	--n-td-color-hover: rgba(0, 0, 0, 0.02);
	--n-td-text-color: #333;
	--n-border-color: #f0f0f0;
}

.knowledge-card-list {
	margin-top: 20px;
}

.knowledge-card {
	border-radius: 20px;
	overflow: hidden;
	transition: all 0.3s ease;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.knowledge-card:hover {
	transform: translateY(-5px); /* 更明显的悬停效果 */
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-description {
	font-size: 14px;
	color: #666;
	min-height: 60px; /* 确保描述区域有最小高度 */
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 3; /* 限制描述显示3行 */
	-webkit-box-orient: vertical;
}

.pagination-wrapper {
	display: flex;
	justify-content: flex-end;
	margin-top: 20px;
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


	height: 40px;
	font-size: 14px;
}
}

.cancel-button {
	padding: 10px 20px;
	border-radius: 6px;
	transition: all 0.3s ease;
	height: 40px;
	min-width: 100px;
	font-size: 14px;
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

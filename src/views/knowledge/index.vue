<script setup lang="ts">
import { h, onMounted, reactive, ref, watch } from "vue";
import {
	NButton,
	NDataTable,
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
	NRadio,
	NRadioGroup,
} from "naive-ui";
import {
	createKnowledgeReq,
	getKnowledge,
	delKnowledge,
	getRoleList,
} from "@/api/knowledge";
import { useRouter } from "vue-router";
import { t } from "@/locales";
import { list } from "@/api/model";

onMounted(() => {
	fetchData(), getModelList(), fetchRoleList();
});

const router = useRouter();
const message = useMessage();

// 初始化表单数据对象
const formValue = ref({
	id: "", // 知识库id
	kid: "", // 附件id
	uid: "", // 用户id
	kname: "", // 知识库名称
	share: "1", // 是否分享，默认为1表示公开
	description: "", // 知识库描述
	knowledgeSeparator: "", // 知识分隔符
	questionSeparator: "", // 提问分隔符
	overlapChar: 50, // 重叠字符数
	retrieveLimit: 3, // 知识库中检索的条数
	textBlockSize: 500, // 文本块大小
	vectorModelName: "weaviate", //  向量库
	embeddingModelName: "baai/bge-m3", //  向量模型
	authType: "10", // 权限类型，10本人可见，20角色可见
	authRoles: "", // 角色字符串
});

// 角色列表
const roleOptions = ref([]);

// 获取角色列表
async function fetchRoleList() {
	try {
		const res = await getRoleList();
		if (res.code === 200) {
			roleOptions.value = res.data.map((item) => ({
				label: item.roleName,
				value: item.roleId,
			}));
		}
	} catch (error) {
		message.error("获取角色列表失败");
	}
}

async function submitForm() {
	// 验证必填项
	if (!formValue.value.kname) {
		message.error("请输入知识库名称");
		return;
	}
	if (!formValue.value.retrieveLimit) {
		message.error("请输入检索条数");
		return;
	}
	if (!formValue.value.textBlockSize) {
		message.error("请输入文本块大小");
		return;
	}
	if (!formValue.value.vectorModelName) {
		message.error("请选择向量库");
		return;
	}
	if (!formValue.value.embeddingModelName) {
		message.error("请选择向量模型");
		return;
	}
	if (
		formValue.value.share === "0" &&
		formValue.value.authType === "20" &&
		(!formValue.value.authRoles || formValue.value.authRoles.length === 0)
	) {
		message.error("请选择角色");
		return;
	}

	// 如果authRoles是数组，将其转换为逗号分隔的字符串
	if (Array.isArray(formValue.value.authRoles)) {
		formValue.value.authRoles = formValue.value.authRoles.join(",");
	}
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

// 监听share值变化，当share为0时，重置authType为10
watch(
	() => formValue.value.share,
	(newValue) => {
		if (newValue === "0") {
			formValue.value.authType = "10";
			formValue.value.authRoles = "";
		}
	}
);

// 定义一个激活抽屉的函数，接受一个 DrawerPlacement 类型的参数
const activate = (place: DrawerPlacement) => {
	// 重置表单数据
	formValue.value = {
		id: "", // 知识库id
		kid: "", // 附件id
		uid: "", // 用户id
		kname: "", // 知识库名称
		share: "1", // 是否公开
		description: "", // 知识库描述
		knowledgeSeparator: "", // 知识分隔符
		questionSeparator: "", // 提问分隔符
		overlapChar: 50, // 重叠字符数
		retrieveLimit: 3, // 知识库中检索的条数
		textBlockSize: 500, // 文本块大小
		vectorModelName: "weaviate", //  向量库
		embeddingModelName: "baai/bge-m3", //  向量模型
		authType: "10", // 权限类型，10本人可见，20角色可见
		authRoles: "", // 角色字符串
	};
	active.value = true;
	placement.value = place;
};

// 使用 ref 来创建响应式变量
const active = ref(false);
const placement = ref<DrawerPlacement>("right");

const getVector = reactive([{ label: "weaviate", value: "weaviate" }]);

const getVectorModel = ref([]);

async function getModelList() {
	try {
		const res = await list("vector");
		getVectorModel.value = res.rows;
	} catch (error) {
		message.error("获取模型列表失败");
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
		{ title: t("knowledge.number"), key: "kid", width: 200 },
		{ title: t("knowledge.name"), key: "kname", width: 200 },
		{ title: t("knowledge.description"), key: "description", width: 200 },
		{
			title: t("knowledge.share"),
			key: "share",
			width: 100,
			render: (row: any) => {
				return row.share === 1 ? "是" : "否";
			},
		},
		{
			title: t("knowledge.authType"),
			key: "authType",
			width: 100,
			render: (row: any) => {
				if (row.share === 1 || !row.authType) return "-";
				return row.authType === "10" ? "本人可见" : "角色可见";
			},
		},
		{
			title: t("knowledge.authRoles"),
			key: "authRoles",
			width: 200,
			render: (row: any) => {
				if (row.share === "1" || row.authType === "10") return "-";
				if (!row.authRoles) return "-";
				const roleIds = row.authRoles.split(",").map((id) => parseInt(id));
				return roleIds
					.map(
						(id) =>
							roleOptions.value.find((role) => role.value === id)?.label || id
					)
					.join("、");
			},
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

const fetchData = async () => {
	// 发起一个请求
	const result = await getKnowledge();
	if (result.code == 200) {
		tableData.value = result.rows;
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
									v-model:value="formValue.vectorModelName"
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
									v-model:value="formValue.embeddingModelName"
									value-field="modelDescribe"
									label-field="modelName"
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
									v-model:value="formValue.share"
									@update:value="handleUpdateValue"
								>
									<template #checked>是</template>
									<template #unchecked>否</template>
								</n-switch>
							</n-form-item>
						</n-gi>

						<!-- 权限类型 -->
						<n-gi :span="24" v-if="formValue.share === '0'">
							<n-form-item label="权限类型" label-placement="left">
								<n-radio-group v-model:value="formValue.authType">
									<n-radio value="10">本人可见</n-radio>
									<n-radio value="20">角色可见</n-radio>
								</n-radio-group>
							</n-form-item>
						</n-gi>

						<!-- 角色选择 -->
						<n-gi
							:span="24"
							v-if="formValue.share === '0' && formValue.authType === '20'"
						>
							<n-form-item label="选择角色" label-placement="left" required>
								<n-select
									v-model:value="formValue.authRoles"
									:options="roleOptions"
									multiple
									placeholder="请选择角色"
									clearable
								/>
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

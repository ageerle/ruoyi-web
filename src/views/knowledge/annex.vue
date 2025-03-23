<script setup lang="ts">
import { h, onMounted, ref } from "vue";
import {
	NButton,
	NDataTable,
	// DrawerPlacement,
	NFormItem,
	NSpin,
	NSpace,
	UploadFileInfo,
	NUpload,
	NUploadDragger,
	NP,
	useMessage,
	NModal,
	NCard,
} from "naive-ui";
import { SvgIcon } from "@/components/common";
import { getToken } from "@/store/modules/auth/helper";
import { getKnowledgeDetail, delKnowledgeDetail } from "@/api/knowledge";
import to from "await-to-js";
import { useRouter } from "vue-router";
import { t } from "@/locales";

const router = useRouter();
const message = useMessage();
const token = getToken();
const headers = { Authorization: `Bearer ${token}` };

// 状态管理
const kid = ref<string>("");
const spinShow = ref(false);
const showModal = ref(false);
const tableData = ref([]);
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
	},
});

// 生命周期钩子
onMounted(() => {
	kid.value = router.currentRoute.value.query.kid as string;
	fetchData();
});

// 表格列定义
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
			title: t("annex.docId"),
			key: "docId",
		},
		{
			title: t("annex.docName"),
			key: "docName",
		},
		{
			title: t("annex.docType"),
			key: "docType",
		},
		{
			title: t("annex.action"),
			key: "actions",
			render: (row: any) => {
				return [
					h(
						NButton,
						{
							onClick: () => delKnowledgeForm(row.docId),
							style: "margin-left: 8px; color: #FF4500;",
						},
						{ default: () => t("annex.deleteAttachment") }
					),

					h(
						NButton,
						{
							onClick: () => handleActionButtonClick(row, "action4"),
							style: "margin-left: 8px; color: #32CD32;",
						},
						{ default: () => t("annex.knowledgeFragment") }
					),
				];
			},
		},
	];
};
const columns = ref(createColumns());

// 数据获取
const fetchData = async () => {
	try {
		const [err, result] = await to(getKnowledgeDetail(kid.value));
		if (err) {
			message.error(err.message);
		} else {
			tableData.value = result.rows;
		}
	} catch (error) {
		console.error("Error fetching data:", error);
	}
};

// 上传相关函数
function handleFinish({
	file,
	event,
}: {
	file: UploadFileInfo;
	event?: ProgressEvent;
}) {
	const xhr = event?.currentTarget as XMLHttpRequest;
	if (xhr) {
		try {
			const responseData = JSON.parse(xhr.responseText);
			if (responseData.code == 500) {
				message.error(responseData.msg);
			} else {
				message.success(t("annex.fileUploadSuccess"));
			}
		} catch (error) {
			console.error("解析响应数据失败:", error);
		}
	}
	showModal.value = false;
	spinShow.value = false;
	fetchData();
}

function handleBeforeUpload() {
	spinShow.value = true;
}

// 操作函数
function handleActionButtonClick(row: any, action1: string): void {
	router.push({ path: "/fragment/t", query: { docId: row.docId } });
}

function activate() {
	showModal.value = true;
}

// 删除附件
async function delKnowledgeForm(docId: string) {
	const req = {
		kid: kid.value,
		docId: docId,
	};

	const [err] = await to(delKnowledgeDetail(req));

	if (err) {
		message.error(t("annex.deletionFailed"));
	} else {
		message.success(t("annex.attachmentDeletedSuccess"));
	}
	await fetchData();
}

// 返回上一页
function goBack() {
	router.go(-1);
}
</script>

<template>
	<n-card class="annex-container" :bordered="false">
		<div class="annex-header">
			<n-button @click="goBack" class="back-button">
				<svg-icon icon="mage:arrow-left" class="back-icon"></svg-icon>
				返回
			</n-button>
			<n-button
				@click="activate"
				type="primary"
				:bordered="false"
				class="upload-button"
			>
				{{ $t("annex.uploadAttachment") }}
			</n-button>
		</div>

		<n-data-table
			:columns="columns"
			:data="tableData"
			:pagination="pagination"
			:bordered="false"
			class="annex-table"
		/>
	</n-card>

	<n-modal
		v-model:show="showModal"
		:title="$t('annex.uploadAttachment')"
		:auto-focus="false"
		preset="dialog"
	>
		<n-space vertical>
			<n-form-item>
				<n-spin :show="spinShow">
					<n-upload
						class="annex-upload"
						directory-dnd
						action="/api/knowledge/attach/upload"
						name="file"
						:data="{ kid: kid }"
						:on-before-upload="handleBeforeUpload"
						:headers="headers"
						@finish="handleFinish"
						:max="1"
					>
						<n-upload-dragger class="upload-dragger">
							<div class="upload-content">
								<div class="upload-icon-container">
									<SvgIcon icon="mage:upload" class="upload-icon"></SvgIcon>
								</div>

								<div class="upload-info">
									<n-p class="upload-title">
										{{ $t("annex.pleaseUploadFile") }}
									</n-p>

									<n-p class="upload-desc">
										{{ $t("annex.supportedFormats") }}
									</n-p>
								</div>

								<div class="upload-warnings">
									<div class="warning-title">{{ $t("annex.uploadNotes") }}</div>
									<n-p class="upload-warning">
										<span class="warning-dot">•</span>
										{{ $t("annex.friendlyReminder") }}
									</n-p>
									<n-p class="upload-warning">
										<span class="warning-dot">•</span>
										{{ $t("annex.largeFileWarning") }}
									</n-p>
									<n-p class="upload-warning">
										<span class="warning-dot">•</span>
										{{ $t("annex.utf8Warning") }}
									</n-p>
									<n-p class="upload-warning">
										<span class="warning-dot">•</span>
										{{ $t("annex.uploadCharacterLimit") }}
									</n-p>
								</div>
							</div>
						</n-upload-dragger>
					</n-upload>
				</n-spin>
			</n-form-item>
		</n-space>
	</n-modal>
</template>

<style scoped>
.annex-container {
	height: 100%;
	border-radius: 20px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.annex-header {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
	padding: 8px 0;
}

.back-button {
	display: flex;
	align-items: center;
	font-weight: 500;
	padding: 8px 16px;
	border-radius: 6px;
}

.back-icon {
	margin-right: 4px;
	font-size: 1rem;
}

.upload-button {
	font-weight: 500;
	padding: 8px 16px;
	border-radius: 6px;
}

.annex-table {
	border-radius: 8px;
	overflow: hidden;
}

.annex-modal {
	width: 100%;
	max-width: 520px;
}

.upload-dragger {
	padding: 32px;
	border: 2px dashed #e0e0e0;
	border-radius: 12px;
	text-align: center;
	transition: all 0.3s;
}

.upload-dragger:hover {
	border-color: #1890ff;
}

.upload-content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.upload-icon-container {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 64px;
	height: 64px;
	border-radius: 50%;
	margin-bottom: 16px;
}

.upload-icon {
	font-size: 2.5rem;
	color: #1890ff;
}

.upload-info {
	margin-bottom: 24px;
}

.upload-title {
	font-size: 18px;
	font-weight: 500;
	margin-bottom: 8px;
}

.upload-desc {
	font-size: 14px;
	margin-bottom: 8px;
}

.upload-warnings {
	width: 100%;
	border-radius: 8px;
	padding: 16px;
	text-align: left;
	border-left: 4px solid #faad14;
}

.warning-title {
	font-weight: 500;
	color: #d46b08;
	margin-bottom: 8px;
	font-size: 15px;
}

.upload-warning {
	margin: 6px 0;
	color: #873800;
	font-size: 13px;
	display: flex;
	align-items: flex-start;
}

.warning-dot {
	margin-right: 6px;
	color: #fa8c16;
}
</style>

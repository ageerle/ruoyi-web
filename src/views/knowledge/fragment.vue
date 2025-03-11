<script setup lang="ts">
import { onMounted, ref } from "vue";
import { NButton, NDataTable, useMessage } from "naive-ui";
import { getfragmentList } from "@/api/knowledge";
import to from "await-to-js";
import { useRouter } from "vue-router";
import { t } from "@/locales";
import { SvgIcon } from "@/components/common";

const router = useRouter();

const docId = ref<string>("");

onMounted(() => {
	docId.value = router.currentRoute.value.query.docId as string;
	fetchData();
});

const message = useMessage();

const goBack = () => {
	router.go(-1);
};

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
			title: t("knowledge.no"),
			key: "fid",
		},

		{
			title: t("knowledge.content"),
			key: "content",
			width: 800,
			ellipsis: {
				tooltip: {
					contentStyle: "max-width:300px",
				},
			},
		},
	];
};

const tableData = ref([]);
const fetchData = async () => {
	try {
		// 发起一个请求
		const [err, result] = await to(getfragmentList(docId.value));
		console.log("fragmenresult===", result);
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
	<div class="flex h-full table-box" style="border-bottom-left-radius: 20px">
		<main class="flex-1 overflow-hidden h-full annex-main p-4">
			<div class="annex-header">
				<n-button @click="goBack" class="back-button">
					<svg-icon icon="mage:arrow-left" class="back-icon"></svg-icon>
					返回
				</n-button>
			</div>
			<n-data-table
				:columns="columns"
				:data="tableData"
				:pagination="pagination"
				:theme-overrides="{
					thPaddingMedium: '12px 16px',
					tdPaddingMedium: '12px 16px',
					thTextColor: 'var(--n-text-color)',
					tdColor: 'var(--n-color)',
					borderColor: 'var(--n-border-color)',
				}"
				class="rounded-lg shadow-sm"
				:scroll-x="1200"
			/>
		</main>
	</div>
</template>

<style scoped>
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
</style>

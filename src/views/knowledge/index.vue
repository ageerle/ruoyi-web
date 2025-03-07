<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import {
	NButton, NDataTable, DrawerPlacement, NDrawer,
	NDrawerContent, NForm, NFormItem, NInput, NDivider,
	NSpace, useMessage, NGrid, NGi,NSwitch,NInputNumber,NSelect,NSlider 
} from 'naive-ui';
import { createKnowledgeReq, getKnowledge, delKnowledge } from '@/api/knowledge';
import to from 'await-to-js';
import { useRouter } from 'vue-router';
import { t } from '@/locales';

onMounted(() => { fetchData() });

const router = useRouter();
const message = useMessage();

// 初始化表单数据对象
const formValue = ref({
	id: '', // 知识库id
	kid: '', // 附件id
	uid: '', // 用户id
	kname: '', // 知识库名称
	share: '0', // 是否分享
	description: '', // 知识库描述
	knowledgeSeparator: '', // 知识分隔符
	questionSeparator: '', // 提问分隔符
	overlapChar: 50, // 重叠字符数
	retrieveLimit: 3, // 知识库中检索的条数
	textBlockSize: 500, // 文本块大小
	vector: '', //  向量库
	vectorModel: '', //  向量模型
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
		kid: kid // 附件id
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
	router.push({ path: '/annex/t', query: { kid: row.id } });
}


function handleUpdateValue(value: string) {
	formValue.value.share = value
}


// 定义一个激活抽屉的函数，接受一个 DrawerPlacement 类型的参数
const activate = (place: DrawerPlacement) => {
	active.value = true;
	placement.value = place;
}

// 使用 ref 来创建响应式变量
const active = ref(false);
const placement = ref<DrawerPlacement>('right');

const getVector = reactive([
      { label: 'weaviate', value: 'weaviate' },
      { label: 'milvus', value: 'milvus' }
]);

const getVectorModel = reactive([
      { label: 'text-embedding-3-small', value: 'text-embedding-3-small' }
]);

const createColumns = () => {
	return [
		...(false
			? [{
				title: "ID",
				key: 'id',
				width: 80,
				ellipsis: true,
			}]
			: []),
		{
			title: t('knowledge.number'),
			key: 'kid',
			width: 200
		},
		{
			title: t('knowledge.name'),
			key: 'kname',
			width: 200
		},
		{
			title: t('knowledge.description'),
			key: 'description',
			width: 200
		},
		{
			title: t('knowledge.actions'),
			key: 'actions',
			width: 200,
			render: (row: any) => {
				return [
					h(NButton, {
						onClick: () => delKnowledgeForm(row.kid),
						style: 'margin-left: 8px; color: #FF4500;',
						class: 'table-button',
						bordered: false,
					}, { default: () => t('knowledge.delete') }),

					h(NButton, {
						onClick: () => handleActionButtonClick(row, 'action3'),
						style: 'margin-left: 8px; color: #32CD32;',
						class: 'table-button',
						bordered: false,
					}, { default: () => t('knowledge.attachment') }),
				];
			}
		}
	];
}

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
		console.error('Error fetching data:', error);
	}
};

const columns = ref(createColumns());



</script>

<template>
	<div class="flex h-full table-box" style="border-bottom-left-radius: 20px;">
		<main class="flex-1 overflow-hidden h-full">
			<div style="display: flex; justify-content: flex-start; " class="know-header">
				<n-button @click="activate('right')" type="primary" :bordered="false" class="success-button">
					{{ $t('knowledge.createKnowledgeBase') }}
				</n-button>
			</div>
			<n-data-table striped :bordered="false" :columns="columns" :data="tableData" />
		</main>
	</div>

	<n-drawer class="knowledge-draw" v-model:show="active" :width="600" :placement="placement">
		<n-drawer-content :title="$t('knowledge.createKnowledgeBase')">
			{{ $t('knowledge.createYourKnowledgeBase') }}
			<n-divider />
			<n-space vertical>

				<n-form ref="formRef" :label-width="80" :model="formValue">

					<n-grid x-gap="12" :cols="2">
						<n-gi>
							<n-form-item label="知识库名称">
								<n-input v-model:value="formValue.kname" placeholder="请输入知识库名称" />
							</n-form-item>
						</n-gi>
				
						<n-gi>
							<n-form-item label="分隔符" >
								<n-input v-model:value="formValue.knowledgeSeparator" placeholder="请输入知识分隔符" />
							</n-form-item>
						</n-gi>

						<n-gi >
							<n-form-item label="知识库中检索的条数" >
								<n-input-number  v-model:value="formValue.retrieveLimit"
									placeholder="请输入检索条数" />
							</n-form-item>
						</n-gi>

						<n-gi >
							<n-form-item label="文本块大小" path="phone">
								<n-input-number v-model:value="formValue.textBlockSize"  placeholder="请输入文本块大小"/>
					
							</n-form-item>
						</n-gi>



						<n-gi>
							<n-form-item label="重叠字符" >
								<n-input-number  v-model:value="formValue.overlapChar"  
									placeholder="请输入重叠字符数" />
							</n-form-item>
						</n-gi>

						<n-gi>
							<n-form-item label="向量库" >
							<n-select :options="getVector" v-model:value="formValue.vector"  
								placeholder="请选择向量库" 
							></n-select>
						    </n-form-item>
						</n-gi>

					
						<n-gi >
							<n-form-item label="提问分割符" path="phone">
								<n-input placeholder="请输入提问分割符"/>
							</n-form-item>
						</n-gi>

						<n-gi>
							<n-form-item label="向量模型" path="formValue.description">
							<n-select :options="getVectorModel" v-model:value="formValue.vectorModel"  
								placeholder="请选择向量模型"
							></n-select>
						    </n-form-item>
						</n-gi>

						
						<n-gi :span="24">
							<n-form-item :label="$t('knowledge.knowledgeDescription')" >
								<n-input maxlength="1000" type="textarea" v-model:value="formValue.description"
									:placeholder="$t('knowledge.enterKnowledgeDescription')" />
							</n-form-item>
						</n-gi>

						
						<n-gi :span="24">
							<n-form-item label="是否公开">
								<n-switch size="large" checked-value="1" unchecked-value="0"
									@update:value="handleUpdateValue" />
							</n-form-item>
						</n-gi>
			
						<n-gi  :span="24">
							<div style="display: flex; justify-content: flex-end">
								<n-button @click="submitForm" :bordered="false" type="primary" class="draw-button">
									{{ $t('knowledge.add') }}
								</n-button>
							</div>
						</n-gi>
					</n-grid>
				</n-form>


			</n-space>
		</n-drawer-content>
	</n-drawer>
</template>

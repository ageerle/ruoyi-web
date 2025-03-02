<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { NButton, NDataTable, DrawerPlacement, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NDivider, NSpace, useMessage } from 'naive-ui';
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
  description: '', // 知识库描述 
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

// 定义一个激活抽屉的函数，接受一个 DrawerPlacement 类型的参数
const activate = (place: DrawerPlacement) => {
  active.value = true;
  placement.value = place;
}

// 使用 ref 来创建响应式变量
const active = ref(false);
const placement = ref<DrawerPlacement>('right');

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

<n-drawer class="knowledge-draw" v-model:show="active" :width="540" :placement="placement">
      <n-drawer-content :title="$t('knowledge.createKnowledgeBase')">
          {{ $t('knowledge.createYourKnowledgeBase') }}
          <n-divider />
          <n-space vertical>
            <n-form ref="formRef">
              <n-form-item
                :label="$t('knowledge.knowledgeName')" path="formValue.kname">
                <n-input v-model:value="formValue.kname" :placeholder="$t('knowledge.enterKnowledgeName')" />
              </n-form-item>
              <n-form-item :label="$t('knowledge.knowledgeDescription')" path="formValue.description">
                <n-input maxlength="1000"
                  type="textarea"
                  v-model:value="formValue.description"
                  :placeholder="$t('knowledge.enterKnowledgeDescription')" 
                />
              </n-form-item>

              <n-col :span="24">
                <div style="display: flex; justify-content: flex-end">
                  <n-button @click="submitForm" :bordered="false" type="primary" class="draw-button">
                    {{ $t('knowledge.add') }}
                  </n-button>
                </div>
              </n-col>

            </n-form>
          </n-space>
      </n-drawer-content>
</n-drawer>
</template>

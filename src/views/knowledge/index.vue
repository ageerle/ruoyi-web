<script setup lang="ts">

import {  h, onMounted, ref } from 'vue'
import { NButton,NDataTable,DrawerPlacement,NDrawer,NDrawerContent,NForm,NFormItem,NInput,NDivider,NSpace,useMessage
} from 'naive-ui'
import { createKnowledgeReq,getKnowledge } from '@/api/knowledge'
import to from "await-to-js";
import { useRouter } from 'vue-router'

onMounted(() => { fetchData() });

const router = useRouter()
const message = useMessage()

// 初始化表单数据对象
const formValue = ref({
	id:'',// 知识库id
	kid:'', // 附件id
	uid:'',//  用户id  
	kname:'', // 知识库名称
	description:'',// 知识库描述 
});

 async function submitForm() {
  //关闭弹框
  active.value = false
  // 发起一个请求
  const [err, result] = await to(createKnowledgeReq(formValue.value));
	  console.log("result===", result)
    if (err) {
      message.error(err.message)
    } else {
      message.success('知识库创建成功!')
    }
}

function handleActionButtonClick(row: any,action1:string): void {
  // 跳转到知识库附件页面
  router.push({ path: '/annex/t', query: { kid: row.id } });
}

// 定义一个激活抽屉的函数，接受一个 DrawerPlacement 类型的参数
const activate = (place: DrawerPlacement) => {
  active.value = true
  placement.value = place
}

// 使用 ref 来创建响应式变量
const active = ref(false)

const placement = ref<DrawerPlacement>('right')

const createColumns = () => {
  return [
  ...(false
      ? [{
          title: '角色ID',
          key: 'id',
          width: 80,
          ellipsis: true,
        }]
      : []),
      {
      title: '编号',
      key: 'kid'
    },
    {
      title: '知识名称',
      key: 'kname'
    },
    {
      title: '知识描述',
      key: 'description'
    },
  
    {
      title: '操作',
      key: 'actions',
      render: (row: any) => {
        return [
          h(NButton, {
            onClick: () => handleActionButtonClick(row, 'action1'),
            style: 'margin-left: 0px; color: #1E90FF;', 
          }, { default: () => '编辑' }),

          h(NButton, {
            onClick: () => handleActionButtonClick(row, 'action2'),
            style: 'margin-left: 8px; color: #FF4500;',
          }, { default: () => '删除' }),

          h(NButton, {
            onClick: () => handleActionButtonClick(row, 'action3'),
            style: 'margin-left: 8px; color: #32CD32;', 
          }, { default: () => '附件' }),

        ];
      }
    }
  ]
}

const tableData = ref([]);

  const fetchData = async () => {
    try {
       // 发起一个请求
      const [err, result] = await to(getKnowledge());
      console.log("result===", result)
      if (err) {
       message.error(err.message)
      } else {
       tableData.value = result;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


const columns = ref(createColumns());

</script>
<template>
<br>
<div style="display: flex; justify-content: flex-start; margin:10px;">
    <n-button @click="activate('right')" type="primary">
       创建知识库
    </n-button>
</div>

<div class="flex h-full"> 
    <main class="flex-1 overflow-hidden h-full">
      <n-data-table :columns="columns" :data="tableData" />
    </main>
</div>

<n-drawer v-model:show="active" :width="502" :placement="placement">
      <n-drawer-content title="创建知识库">
          在这里创建你的知识库
          <n-divider />
          <n-space vertical>
            <n-form ref="formRef" >
              <n-form-item
                label="知识名称"  path="formValue.kname">
                <n-input  v-model:value="formValue.kname" placeholder="输入知识名称" />
              </n-form-item>
              <n-form-item label="知识描述" path="formValue.description">
                <n-input maxlength="1000"
                  type="textarea"
                  v-model:value="formValue.description"
                  placeholder="输入知识描述" 
                />
              </n-form-item>

              <n-col :span="24">
                <div style="display: flex; justify-content: flex-end">
                  <n-button @click="submitForm"  type="primary">
                    添加
                  </n-button>
                </div>
              </n-col>

            </n-form>
          </n-space>
      </n-drawer-content>
</n-drawer>

</template>


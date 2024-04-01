<script setup lang="ts">

import {  h, onMounted, ref , computed } from 'vue'
import { NButton,NDataTable,DrawerPlacement,NDrawer,NDrawerContent,
  NForm,NFormItem,NInput,NSpin,NSpace,UploadFileInfo,NUpload,NUploadDragger,
  NText,NIcon,NP,useMessage,NModal
} from 'naive-ui'
import { getToken } from '@/store/modules/auth/helper'
import { getKnowledgeDetail } from '@/api/knowledge'

import to from "await-to-js";
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => { 
  kid.value = router.currentRoute.value.query.kid as string

  fetchData() 
});

const kid = ref<string>('');

const token = getToken()

const message = useMessage()

const headers = {
  Authorization: `Bearer ${token}`
}

const spinShow = ref(false);






function handleFinish({event,file}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) {
  message.success('附件上传成功！')
  showModal.value = false
  // 关闭加载条
  spinShow.value = false
}

function handleActionButtonClick(row: any,action1:string): void {
  // 跳转到知识片段页面
  router.push({ path: '/fragment/t', query: { docId: row.docId } });
}

// 上传之前触发事件
function handleBeforeUpload(){
    // 开启加载条
    spinShow.value = true
}


const showModal = ref(false)
// 定义一个激活抽屉的函数，接受一个 DrawerPlacement 类型的参数
const activate = (place: DrawerPlacement) => {
    showModal.value = true
}


const createColumns = () => {
  return [
  ...(false
      ? [{
          title: '附件ID',
          key: 'id',
          width: 80,
          ellipsis: true,
        }]
      : []),
    {
      title: '文档编号',
      key: 'docId'
    },
    {
      title: '文档名称',
      key: 'docName'
    },
    {
      title: '文档类型',
      key: 'docType'
    },
    {
      title: '操作',
      key: 'actions',
      render: (row: any) => {
        return [
     
          h(NButton, {
            onClick: () => handleActionButtonClick(row, 'action2'),
            style: 'margin-left: 8px; color: #FF4500;',
          }, { default: () => '删除' }),

          h(NButton, {
            onClick: () => handleActionButtonClick(row, 'action4'),
            style: 'margin-left: 8px; color: #32CD32;', 
          }, { default: () => '知识片段' })
        ];
      }
    }
  ]
}

const tableData = ref([]);
  const fetchData = async () => {
    try {
       // 发起一个请求
      const [err, result] = await to(getKnowledgeDetail(kid.value));
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
       上传附件
    </n-button>
</div>

<div class="flex h-full"> 
    <main class="flex-1 overflow-hidden h-full">
      <n-data-table :columns="columns" :data="tableData" />
    </main>
</div>

<n-modal v-model:show="showModal" title="上传附件" :auto-focus="false" preset="card"
		style="width: 90%; max-width: 450px;">
  <n-space vertical>
    <n-form-item>
      <n-spin :show="spinShow">
         <!-- @before-upload="beforeUpload" -->
         <n-upload
          directory-dnd
          action="/api/knowledge/attach/upload"
          name="file"
          :data="{ kid: kid}"
          :on-before-upload="handleBeforeUpload"
          :headers="headers"
          @finish="handleFinish"
          :max="1">
              <n-upload-dragger>
                <div style="margin-bottom: 12px">
                  <n-icon size="48" :depth="3">
                    <archive-icon />
                  </n-icon>
                </div>
                <n-text style="font-size: 16px">
                  请上传一个5MB以内的文件
                </n-text>
                <n-p depth="3" style="margin: 8px 0 0 0">
                  已支持 md、pdf、docx、txt、csv 等文件格式
                </n-p>
              </n-upload-dragger>
        </n-upload>
      </n-spin> 
    </n-form-item> 
  </n-space>
  <br>

</n-modal>
		
</template>


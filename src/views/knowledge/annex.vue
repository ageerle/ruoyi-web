<script setup lang="ts">

import { h, onMounted, ref } from 'vue'
import { NButton, NDataTable, DrawerPlacement, NFormItem, NSpin, NSpace, UploadFileInfo, NUpload, NUploadDragger,
  NP, useMessage, NModal
} from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { getToken } from '@/store/modules/auth/helper'
import { getKnowledgeDetail, delKnowledgeDetail } from '@/api/knowledge'
import to from "await-to-js";
import { useRouter } from 'vue-router'
import { t } from '@/locales';


const router = useRouter()
const kid = ref<string>('');
onMounted(() => { 
  kid.value = router.currentRoute.value.query.kid as string
  fetchData() 
});

const token = getToken()

const message = useMessage()

const headers = {
  Authorization: `Bearer ${token}`
}

const spinShow = ref(false);

function handleFinish({event, file}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) {
  message.success(t('annex.fileUploadSuccess'))
  showModal.value = false
  // 关闭加载条
  spinShow.value = false
  // 重新获取数据，更新表格
  fetchData();
}

function handleActionButtonClick(row: any, action1: string): void {
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

// 删除附件 
async function delKnowledgeForm(docId: string) {
  // 发起一个请求
  const req ={
	  kid: kid.value, // 附件id
    docId: docId
  }

  const [err] = await to(delKnowledgeDetail(req));

  if (err) {
    message.error(t('annex.deletionFailed')) 
  } else {
    message.success(t('annex.attachmentDeletedSuccess'))
  }
  // 重新获取数据，更新表格
  await fetchData();
}

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
  }
});

const createColumns = () => {
  return [
  ...(false
      ? [{
          title: 'ID',
          key: 'id',
          width: 80,
          ellipsis: true,
        }]
      : []),
    {
      title: t('annex.docId'),
      key: 'docId'
    },
    {
      title: t('annex.docName'),
      key: 'docName'
    },
    {
      title: t('annex.docType'),
      key: 'docType'
    },
    {
      title: t('annex.action'),
      key: 'actions',
      render: (row: any) => {
        return [
     
          h(NButton, {
            onClick: () => delKnowledgeForm(row.docId),
            style: 'margin-left: 8px; color: #FF4500;',
          }, { default: () => t('annex.deleteAttachment') }),

          h(NButton, {
            onClick: () => handleActionButtonClick(row, 'action4'),
            style: 'margin-left: 8px; color: #32CD32;', 
          }, { default: () => t('annex.knowledgeFragment') })
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
    <main class="flex-1 overflow-hidden h-full annex-main">
      <div style="display: flex; justify-content: flex-start; margin:10px;border-top-left-radius: 20px;" class="know-header">
        <n-button @click="activate('right')" type="primary" :bordered="false" class="success-button">
          {{ $t('annex.uploadAttachment') }}
        </n-button>
      </div>

      <n-data-table 
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :bordered="false"
      />
    </main>
</div>

<n-modal class="annex-modal" v-model:show="showModal" :title="$t('annex.uploadAttachment')" :auto-focus="false" preset="card"
         style="width: 100%; max-width: 540px; background-color: #f8f9fa;">
  <n-space vertical>
    <n-form-item>
      <n-spin :show="spinShow">
        <n-upload
          class="annex-upload"
          directory-dnd
          action="/api/knowledge/attach/upload"
          name="file"
          :data="{ kid: kid}"
          :on-before-upload="handleBeforeUpload"
          :headers="headers"
          @finish="handleFinish"
          :max="1">
          <n-upload-dragger style="padding: 20px; border: 1px dashed #d9d9d9; border-radius: 8px; text-align: left;">
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 12px; height: 50px;">
              <SvgIcon icon="mage:upload" class="text-3xl"></SvgIcon>
            </div>
     
            <n-p style="font-size: 16px; color: #B3B7B9; text-align: center;">
               {{ $t('annex.pleaseUploadFile') }}
            </n-p>

            <n-p style="font-size: 16px; color: #B3B7B9; text-align: center;">
              {{ $t('annex.supportedFormats') }}
            </n-p>

            <n-p depth="3" style="margin: 8px 0 0 0; color: #fa541c;">
              {{ $t('annex.friendlyReminder') }}
            </n-p>
            <n-p depth="3" style="margin: 8px 0 0 0; color: #fa541c;">
              {{ $t('annex.largeFileWarning') }}
            </n-p>
            <n-p depth="3" style="margin: 8px 0 0 0; color: #fa541c;">
              {{ $t('annex.utf8Warning') }}
            </n-p>
            <n-p depth="3" style="margin: 8px 0 0 0; color: #fa541c;">
              {{ $t('annex.uploadCharacterLimit') }}
            </n-p>
          </n-upload-dragger>
        </n-upload>
      </n-spin>
    </n-form-item>
  </n-space>
  <br>
</n-modal>

</template>

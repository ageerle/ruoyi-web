<script setup lang="ts">

import { h, onMounted, ref, computed } from 'vue'
import {
    NButton, NDataTable, DrawerPlacement, NDrawer, NDrawerContent,
    NForm, NFormItem, NInput, NDivider, NSpace, UploadFileInfo, NUpload, NUploadDragger,
    NText, NIcon, NP, useMessage, NModal
} from 'naive-ui'
import { getToken } from '@/store/modules/auth/helper'
import { getfragmentList } from '@/api/knowledge'

import to from "await-to-js";
import { useRouter } from 'vue-router'

const router = useRouter()

const docId = ref<string>('');

onMounted(() => { 
    docId.value = router.currentRoute.value.query.docId as string
    fetchData() 
});





const token = getToken()

const message = useMessage()

const headers = {
    Authorization: `Bearer ${token}`
}


// 初始化表单数据对象
const formValue = ref({
    id: '',// 知识库id
    kid: '', // 附件id
    uid: '',//  用户id  
    kname: '', // 知识库名称
    description: '',// 知识库描述 
});

export interface KnowledgeReq {

}

function handleFinish({ event, file }: {
    file: UploadFileInfo
    event?: ProgressEvent
}) {
    const ext = (event?.target as XMLHttpRequest).response
    // ext 转成json对象
    const fileData = JSON.parse(ext);
    formValue.value.prompt = fileData.data.url
    console.log("ext===================" + fileData.data.url, file.file?.size)
    message.success('上传成功！')
}

async function submitSimpleGenerate() {

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
                title: '片段ID',
                key: 'id',
                width: 80,
                ellipsis: true,
            }]
            : []),
        {
            title: '片段编号',
            key: 'fid'
        },

        {
            title: '片段内容',
            key: 'content',
            width: 300,
            ellipsis: {
                tooltip: {
                    contentStyle: 'max-width:300px'
                }
            }
        },

        {
            title: '操作',
            key: 'actions',
            render: (row: any) => {
                return [
                    h(NButton, {
                        onClick: () => handleActionButtonClick(row, 'action2'),
                        style: 'margin-left: 8px; color: #FF4500;',
                    }, { default: () => '删除' })
                ];
            }
        }
    ]
}

const tableData = ref([]);
const fetchData = async () => {
    try {
        // 发起一个请求
        const [err, result] = await to(getfragmentList(docId.value));
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
            添加片段
        </n-button>
    </div>

    <div class="flex h-full">
        <main class="flex-1 overflow-hidden h-full">
            <n-data-table :columns="columns" :data="tableData" />
        </main>
    </div>

    <n-modal v-model:show="showModal" title="添加片段" :auto-focus="false" preset="card"
        style="width: 95%; max-width: 500px;">
        <n-space vertical>
            <n-form-item>

                <!-- @before-upload="beforeUpload" -->
                <n-upload directory-dnd action="/api/knowledge/attach/upload" name="file" :data="{ kid: kid }"
                    :headers="headers" @finish="handleFinish" :max="1">
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
            </n-form-item>
        </n-space>

        <br>
        <div style="display: flex; justify-content: flex-end">
            <n-button @click="submitSimpleGenerate" type="primary">
                添加到知识库
            </n-button>
        </div>
    </n-modal>

</template>

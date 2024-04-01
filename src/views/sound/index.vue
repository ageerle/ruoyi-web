<script setup lang="ts">

import {  h, onMounted, ref } from 'vue'
import { NButton,NDataTable,DrawerPlacement,NDrawer,NDrawerContent,
  NForm,NFormItem,NInput,NDivider,NSpace,UploadFileInfo,NUpload,NUploadDragger,
  NText,NIcon,NP,useMessage,NModal,NSlider,NProgress
} from 'naive-ui'
import { getToken } from '@/store/modules/auth/helper'
import { createRole,getRole,simpleGenerateReq } from '@/api/voice'
import { Icon } from '@iconify/vue';
import to from "await-to-js";

onMounted(() => { fetchData() });

const token = getToken()

const message = useMessage()

const audioUrl = ref()

// 是否显示进度条 
const isPercentage = ref(false)


// 定义进度值为响应式数据
const percentage = ref(0);

function increaseProgress() {
  // 打开进度条
  isPercentage.value = true
  const interval = setInterval(() => {
    // 只要进度小于99，就随机增加进度
    if (percentage.value < 99) {
      // 随机增加的进度值，这里假设每次增加1-5之间的随机值
      percentage.value += Math.floor(Math.random() * 5) + 1;
      // 防止进度超过99
      if (percentage.value > 99) {
        percentage.value = 99;
      }
    } else {
      // 达到或超过99，停止增加
      clearInterval(interval);
    }
  }, 1000); // 每1000毫秒（即1秒）更新一次进度
}

const headers = {
  Authorization: `Bearer ${token}`
}



// 初始化表单数据对象
const formValue = ref({
  name: '',
  description: '',
  prompt: '',
});

// 初始化表单数据对象
const simpleGenerate = ref({
  model: 'reecho-neural-voice-001',
  randomness: 97,
  stability_boost: 0,
  voiceId: '',
  text: ''
});

function handleFinish({event,file}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) {
  const ext = (event?.target as XMLHttpRequest).response
  // ext 转成json对象
  const fileData =  JSON.parse(ext);
  formValue.value.prompt = fileData.data.url
  console.log("ext==================="+fileData.data.url,file.file?.size)
  message.success('上传成功！')
}

 async function submitForm() {
  //关闭弹框
  active.value = false
  // 发起一个请求
  const [err, result] = await to(createRole(formValue.value));
	  console.log("result===", result)
    if (err) {
      message.error(err.message)
    } else {
      message.success('角色创建成功!')
    }
    // 处理响应
    console.log('角色创建成功',formValue.value);
}

async function submitSimpleGenerate() {
  try {
    //打开进度条
  increaseProgress();
   //发起一个请求
  const [err, result] = await to(simpleGenerateReq(simpleGenerate.value));
  console.log("语音生成成功result===", result)
  if (err) {
    // 关闭进度条
    isPercentage.value = false
		message.error(err.message)
    return
	}else{
    message.success("语音生成成功,消耗点数："+result?.data.credit_used)
  }

  audioUrl.value  = result?.data.audio
  if(audioUrl.value){
      // 关闭进度条
      isPercentage.value = false
  }
  } catch (error) {
    // 处理错误
    console.error('语音生成失败', error);
  }
}

function handleActionButtonClick(row: any): void {
  simpleGenerate.value.voiceId = row.voiceId
  showModal.value = true
}

// 使用 ref 来创建响应式变量
const active = ref(false)

const placement = ref<DrawerPlacement>('right')

const showModal = ref(false)
// 定义一个激活抽屉的函数，接受一个 DrawerPlacement 类型的参数
const activate = (place: DrawerPlacement) => {
  active.value = true
  placement.value = place
}


const createColumns = () => {
  return [
  ...(false
      ? [{
          title: '角色ID',
          key: 'voiceId',
          width: 80,
          ellipsis: true,
        }]
      : []),
    {
      title: '角色名称',
      key: 'name'
    },
    {
      title: '角色描述',
      key: 'description'
    },
  
    {
      title: '预览',
      key: 'fileUrl',
      render: (row: { fileUrl: string | undefined; }) => {
        return h(NButton, {
          icon: () =>
            h(NIcon, null, {
              default: () => h(Icon, { icon: 'ic:baseline-play-arrow' }),
            }),
          onClick: () => {
            const audio = new Audio(row.fileUrl);
            audio.play();
          },
        }, '播放');
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (row: any) => {
        return h(NButton, {
          onClick: () => handleActionButtonClick(row)
        }, { default: () => '生成语音' })
      }
    }
  ]
}

  const fetchData = async () => {
    try {
       // 发起一个请求
      const [err, result] = await to(getRole());
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

const tableData = ref([]);
const columns = ref(createColumns());

</script>
<template>
<br>
<div style="display: flex; justify-content: flex-start; margin:10px;">
    <n-button @click="activate('right')" type="primary">
       创建角色
    </n-button>
</div>

<div class="flex h-full"> 
    <main class="flex-1 overflow-hidden h-full">
      <n-data-table :columns="columns" :data="tableData" />
    </main>
</div>

<n-drawer v-model:show="active" :width="502" :placement="placement">
      <n-drawer-content title="添加角色">
          在这里添加你的角色
          <n-divider />
          <n-space vertical>
            <n-form ref="formRef" >
              <n-form-item
                label="角色名称"  path="formValue.name">
                <n-input  v-model:value="formValue.name" placeholder="输入角色名称" />
              </n-form-item>
              <n-form-item label="角色描述" path="formValue.description">
                <n-input v-model:value="formValue.description"  placeholder="输入角色描述" />
              </n-form-item>
              <n-form-item label="音频样本">
                <!-- @before-upload="beforeUpload" -->
                <n-upload
                  directory-dnd
                  action="/api/resource/oss/upload"
                  name="file"
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
                          请上传一个5MB以内的音频文件
                        </n-text>
                        <n-p depth="3" style="margin: 8px 0 0 0">
                          *样本语音需大于2秒,样本质量比长度更重要,过长的样本反而可能导致效果不如预期,通常将样本长度控制在5-8秒的最具代表性片段即可。
                        </n-p>
                      </n-upload-dragger>
                </n-upload>
              </n-form-item>
              <n-col :span="24"
              >
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

<n-modal v-model:show="showModal" title="生成语音" :auto-focus="false" preset="card"
		style="width: 95%; max-width: 500px;">
  <n-input maxlength="1000"
    type="textarea"
    v-model:value="simpleGenerate.text"
    placeholder="建议填写不超过50个字符的单句以保证最佳效果(消耗1元/1000字符)" 
  />
  <n-space vertical>
    <br>
    <section class=" flex justify-between items-center"  >
      <div> 多样性 (0-100,默认为97)
      </div>
      <div class=" flex justify-end items-center w-[80%] max-w-[240px]">
          <div class=" w-[200px]"><n-slider v-model:value="simpleGenerate.randomness" :step="1" :max="100" /></div>
          <div  class="w-[40px] text-right">{{ simpleGenerate.randomness }}</div>
      </div>
    </section>  
    <div class="mb-4 text-[12px] text-gray-300 dark:text-gray-300/20">控制语音生成的多样性，值越大，生成的语音将具备更高的表现力上限与随机性范围；应为0到100的整数,建议不小于95</div>

    <section class=" flex justify-between items-center"  >
      <div> 稳定性过滤 (0-100,默认为0)
      </div>
      <div class=" flex justify-end items-center w-[80%] max-w-[240px]">
          <div class=" w-[200px]"><n-slider v-model:value="simpleGenerate.stability_boost" :step="1" :max="100" /></div>
          <div  class="w-[40px] text-right">{{ simpleGenerate.stability_boost }}</div>
      </div>
    </section>  
    <div class="mb-4 text-[12px] text-gray-300 dark:text-gray-300/20">限制在生成过程中仅选择前n个最佳的路径，值越小，生成的语音通常越平淡与稳定，但同时也可能导致表达某些内容或音色时的效果下降或异常；应为1到100的整数，为0时关闭限制，启用时建议不小于40</div>

    
    <!-- 进度条 -->
    <n-progress v-if="isPercentage" :percentage="percentage"></n-progress>

    <audio v-if="audioUrl" :src="audioUrl" controls></audio>
    
  </n-space>



  <br>
  <div style="display: flex; justify-content: flex-end">
                  <n-button @click="submitSimpleGenerate"  type="primary">
                    开始生成
                  </n-button>
  </div>



</n-modal>
		

</template>


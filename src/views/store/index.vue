<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  NButton, NCard, NAvatar, NPagination, NDrawer, NDrawerContent,
  NForm, NFormItem, NInput, NDivider, NSpace, NUpload,
  NProgress, NModal, NSlider, useMessage,NUploadDragger,UploadFileInfo
} from 'naive-ui';
import { useRouter } from 'vue-router';
import { getToken } from '@/store/modules/auth/helper';
import { createRole, getRole, simpleGenerateReq, delRole } from '@/api/store';

import to from "await-to-js";
import { t } from '@/locales';

const router = useRouter();
const message = useMessage();
const token = getToken();
const headers = { Authorization: `Bearer ${token}` };
const active = ref(false);
const showModal = ref(false);
const audioUrl = ref('');
const isPercentage = ref(false);
const percentage = ref(0);
const formValue = ref({ name: '', description: '', avatar: '' ,prompt: ''});
const simpleGenerate = ref({ model: 'reecho-neural-voice-001', randomness: 97, stability_boost: 100, voiceId: '', text: '' });
const tableData = ref([]);
const currentPage = ref(1);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * 9;
  return tableData.value.slice(start, start + 9);
});

onMounted(fetchData);

function increaseProgress() {
  isPercentage.value = true;
  const interval = setInterval(() => {
    if (percentage.value < 99) {
      percentage.value += Math.floor(Math.random() * 5) + 1;
      if (percentage.value > 99) percentage.value = 99;
    } else {
      clearInterval(interval);
    }
  }, 1000);
}

async function fetchData() {
  const [err, result] = await to(getRole());
  if (!err) tableData.value = result;
}

/**
 * 头像上传
 */
async function handleUploadFinish({ event }: { event?: ProgressEvent }) {
  const response = JSON.parse(event?.target?.response);
  formValue.value.avatar = response.data.url;
  message.success(t('voice.uploudSuccessful'));
}

/**
 * 文件上传
 */
 function handleFinish({event,file}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) {
  const ext = (event?.target as XMLHttpRequest).response
  // ext 转成json对象
  const fileData =  JSON.parse(ext);
  formValue.value.prompt = fileData.data.url
  message.success(t('voice.uploudSuccessful'));
}




async function submitForm() {
  const [err] = await to(createRole(formValue.value));
  if (!err) {
    message.success(t('voice.operationSuccessful'));
    fetchData();
  }
}

async function submitSimpleGenerate() {
  increaseProgress();
  const [err, result] = await to(simpleGenerateReq(simpleGenerate.value));
  if (!err) {
    audioUrl.value = result?.data.audio;
    message.success(t('voice.operationSuccessful'));
    isPercentage.value = false;
  }else{
    message.error(err.message);
  }
}

function handleActionButtonClick(row: any) {
  simpleGenerate.value.voiceId = row.voiceId;
  showModal.value = true;
}

async function handleDelButtonClick(row: any) {
  const [err] = await to(delRole(row.id));
  if (!err) message.success(t('voice.operationSuccessful'));
  // 刷新页面
  fetchData();
}

function handlePageChange(page: number) {
  currentPage.value = page;
}

function playAudio(url: string) {
  new Audio(url).play();
}
</script>

<template>
  <div style="display: flex; justify-content: flex-start; margin:10px;" class="sound-button-box top-header">
    <n-button :bordered="false" @click="active = true" type="primary" style="margin-right: 10px;">{{ $t('voice.createRole') }}</n-button>
    <n-button :bordered="false" @click="router.push('/roleList/t')" type="warning">{{ $t('voice.soundMarket') }}</n-button>
  </div>
 
  <div class="flex h-full flex-col role-card table-box">
    <main class="flex-1 overflow-hidden">
      <div class="card-container">
        <n-card v-for="item in paginatedData" :key="item.key" class="card-item" bordered hoverable>
          <div class="flex justify-between">
            <div class="card-description">
              <h3>{{ item.name }}</h3>
              <p class="ellipsis" :title="item.description">{{ item.description || '——'}}</p>
            </div>
            <n-avatar size="large" :src="item.avatar" class="card-avatar" />
          </div>
          <n-divider />
          <div class="flex mt-4 button-list">
            <n-button :bordered="false" secondary round type="info" @click="playAudio(item.fileUrl)"> {{ $t('voice.play') }}</n-button>
            <n-button :bordered="false" secondary round type="primary" @click="handleActionButtonClick(item)"> {{ $t('voice.generate') }}</n-button>
            <n-button :bordered="false" secondary round type="error" @click="handleDelButtonClick(item)">{{ $t('voice.delete') }}</n-button>
          </div>
        </n-card>
        <n-pagination v-model:page="currentPage" :page-size="9" :item-count="tableData.length"
          @update:page="handlePageChange" class="pagination voice-pagination" />
      </div>
    </main>
  </div>

  <n-drawer v-model:show="active" class="add-role-draw" :width="540" placement="right">
    <n-drawer-content :title="$t('voice.addRole')">
      <n-space vertical>
        <n-form>
          <n-form-item :label="$t('voice.roleName')">
            <n-input v-model:value="formValue.name" :placeholder="$t('voice.roleNameDescribe')" />
          </n-form-item>
          <n-form-item :label="$t('voice.roleDescribe')">
            <n-input v-model:value="formValue.description" :placeholder="$t('voice.roleExplain')" />
          </n-form-item>
          <n-form-item :label="$t('voice.avatar')">
            <n-upload action="/api/resource/oss/upload" :max="1" list-type="image-card" :headers="headers" class="role-avatar-upload"
              @finish="handleUploadFinish">
              <div style="margin: 30px 0 10px;">
              <IconSvg icon="add" width="30px" height="30px"></IconSvg>
              </div>
              <p style="font-size: 14px">{{ $t('voice.upload') }}</p>
              </n-upload>
          </n-form-item>

          <n-form-item :label="$t('voice.audioSamples')">
                <!-- @before-upload="beforeUpload" -->
                <n-upload
                  directory-dnd
                  action="/api/resource/oss/upload"
                  name="file"
                  :headers="headers"
                  @finish="handleFinish"
                  class="add-role-upload"
                  :max="1">
                      <n-upload-dragger>
                        <div style="margin-bottom: 12px">
                          <n-icon size="48" :depth="3">
                            <archive-icon />
                          </n-icon>
                        </div>
                        <n-text style="font-size: 16px">
                          {{ $t('voice.prompt1') }}
                        </n-text>
                        <br>
                        <n-p depth="3" style="margin: 8px 0 0 0">
                          {{ $t('voice.prompt2') }}
                        </n-p>
                      </n-upload-dragger>
                </n-upload>
              </n-form-item>
          <n-button :bordered="false" class="add-role-button" @click="submitForm" type="primary">{{ $t('voice.add') }}</n-button>
        </n-form>
      </n-space>
    </n-drawer-content>
  </n-drawer>

  <n-modal class="voice-drawer" v-model:show="showModal" :title="$t('voice.generate')" :auto-focus="false" preset="card"
    style="width: 95%; max-width: 540px;">
    <n-input maxlength="1000" type="textarea" v-model:value="simpleGenerate.text"
      :placeholder="$t('voice.proposal')" />
    <n-space vertical>
      <br>
      <section class=" flex justify-between items-center">
        <div> {{ $t('voice.diversity') }}
        </div>
        <div class=" flex justify-end items-center w-[80%] max-w-[240px]">
          <div class=" w-[200px]"><n-slider v-model:value="simpleGenerate.randomness" :step="1" :max="100" /></div>
          <div class="w-[40px] text-right">{{ simpleGenerate.randomness }}</div>
        </div>
      </section>
      <div class="mb-4 text-[12px] text-gray-300 dark:text-gray-300/20">
       {{ $t('voice.generateInfo') }}</div>

      <section class=" flex justify-between items-center">
        <div> {{ $t('voice.stability') }}
        </div>
        <div class=" flex justify-end items-center w-[80%] max-w-[240px]">
          <div class=" w-[200px]"><n-slider v-model:value="simpleGenerate.stability_boost" :step="1" :max="100" /></div>
          <div class="w-[40px] text-right">{{ simpleGenerate.stability_boost }}</div>
        </div>
      </section>
      <div class="mb-4 text-[12px] text-gray-300 dark:text-gray-300/20 stabilityInfo">
        </div>
        {{ $t('voice.stabilityInfo') }}

      <!-- 进度条 -->
      <n-progress v-if="isPercentage" :percentage="percentage"></n-progress>

      <audio v-if="audioUrl" :src="audioUrl" controls></audio>

    </n-space>



    <br>
    <div style="display: flex; justify-content: flex-end">
      <n-button :bordered="false" @click="submitSimpleGenerate" type="primary" class="addvoicebutton">
        {{ $t('voice.start') }}
      </n-button>
    </div>



  </n-modal>
</template>



<style scoped>
.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.card-item {
  width: calc(30%);
  margin: 10px;
  border-radius: 10px;
  height: 23vh;
}

.pagination {
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 200px;
}
</style>

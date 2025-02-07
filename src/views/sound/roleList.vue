<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NButton, NCard, NAvatar, NPagination, useMessage,NDivider } from 'naive-ui';
import { getRoleList, Character, copyRoleList } from '@/api/voice';
import to from 'await-to-js';
import { t } from '@/locales';

const allData = ref<Character[]>([]);
const currentPage = ref(1);
const pageSize = ref(9);
const message = useMessage();

onMounted(async () => {
  const [err, result] = await to(getRoleList());
  if (err) {
    message.error(err.message);
  } else {
    allData.value = result.data;
  }
});

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return allData.value.slice(start, start + pageSize.value);
});

const totalItems = computed(() => {
  return allData.value ? allData.value.length : 0;
});

function playAudio(url: string) {
  const audio = new Audio(url);
  audio.play();
}

async function handleActionButtonClick(item: Character) {
  const [err] = await to(copyRoleList(item));
  if (err) {
    message.error(err.message);
  } else {
    message.success(t('voice.collectionSuccessful'));
  }
}

const goBack = () => {
  window.history.back();
};
</script>



<template>

  <div style="display: flex; justify-content: flex-start; margin:10px;" class="top-header">
    <n-button @click="goBack" type="primary" :bordered="false" class="success-button"> {{ $t('voice.return') }}</n-button>
  </div>

  <div class="flex h-full flex-col role-card">
    <main class="flex-1 overflow-hidden">
      <div class="card-container">
        <n-card v-for="item in tableData" :key="item.id" class="card-item" bordered hoverable>
          <div class="flex justify-between">
            <div>
              <h3>{{ item.name }}</h3>
              <p class="ellipsis" :title="item.description">{{ item.description || '——' }}</p>
            </div>
            <n-avatar size="large" :src="item.avatar" />
          </div>
          <n-divider />
          <div class="flex justify-between mt-4 button-list">
            <n-button secondary round type="info" @click="playAudio(item.previewAudio)">
            {{ $t('voice.playSound') }}
            </n-button>
            <n-button secondary round type="primary" @click="handleActionButtonClick(item)">
            {{ $t('voice.collection') }}
            </n-button>
          </div>
        </n-card>
      </div>
      <n-pagination :page="currentPage" :page-size="pageSize" :item-count="totalItems"
        @update:page="currentPage = $event" class="pagination  voice-pagination" />
    </main>
  </div>
  </template>
  
  
  

  <style scoped>
  .card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
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
    width: 200px; /* Adjust width as needed */
  }
  </style>
  

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NButton, NCard, NAvatar, NPagination, useMessage,NDivider,NTabs, NTabPane,NIcon} from 'naive-ui';
import { getAppList, Character, copyRoleList } from '@/api/store';
import to from 'await-to-js';
import { t } from '@/locales';
import { useRouter } from 'vue-router'
import { useAppStore, useChatStore, homeStore } from '@/store'
const allData = ref<Character[]>([]);
const currentPage = ref(1);
const pageSize = ref(9);
const message = useMessage();
const router = useRouter()

onMounted(async () => {
  const [err, result] = await to(getAppList());
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


const appStore = useAppStore()
const chatStore = useChatStore()

function playApp(url: string) {
  appStore.setIsChat(false)
  // 跳转到应用
  router.push(url)
}

async function handleActionButtonClick(item: Character) {
  const [err] = await to(copyRoleList(item));
  if (err) {
    message.error(err.message);
  } else {
    message.success(t('voice.collectionSuccessful'));
  }
}

</script>

<template>
  <div class="flex h-full flex-col role-card">
    <n-tabs type="line" class="tab-bar">
      <n-tab-pane name="officialRecommend" tab="官网推荐" />
      <n-tab-pane name="writingAssist" tab="辅助写作" />
      <n-tab-pane name="socialEntertainment" tab="社交娱乐" />
      <n-tab-pane name="myFollow" tab="我的关注" />
    </n-tabs>

    <main class="flex-1 overflow-hidden " style="margin-left: 20px;">
      <div class="card-container">
        <n-card v-for="item in tableData" :key="item.id" class="card-item" bordered hoverable>
          <div class="flex justify-between">
            <div>
              <h3>{{ item.name }}</h3>
              <p class="ellipsis" :title="item.description">{{ item.description || '——' }}</p>
            </div>
            <!-- <n-avatar :size="48" :src="item.avatar" /> -->
           
            <n-icon size="48">
              <img :src="item.avatar" alt="Icon" />
            </n-icon>
          </div>
          <n-divider />
          <div class="flex justify-between mt-4 button-list">
            <n-button  secondary round type="info" @click="playApp(item.appUrl)">
              立即体验
            </n-button>
            <n-button  secondary round  type="primary">
              关注
              <!-- {{ $t('voice.collection') }} -->
            </n-button>
          </div>
        </n-card>
      </div>
      <n-pagination :page="currentPage" :page-size="pageSize" :item-count="totalItems"
        @update:page="currentPage = $event" class="pagination voice-pagination" />
    </main>
  </div>
</template>
  
<style scoped>
.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* 修改为左边对齐 */
}

.card-item {
  width: calc(26%);
  margin: 12px;
  border-radius: 10px;
  height: 28vh;
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

.tab-bar {
  margin: 20px 0 20px 20px; /* 上下边距20px，左边边距20px */
  padding: 10px; /* 添加内边距 */
  border-radius: 8px; /* 添加圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  transition: all 0.3s ease; /* 添加动效过渡 */
}


</style>
  

<!-- 公共聊天输入框组件 -->
<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import { nextTick, ref, watch } from 'vue';
import { Sender } from 'vue-element-plus-x';
import AgentSelect from '@/components/AgentSelect/index.vue';
import FilesSelect from '@/components/FilesSelect/index.vue';
import ModelSelect from '@/components/ModelSelect/index.vue';
import { useAgentStore } from '@/stores/modules/agent';
import { useChatStore } from '@/stores/modules/chat';
import { useFilesStore } from '@/stores/modules/files';
import { useUserStore } from '@/stores/modules/user';

const props = defineProps<{
  modelValue?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'submit': [content: string];
  'cancel': [];
}>();

const filesStore = useFilesStore();
const userStore = useUserStore();
const agentStore = useAgentStore();
const chatStore = useChatStore();
const isLoggedIn = computed(() => !!userStore.token);
const isApplicationMode = computed(
  () => !!chatStore.currentWorkflow || !!agentStore.currentAgentInfo?.id,
);

const senderValue = computed({
  get: () => props.modelValue || '',
  set: val => emit('update:modelValue', val),
});

const senderRef = ref<InstanceType<typeof Sender> | null>(null);

function handleSubmit() {
  if (!isLoggedIn.value) {
    userStore.ensureLogin('/chat', '登录后即可开始对话');
    return;
  }

  emit('submit', senderValue.value);
}

function handleCancel() {
  emit('cancel');
}

function handleDeleteCard(_item: FilesCardProps, index: number) {
  filesStore.deleteFileByIndex(index);
}

// 暴露方法供父组件调用
function openHeader() {
  nextTick(() => {
    senderRef.value?.openHeader();
  });
}

function closeHeader() {
  nextTick(() => {
    senderRef.value?.closeHeader();
  });
}

watch(
  () => filesStore.filesList.length,
  (val) => {
    if (val > 0) {
      openHeader();
    }
    else {
      closeHeader();
    }
  },
);

defineExpose({
  openHeader,
  closeHeader,
});
</script>

<template>
  <Sender
    ref="senderRef"
    v-model="senderValue"
    class="chat-sender"
    :auto-size="{
      maxRows: 6,
      minRows: 3,
    }"
    variant="updown"
    clearable
    allow-speech
    :loading="loading"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <template #header>
      <div class="sender-header p-12px pt-6px pb-0px">
        <Attachments
          :items="filesStore.filesList"
          :hide-upload="true"
          @delete-card="handleDeleteCard"
        >
          <template #prev-button="{ show, onScrollLeft }">
            <div
              v-if="show"
              class="prev-next-btn left-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
              @click="onScrollLeft"
            >
              <el-icon>
                <ArrowLeftBold />
              </el-icon>
            </div>
          </template>
          <template #next-button="{ show, onScrollRight }">
            <div
              v-if="show"
              class="prev-next-btn right-8px flex-center w-22px h-22px rounded-8px border-1px border-solid border-[rgba(0,0,0,0.08)] c-[rgba(0,0,0,.4)] hover:bg-#f3f4f6 bg-#fff font-size-10px"
              @click="onScrollRight"
            >
              <el-icon>
                <ArrowRightBold />
              </el-icon>
            </div>
          </template>
        </Attachments>
      </div>
    </template>
    <template #prefix>
      <div class="sender-prefix-container">
        <!-- 左侧按钮组 -->
        <div class="left-buttons">
          <AgentSelect v-if="isApplicationMode" />
          <ModelSelect v-else />
        </div>

        <!-- 右侧上传按钮 -->
        <FilesSelect class="ml-auto" />
      </div>
    </template>
  </Sender>
</template>

<style scoped lang="scss">
.chat-sender {
  width: 100%;
}

// 关键：让 prefix 区域扩展占满整行
:deep(.el-sender-prefix) {
  flex: 1;
  width: 100%;
}

// prefix 容器
.sender-prefix-container {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

// 左侧按钮组
.left-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

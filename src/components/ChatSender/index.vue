<!-- 公共聊天输入框组件 -->
<script setup lang="ts">
import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import { Sender } from 'vue-element-plus-x';
import { useRoute } from 'vue-router';
import AgentSelect from '@/components/AgentSelect/index.vue';
import FilesSelect from '@/components/FilesSelect/index.vue';
import ModelSelect from '@/components/ModelSelect/index.vue';
import { useAgentStore } from '@/stores/modules/agent';
import { useChatStore } from '@/stores/modules/chat';
import { useFilesStore } from '@/stores/modules/files';
import { useUserStore } from '@/stores/modules/user';
import { isOcrImage, readTransferredFiles } from '@/utils/ocrImage';

const props = defineProps<{
  modelValue?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'submit': [content: string, image?: File];
  'cancel': [];
}>();

const filesStore = useFilesStore();
const userStore = useUserStore();
const agentStore = useAgentStore();
const chatStore = useChatStore();
const route = useRoute();
const isLoggedIn = computed(() => !!userStore.token);
const isApplicationMode = computed(
  () => !!chatStore.currentWorkflow || !!agentStore.currentAgentInfo?.id,
);

const senderValue = computed({
  get: () => props.modelValue || '',
  set: val => emit('update:modelValue', val),
});

const senderRef = ref<InstanceType<typeof Sender> | null>(null);
const draggingImage = shallowRef(false);
const attachmentMessage = shallowRef('');
const selectedImage = computed(() => isApplicationMode.value ? undefined : filesStore.filesList[0]);
const submitDisabled = computed(() => !senderValue.value.trim() && !selectedImage.value);

function attachImage(files: File[]) {
  if (props.loading)
    return;
  if (isApplicationMode.value) {
    attachmentMessage.value = '当前应用仅接收文字。';
    return;
  }
  const [image] = files;
  if (files.length !== 1 || !image || !isOcrImage(image)) {
    attachmentMessage.value = '每次可发送一张 10 MB 以内的 JPG 或 PNG 图片。';
    return;
  }
  attachmentMessage.value = '';
  filesStore.setImage(image);
}

function onPaste(event: ClipboardEvent) {
  const files = readTransferredFiles(event.clipboardData);
  if (!files.length)
    return;
  event.preventDefault();
  attachImage(files);
}

function onDragOver(event: DragEvent) {
  const transfer = event.dataTransfer;
  if (!transfer?.types.includes('Files'))
    return;
  event.preventDefault();
  draggingImage.value = !isApplicationMode.value && !props.loading;
  transfer.dropEffect = draggingImage.value ? 'copy' : 'none';
}

function onDragLeave(event: DragEvent) {
  if (!(event.currentTarget instanceof HTMLElement && event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)))
    draggingImage.value = false;
}

function onDrop(event: DragEvent) {
  draggingImage.value = false;
  const files = readTransferredFiles(event.dataTransfer);
  if (!files.length && !event.dataTransfer?.types.includes('Files'))
    return;
  event.preventDefault();
  attachImage(files);
}

function handleSubmit() {
  if (props.loading || submitDisabled.value)
    return;
  if (!isLoggedIn.value) {
    userStore.ensureLogin('/chat', '登录后即可开始对话');
    return;
  }

  const image = selectedImage.value?.file;
  attachmentMessage.value = '';
  emit('submit', senderValue.value, image);
  if (image)
    filesStore.clearFiles();
}

function handleDeleteCard(_item: FilesCardProps, index: number) {
  filesStore.deleteFileByIndex(index);
  attachmentMessage.value = '';
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
  selectedImage,
  (image) => {
    if (image) {
      openHeader();
    }
    else {
      closeHeader();
    }
  },
  { immediate: true },
);

watch(isApplicationMode, () => {
  attachmentMessage.value = '';
}, { flush: 'sync' });

function resetImageInput() {
  filesStore.clearFiles();
  attachmentMessage.value = '';
}

watch(() => route.params.id, resetImageInput, { flush: 'sync' });
watch(isLoggedIn, (loggedIn) => {
  if (!loggedIn)
    resetImageInput();
}, { flush: 'sync' });
onBeforeUnmount(resetImageInput);

defineExpose({
  openHeader,
  closeHeader,
});
</script>

<template>
  <div
    class="chat-image-input"
    :class="{ 'chat-image-input-dragging': draggingImage }"
    @paste.capture="onPaste"
    @dragover.capture="onDragOver"
    @dragleave.capture="onDragLeave"
    @drop.capture="onDrop"
  >
    <Sender
      ref="senderRef"
      v-model="senderValue"
      class="chat-sender"
      :placeholder="isApplicationMode ? '请输入内容' : '输入消息，也可粘贴或拖入图片'"
      :auto-size="{
        maxRows: 6,
        minRows: 3,
      }"
      variant="updown"
      clearable
      allow-speech
      :loading="loading"
      :submit-btn-disabled="submitDisabled"
      @submit="handleSubmit"
      @cancel="emit('cancel')"
    >
      <template #header>
        <div class="sender-header p-12px pt-6px pb-0px">
          <Attachments
            :items="selectedImage ? filesStore.filesList : []"
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
          <div class="image-attachment-input">
            <small v-if="attachmentMessage" class="image-attachment-message" role="status">
              {{ attachmentMessage }}
            </small>
            <FilesSelect v-if="!isApplicationMode" :disabled="loading" @select="attachImage" />
          </div>
        </div>
      </template>
    </Sender>
  </div>
</template>

<style scoped lang="scss">
.chat-image-input {
  width: 100%;
  border-radius: 12px;
}

.chat-image-input-dragging {
  outline: 2px dashed var(--el-color-primary);
}

.image-attachment-input {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.image-attachment-message {
  max-width: min(220px, 40vw);
  color: var(--el-text-color-secondary);
}

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

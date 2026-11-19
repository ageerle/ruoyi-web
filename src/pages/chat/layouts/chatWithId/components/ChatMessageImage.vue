<script setup lang="ts">
import { useUserStore } from '@/stores';
import { isOcrImage } from '@/utils/ocrImage';

const props = defineProps<{
  file?: File;
  messageId?: string | number;
  hasImage?: boolean;
}>();

const userStore = useUserStore();
const source = shallowRef('');
const failed = shallowRef(false);
const retryCount = shallowRef(0);

function handleImageError(event: Event) {
  if ((event.currentTarget as HTMLImageElement).getAttribute('src') === source.value)
    failed.value = true;
}

watch(
  [
    () => props.file,
    () => props.messageId,
    () => props.hasImage,
    () => (props.file ? undefined : userStore.token),
    retryCount,
  ],
  async ([file, messageId, hasImage, token], _, onCleanup) => {
    source.value = '';
    failed.value = false;

    let objectUrl: string | undefined;
    const controller = new AbortController();
    onCleanup(() => {
      controller.abort();
      if (objectUrl)
        URL.revokeObjectURL(objectUrl);
    });

    try {
      if (file) {
        if (!isOcrImage(file)) {
          failed.value = true;
          return;
        }
        objectUrl = URL.createObjectURL(file);
        source.value = objectUrl;
        return;
      }

      if (!hasImage || messageId == null || !token)
        return;

      const base = import.meta.env.VITE_API_URL.replace(/\/$/, '');
      const response = await fetch(`${base}/chat/messages/${encodeURIComponent(messageId)}/image`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ClientID: import.meta.env.VITE_CLIENT_ID,
        },
        redirect: 'error',
        signal: controller.signal,
      });
      const type = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
      if (!response.ok || !type || !['image/jpeg', 'image/jpg', 'image/png'].includes(type))
        throw new Error('Invalid chat image response');
      const image = await response.blob();
      if (!image.size)
        throw new Error('Empty chat image response');
      if (!controller.signal.aborted) {
        objectUrl = URL.createObjectURL(image);
        source.value = objectUrl;
      }
    }
    catch {
      if (!controller.signal.aborted)
        failed.value = true;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="failed" class="chat-message-image-error">
    <span role="status">图片加载失败</span>
    <button v-if="!file" type="button" @click="retryCount += 1">
      重试
    </button>
  </div>
  <img
    v-else-if="source"
    class="chat-message-image"
    :src="source"
    alt="发送的图片"
    @error="handleImageError"
  >
</template>

<style scoped>
.chat-message-image {
  display: block;
  max-width: 100%;
  max-height: min(360px, 50vh);
  margin-block: 4px;
  border-radius: 8px;
  object-fit: contain;
}

.chat-message-image-error {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.chat-message-image-error button {
  padding: 2px 4px;
  border: 0;
  background: transparent;
  color: var(--el-color-primary);
  cursor: pointer;
}
</style>

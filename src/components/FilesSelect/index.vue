<script setup lang="ts">
import { Paperclip } from '@element-plus/icons-vue';
import { useFileDialog } from '@vueuse/core';
import { OCR_IMAGE_ACCEPT } from '@/utils/ocrImage';

defineProps<{ disabled?: boolean }>();
const emit = defineEmits<{ select: [files: File[]] }>();

const { open, onChange } = useFileDialog({ accept: OCR_IMAGE_ACCEPT, multiple: false, reset: true });

onChange((files) => {
  if (files?.length)
    emit('select', Array.from(files));
});
</script>

<template>
  <button
    type="button"
    class="files-select-btn"
    aria-label="添加图片"
    title="选择图片，也可粘贴或拖入聊天框"
    :disabled="disabled"
    @click="open()"
  >
    <el-icon class="files-icon">
      <Paperclip />
    </el-icon>
  </button>
</template>

<style scoped lang="scss">
.files-select-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  user-select: none;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 50%;

  &:hover:not(:disabled) {
    background-color: var(--el-fill-color-light);
    border-color: var(--el-border-color);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .files-icon {
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
}
</style>

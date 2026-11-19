import type { FilesCardProps } from 'vue-element-plus-x/types/FilesCard';
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useFilesStore = defineStore('files', () => {
  const filesList = shallowRef<(FilesCardProps & { file: File; url: string })[]>([]);

  const clearFiles = () => {
    filesList.value.forEach(item => URL.revokeObjectURL(item.url));
    filesList.value = [];
  };

  const setImage = (file: File) => {
    const url = URL.createObjectURL(file);
    clearFiles();
    filesList.value = [{
      uid: crypto.randomUUID(),
      name: file.name || '图片',
      fileSize: file.size,
      file,
      maxWidth: '200px',
      showDelIcon: true,
      imgPreview: true,
      imgVariant: 'square',
      url,
    }];
  };

  const deleteFileByIndex = (index: number) => {
    if (index === 0)
      clearFiles();
  };

  return {
    filesList,
    setImage,
    clearFiles,
    deleteFileByIndex,
  };
});

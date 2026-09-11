import type { MediaTask } from './types';
import { computed, readonly, shallowRef, watch } from 'vue';
import { getMediaContent } from '@/api/media/content';
import { mediaSource } from './utils';

/** Owns the authenticated request and releases its object URL on task change or unmount. */
export function useMediaPreview(task: () => MediaTask | undefined) {
  const objectUrl = shallowRef('');
  const contentType = shallowRef('');
  const loading = shallowRef(false);
  const error = shallowRef('');
  const attempt = shallowRef(0);
  const directSource = computed(() => {
    const current = task();
    return current?.state === 'success' ? mediaSource(current.result, current.kind) : '';
  });
  const needsContent = computed(() => Boolean(directSource.value && task()?.provider === 'atlas' && task()?.result?.id));
  const source = computed(() => needsContent.value ? objectUrl.value : directSource.value);
  const mimeType = computed(() => contentType.value || task()?.result?.mimeType || '');

  watch([() => task()?.key, directSource, needsContent, attempt], async (_, __, onCleanup) => {
    objectUrl.value = '';
    contentType.value = '';
    error.value = '';
    loading.value = false;
    const current = task();
    if (!needsContent.value || !current?.result?.id)
      return;

    const controller = new AbortController();
    let disposed = false;
    let createdUrl = '';
    const timeout = setTimeout(() => controller.abort(), 120000);
    onCleanup(() => {
      disposed = true;
      controller.abort();
      clearTimeout(timeout);
      if (createdUrl)
        URL.revokeObjectURL(createdUrl);
    });
    loading.value = true;
    try {
      const blob = await getMediaContent({ model: current.model, predictionId: current.result.id }, controller.signal);
      if (disposed)
        return;
      createdUrl = URL.createObjectURL(blob);
      contentType.value = blob.type;
      objectUrl.value = createdUrl;
    }
    catch (cause) {
      if (!disposed) {
        error.value = controller.signal.aborted
          ? '资源加载超时，请重试。'
          : cause instanceof Error ? cause.message : '资源加载失败，请重试。';
      }
    }
    finally {
      clearTimeout(timeout);
      if (!disposed)
        loading.value = false;
    }
  }, { immediate: true });

  function retry() {
    attempt.value++;
  }

  return { source, mimeType, loading: readonly(loading), error: readonly(error), retry };
}

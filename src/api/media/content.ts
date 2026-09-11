import { useUserStore } from '@/stores';

/** Binary responses do not use the JSON-envelope request plugin. */
export async function getMediaContent(params: { model: string; predictionId: string }, signal: AbortSignal) {
  const query = new URLSearchParams(params);
  const response = await fetch(`${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/media/content?${query}`, {
    headers: {
      Authorization: `Bearer ${useUserStore().token}`,
      ClientID: import.meta.env.VITE_CLIENT_ID,
    },
    signal,
  });
  const mime = response.headers.get('content-type') || '';
  if (mime.includes('application/json')) {
    const result = await response.json();
    throw new Error(result.msg || '资源加载失败，请稍后重试。');
  }
  if (!response.ok || !/^(?:image|audio|video)\//i.test(mime))
    throw new Error('资源加载失败，请稍后重试。');
  const blob = await response.blob();
  if (!blob.size)
    throw new Error('资源内容为空，请重新查询任务。');
  return blob;
}

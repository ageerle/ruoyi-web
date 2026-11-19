import type { MediaDraft, TaskState } from './types';
import type { MediaGenerationResponse, MediaType } from '@/api/media/types';

export const mediaLabels: Record<MediaType, string> = { image: '图片', audio: '语音', video: '视频' };
export const taskLabels: Record<TaskState, string> = {
  submitting: '提交中',
  waiting: '生成中',
  success: '已完成',
  failed: '未完成',
  paused: '查询已暂停',
};

export function createDraft(): MediaDraft {
  return { model: '', prompt: '', size: '', voice: '', responseFormat: '', instructions: '', quality: '' };
}

/** Only expose browser-renderable media; never pass arbitrary provider URLs to links. */
export function mediaSource(result: MediaGenerationResponse | undefined, kind: MediaType): string {
  if (!result)
    return '';
  const mediaMime = kind === 'image'
    ? 'image/(?:png|jpeg|webp|gif|avif)'
    : kind === 'audio' ? 'audio/(?:mpeg|mp3|wav|x-wav|ogg|opus|aac|flac|webm|mp4)' : 'video/(?:mp4|webm|ogg)';
  const dataPattern = new RegExp(`^data:${mediaMime};base64,[A-Z0-9+/=\\s]+$`, 'i');
  if (result.dataUrl && dataPattern.test(result.dataUrl))
    return result.dataUrl;
  if (result.url) {
    try {
      const url = new URL(result.url);
      if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password)
        return url.href;
    }
    catch { /* Invalid media URLs are treated as empty results. */ }
  }
  if (result.b64Json && result.mimeType) {
    const dataUrl = `data:${result.mimeType};base64,${result.b64Json}`;
    if (dataPattern.test(dataUrl))
      return dataUrl;
  }
  return '';
}

export function classifyResult(result: MediaGenerationResponse, kind: MediaType): { state: TaskState; message: string } {
  const status = result.status?.trim().toLowerCase();
  if (status && ['failed', 'error', 'cancelled', 'canceled'].includes(status))
    return { state: 'failed', message: '服务未能完成生成，请检查模型配置和服务端日志。' };
  const waiting = ['pending', 'processing', 'queued', 'in_progress', 'running'];
  if (status && waiting.includes(status)) {
    return result.id
      ? { state: 'waiting', message: '任务已提交，正在等待生成结果。' }
      : { state: 'failed', message: '服务返回了等待状态，但没有任务 ID，无法继续查询。' };
  }
  if (status && !['completed', 'succeeded', 'success', 'done'].includes(status))
    return { state: 'paused', message: `服务返回了未识别的状态「${status}」，请核对任务状态后手动查询。` };
  if (mediaSource(result, kind))
    return { state: 'success', message: '生成完成，可以预览或保存结果。' };
  if (!status && result.id)
    return { state: 'waiting', message: '任务已提交，正在等待生成结果。' };
  return { state: 'failed', message: '服务没有返回可预览的资源，请检查模型配置或结果下载接口。' };
}

export function validateDraft(draft: MediaDraft, kind: MediaType): string {
  if (!draft.model)
    return '请先选择一个模型。';
  if (!draft.prompt.trim())
    return kind === 'audio' ? '请输入要朗读的文本。' : '请描述你想生成的内容。';
  if (kind === 'image' && draft.seed !== undefined
    && (!Number.isInteger(draft.seed) || draft.seed < 0 || draft.seed > 2147483647)) {
    return '随机种子需要是 0 到 2147483647 之间的整数。';
  }
  if (kind === 'video' && draft.seconds !== undefined && (!Number.isInteger(draft.seconds) || draft.seconds <= 0))
    return '视频时长需要是大于 0 的整数。';
  if (kind === 'audio' && draft.speed !== undefined && (!Number.isFinite(draft.speed) || draft.speed <= 0))
    return '语速需要大于 0。';
  return '';
}

export function requestError(error: unknown): string {
  if (error && typeof error === 'object' && 'result' in error) {
    const result = error.result;
    if (result && typeof result === 'object' && 'msg' in result && typeof result.msg === 'string')
      return result.msg.slice(0, 240);
  }
  return error instanceof Error ? error.message.slice(0, 240) : '请求未完成，请检查网络、模型配置和服务端日志。';
}

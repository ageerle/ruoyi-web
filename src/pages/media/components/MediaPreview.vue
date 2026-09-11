<script setup lang="ts">
import type { MediaTask } from '../types';
import type { MediaType } from '@/api/media/types';
import { Headset, Picture, VideoCamera } from '@element-plus/icons-vue';
import { computed, shallowRef, watch } from 'vue';
import { useMediaPreview } from '../useMediaPreview';
import { canQueryMedia, mediaLabels, taskLabels } from '../utils';

const props = defineProps<{ kind: MediaType; task?: MediaTask; querying: boolean; busy: boolean }>();
const emit = defineEmits<{ pause: [key: string]; resume: [key: string] }>();
const { source, mimeType, loading, error: contentError, retry } = useMediaPreview(() => props.task);
const icon = computed(() => ({ image: Picture, audio: Headset, video: VideoCamera })[props.task?.kind || props.kind]);
const mediaError = shallowRef(false);
const copied = shallowRef(false);
const copyError = shallowRef('');
const canResume = computed(() => Boolean(props.task?.result?.id && props.task.state !== 'success' && canQueryMedia(props.task.provider, props.task.kind)));
const download = computed(() => /^(?:data|blob):/.test(source.value));
const filename = computed(() => {
  const mime = mimeType.value || source.value.match(/^data:([^;]+);/i)?.[1];
  const extension = mime?.split('/')[1].replace('mpeg', 'mp3') || 'bin';
  return `ruoyi-${props.task?.kind || 'media'}.${extension}`;
});
watch([source, () => props.task?.key], () => {
  mediaError.value = false;
  copied.value = false;
  copyError.value = '';
});

async function copyId() {
  if (!props.task?.result?.id)
    return;
  try {
    await navigator.clipboard.writeText(props.task.result.id);
    copied.value = true;
    copyError.value = '';
  }
  catch {
    copyError.value = '复制失败，请手动选择任务 ID 复制。';
  }
}
</script>

<template>
  <section class="preview-panel" aria-label="生成结果">
    <div class="preview-heading">
      <div class="heading-label">
        <span class="step">02</span><h2 class="section-title">
          生成结果
        </h2>
      </div>
      <span v-if="task" class="status-pill" :class="task.state">{{ querying ? '正在查询' : taskLabels[task.state] }}</span>
      <span v-else class="preview-type">{{ mediaLabels[kind] }}预览</span>
    </div>

    <div class="preview-stage" :class="{ 'has-result': source }" aria-live="polite" :aria-busy="loading || task?.state === 'submitting' || querying">
      <template v-if="source && task">
        <img v-if="task.kind === 'image'" :src="source" :alt="task.prompt" class="image-result" @error="mediaError = true">
        <div v-else-if="task.kind === 'audio'" class="audio-result">
          <el-icon class="audio-icon">
            <Headset />
          </el-icon>
          <p class="audio-title">
            语音已生成
          </p>
          <audio :key="source" :src="source" controls preload="metadata" class="audio-player" @error="mediaError = true" />
        </div>
        <video v-else :key="source" :src="source" controls playsinline preload="metadata" class="video-result" @error="mediaError = true" />
      </template>
      <div v-else class="empty-preview">
        <div class="preview-symbol" :class="{ processing: loading || task?.state === 'waiting' || task?.state === 'submitting' }">
          <el-icon><component :is="icon" /></el-icon>
        </div>
        <h3 class="empty-title">
          {{ loading ? '正在加载资源' : contentError ? '资源加载失败' : task ? taskLabels[task.state] : '让想法有一个新模样' }}
        </h3>
        <p class="empty-description">
          {{ loading ? '作品已生成，正在准备预览。' : contentError || (task ? task.message : '选择模型，写下描述。你的创作会出现在这里。') }}
        </p>
      </div>
    </div>

    <div v-if="task" class="result-details">
      <p v-if="mediaError" class="resource-error" role="alert">
        资源暂时无法预览，可能已过期或浏览器不支持此格式。可以保存文件或打开资源检查。
      </p>
      <div class="result-meta">
        <span>{{ mediaLabels[task.kind] }}</span><strong>{{ task.modelLabel }}</strong>
      </div>
      <p v-if="source" class="prompt-summary">
        {{ task.prompt }}
      </p>
      <div v-if="task.result?.id" class="task-identity">
        <span>任务 ID</span><code>{{ task.result.id }}</code>
        <button type="button" class="text-action" @click="copyId">
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
      <p v-if="copyError" class="resource-error" role="alert">
        {{ copyError }}
      </p>
      <p v-if="task.result?.status" class="provider-status">
        服务状态：{{ task.result.status }}
      </p>
      <div class="result-actions">
        <el-button v-if="contentError" @click="retry">
          重新加载资源
        </el-button>
        <a v-if="source && download" :href="source" :download="filename" class="resource-link">保存文件</a>
        <a v-else-if="source" :href="source" target="_blank" rel="noopener noreferrer" class="resource-link">打开资源</a>
        <el-button v-if="task.state === 'waiting'" @click="emit('pause', task.key)">
          暂停查询
        </el-button>
        <el-button v-else-if="canResume" :disabled="busy" @click="emit('resume', task.key)">
          继续查询
        </el-button>
      </div>
    </div>
    <p v-else class="preview-footnote">
      支持图片预览、语音播放与视频播放
    </p>
  </section>
</template>

<style scoped lang="scss">
.preview-panel { min-width: 0; overflow: hidden; background: var(--el-bg-color); border: 1px solid var(--el-border-color-light); border-radius: 16px; }
.preview-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: var(--workspace-panel-padding); }
.heading-label { display: flex; align-items: center; gap: 10px; }
.step { font: 600 11px/24px monospace; color: var(--el-color-primary); }
.section-title { margin: 0; font-size: 16px; font-weight: 600; }
.preview-type, .provider-status { font-size: 12px; color: var(--el-text-color-secondary); }
.preview-stage { display: grid; min-height: clamp(220px, 42dvh, 460px); margin: 0 var(--workspace-panel-padding); overflow: hidden; place-items: center; background-color: var(--el-fill-color-lighter); background-image: radial-gradient(var(--el-border-color) 0.8px, transparent 0.8px); background-size: 18px 18px; border: 1px solid var(--el-border-color-lighter); border-radius: 10px; }
.has-result { background: var(--el-fill-color-lighter); }
.empty-preview { box-sizing: border-box; max-width: 410px; padding: 24px 16px; text-align: center; }
.preview-symbol { display: grid; width: 66px; height: 66px; margin: 0 auto 22px; font-size: 28px; color: var(--el-color-primary); background: var(--el-bg-color); border: 1px solid var(--el-border-color-light); border-radius: 18px; box-shadow: 0 6px 16px rgb(0 0 0 / 3%); }
.preview-symbol .el-icon { place-self: center; }
.empty-title { margin: 0 0 12px; font-size: 18px; font-weight: 600; }
.empty-description { margin: 0; font-size: 13px; line-height: 1.9; color: var(--el-text-color-secondary); overflow-wrap: anywhere; }
.image-result { display: block; max-width: 100%; max-height: min(56dvh, 560px); object-fit: contain; }
.video-result { display: block; width: 100%; max-height: min(56dvh, 560px); object-fit: contain; }
.audio-result { box-sizing: border-box; width: 100%; min-width: 0; padding: 24px 16px; text-align: center; }
.audio-icon { font-size: 52px; color: var(--el-color-primary); }
.audio-title { margin: 20px 0; font-size: 15px; font-weight: 500; }
.audio-player { display: block; width: 100%; max-width: 390px; margin: 0 auto; }
.result-details { padding: var(--workspace-panel-padding); }
.result-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 13px; }
.result-meta span { padding: 3px 6px; font-size: 10px; color: var(--el-text-color-secondary); background: var(--el-fill-color); border-radius: 4px; }
.result-meta strong { overflow-wrap: anywhere; font-weight: 500; }
.prompt-summary { margin-top: 12px; font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); overflow-wrap: anywhere; }
.task-identity { display: flex; align-items: baseline; gap: 8px; margin-top: 15px; font-size: 11px; color: var(--el-text-color-secondary); }
.task-identity code { flex: 1; min-width: 0; color: var(--el-text-color-regular); overflow-wrap: anywhere; }
.task-identity > span, .text-action { flex-shrink: 0; }
.text-action { padding: 4px; color: var(--el-color-primary); cursor: pointer; background: none; border: 0; }
.provider-status { margin-top: 10px; overflow-wrap: anywhere; }
.result-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 16px; }
.resource-link { padding: 9px 16px; font-size: 13px; color: var(--el-color-primary); text-decoration: none; border: 1px solid var(--el-color-primary-light-7); border-radius: 6px; }
.resource-error { margin-bottom: 14px; font-size: 12px; line-height: 1.7; color: var(--el-color-warning); }
.preview-footnote { padding: 16px; margin: 0; font-size: 12px; line-height: 1.6; color: var(--el-text-color-secondary); text-align: center; }
.status-pill { padding: 5px 9px; font-size: 11px; color: var(--el-text-color-secondary); background: var(--el-fill-color); border-radius: 6px; }
.status-pill.waiting, .status-pill.submitting { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.status-pill.failed { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
.status-pill.success { color: var(--el-color-success); background: var(--el-color-success-light-9); }
.processing { animation: breathe 1.8s ease-in-out infinite alternate; }
@keyframes breathe { to { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) { .processing { animation: none; } }
</style>

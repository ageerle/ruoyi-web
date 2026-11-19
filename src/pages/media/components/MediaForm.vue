<script setup lang="ts">
import type { MediaDraft, MediaModel } from '../types';
import type { MediaType } from '@/api/media/types';
import { computed } from 'vue';
import { mediaLabels } from '../utils';

const props = defineProps<{
  kind: MediaType;
  models: readonly MediaModel[];
  loading: boolean;
  modelError: string;
  error: string;
  busy: boolean;
  loggedIn: boolean;
  canQuery: boolean;
}>();
const emit = defineEmits<{
  submit: [];
  refresh: [];
  login: [];
  selectModel: [name: string];
  query: [];
}>();
const draft = defineModel<MediaDraft>({ required: true });
const taskId = defineModel<string>('taskId', { required: true });
const selectedModel = computed(() => props.models.find(model => model.modelName === draft.value.model));
const disabled = computed(() => props.busy || props.loading || !props.loggedIn);
const empty = computed(() => props.loggedIn && !props.loading && !props.modelError && props.models.length === 0);
const promptLabel = computed(() => props.kind === 'audio' ? '朗读文本' : '内容描述');
const examples: Record<MediaType, string> = {
  image: '一张知识库应用的封面：书本与简洁的几何线条，蓝白配色，干净的背景，不要文字。',
  audio: '欢迎使用 RuoYi AI。在这里，让你的想法变成图片、声音和视频。',
  video: '镜头缓慢推进，展示木桌上的一本书。窗边的自然光洒在书页上，画面安静、柔和。',
};

function update<K extends keyof MediaDraft>(key: K, value: MediaDraft[K]) {
  draft.value = { ...draft.value, [key]: value };
}
</script>

<template>
  <section class="media-form" aria-label="生成参数">
    <div class="section-heading">
      <span class="step">01</span>
      <h2 class="section-title">
        创作设置
      </h2>
    </div>
    <div v-if="!loggedIn" class="form-notice">
      <p>登录后，选择已配置的模型开始创作。</p>
      <el-button type="primary" plain @click="emit('login')">
        登录后使用
      </el-button>
    </div>
    <div v-else-if="modelError" class="form-notice" role="alert">
      <p>模型加载失败：{{ modelError }}</p>
      <el-button :loading="loading" @click="emit('refresh')">
        重新加载模型
      </el-button>
    </div>
    <div v-else-if="empty" class="form-notice">
      <p>暂无{{ mediaLabels[kind] }}模型</p>
      <p class="muted">
        请管理员在「对话管理 → 模型管理」配置对应分类的模型，并启用厂商。
      </p>
      <el-button :loading="loading" @click="emit('refresh')">
        刷新模型
      </el-button>
    </div>

    <el-form label-position="top" :disabled="disabled" @submit.prevent="emit('submit')">
      <el-form-item label="生成模型" label-for="media-model" required>
        <el-select
          id="media-model" :model-value="draft.model" placeholder="选择生成模型" filterable
          :loading="loading" :disabled="disabled || Boolean(modelError) || empty"
          class="full-width" @update:model-value="emit('selectModel', String($event))"
        >
          <el-option
            v-for="model in models" :key="model.modelName" :value="model.modelName"
            :label="model.label" :disabled="!model.supported"
          >
            <span>{{ model.label }}</span>
            <span class="provider-option">{{ model.supported ? model.providerCode : '工作台暂不支持' }}</span>
          </el-option>
        </el-select>
        <p v-if="selectedModel" class="model-caption">
          {{ selectedModel.providerCode }} · {{ selectedModel.modelName }}
        </p>
      </el-form-item>

      <el-form-item :label="promptLabel" label-for="media-prompt" required>
        <el-input
          id="media-prompt" :model-value="draft.prompt" type="textarea" :rows="4"
          :placeholder="kind === 'audio' ? '输入你想朗读的文字…' : '描述主体、场景、风格和你希望看到的细节…'"
          resize="vertical" @update:model-value="update('prompt', $event)"
        />
        <button type="button" class="example-button" :disabled="disabled" @click="update('prompt', examples[kind])">
          填入示例{{ kind === 'audio' ? '文本' : '描述' }}
        </button>
      </el-form-item>

      <details class="advanced-options">
        <summary>更多参数 <span class="muted">选填</span></summary>
        <p class="field-help">
          留空使用模型默认值。参数取值以所选模型支持的范围为准。
        </p>
        <template v-if="kind !== 'audio'">
          <el-form-item label="画面尺寸" label-for="media-size">
            <el-input id="media-size" :model-value="draft.size" placeholder="留空使用默认尺寸" @update:model-value="update('size', $event)" />
          </el-form-item>
        </template>
        <el-form-item v-if="kind === 'image'" label="随机种子" label-for="media-seed">
          <!-- Element Plus 2.10 initializes the input's aria-disabled only on mount. -->
          <el-input-number id="media-seed" :key="String(disabled)" :model-value="draft.seed" :min="0" :max="2147483647" :precision="0" controls-position="right" placeholder="可选" class="full-width" @update:model-value="update('seed', $event)" />
        </el-form-item>
        <template v-if="kind === 'audio'">
          <el-form-item label="音色" label-for="media-voice">
            <el-input id="media-voice" :model-value="draft.voice" placeholder="留空使用默认音色" @update:model-value="update('voice', $event)" />
          </el-form-item>
          <div class="field-pair">
            <el-form-item label="音频格式" label-for="media-format">
              <el-select id="media-format" :model-value="draft.responseFormat" placeholder="模型默认" @update:model-value="update('responseFormat', $event)">
                <el-option label="模型默认" value="" />
                <el-option v-for="format in ['mp3', 'wav', 'opus', 'aac', 'flac']" :key="format" :label="format.toUpperCase()" :value="format" />
              </el-select>
            </el-form-item>
            <el-form-item label="语速" label-for="media-speed">
              <el-input-number id="media-speed" :key="String(disabled)" :model-value="draft.speed" :min="0.01" :step="0.1" controls-position="right" placeholder="默认" class="full-width" @update:model-value="update('speed', $event)" />
            </el-form-item>
          </div>
          <el-form-item label="朗读要求" label-for="media-instructions">
            <el-input id="media-instructions" :model-value="draft.instructions" placeholder="例如：自然、清晰，语气轻松" @update:model-value="update('instructions', $event)" />
          </el-form-item>
        </template>
        <template v-if="kind === 'video'">
          <el-form-item label="时长（秒）" label-for="media-seconds">
            <el-input-number id="media-seconds" :key="String(disabled)" :model-value="draft.seconds" :min="1" :precision="0" controls-position="right" placeholder="默认" class="full-width" @update:model-value="update('seconds', $event)" />
          </el-form-item>
          <el-form-item label="画质" label-for="media-quality">
            <el-input id="media-quality" :model-value="draft.quality" placeholder="留空使用模型默认画质" @update:model-value="update('quality', $event)" />
          </el-form-item>
        </template>
      </details>

      <p v-if="error" class="form-error" role="alert">
        {{ error }}
      </p>
      <el-button
        native-type="submit" type="primary" size="large" class="generate-button"
        :disabled="disabled || !selectedModel?.supported || Boolean(modelError)"
      >
        {{ busy ? '任务处理中…' : `生成${mediaLabels[kind]}` }}
      </el-button>
      <p class="field-help">
        {{ busy ? '请等待当前任务，或在结果区域暂停查询后再创建。' : '生成将使用所选模型，费用由模型服务商按用量计算。' }}
      </p>
    </el-form>

    <details class="existing-task">
      <summary>查询已有任务</summary>
      <p class="field-help">
        选择创建任务时使用的模型，再填写任务 ID。
      </p>
      <el-input v-model="taskId" aria-label="已有任务 ID" placeholder="输入任务 ID" :disabled="disabled" />
      <el-button class="query-button" :disabled="disabled || !canQuery || !taskId.trim()" @click="emit('query')">
        查询任务
      </el-button>
      <p v-if="selectedModel && !canQuery" class="field-help">
        当前模型暂不支持任务查询。
      </p>
    </details>
  </section>
</template>

<style scoped lang="scss">
.media-form { min-width: 0; padding: var(--workspace-panel-padding); background: var(--el-bg-color); border: 1px solid var(--el-border-color-light); border-radius: 16px; }
.section-heading { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
.step { font: 600 11px/24px monospace; color: var(--el-color-primary); }
.section-title { margin: 0; font-size: 16px; font-weight: 600; }
.full-width { width: 100%; }
.provider-option { margin-left: 14px; font-size: 11px; color: var(--el-text-color-secondary); }
.model-caption { margin: 7px 0 0; overflow-wrap: anywhere; font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); }
.example-button { padding: 5px 0 0; margin-top: 4px; font-size: 12px; color: var(--el-color-primary); cursor: pointer; background: none; border: 0; }
.example-button:disabled { cursor: default; opacity: 0.5; }
.advanced-options, .existing-task { padding: 12px 0; border-top: 1px solid var(--el-border-color-lighter); }
.advanced-options summary, .existing-task summary { font-size: 13px; font-weight: 600; cursor: pointer; }
.muted { margin-left: 4px; font-weight: 400; color: var(--el-text-color-secondary); }
.field-help { margin: 8px 0; font-size: 12px; line-height: 1.7; color: var(--el-text-color-secondary); }
.field-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-pair > * { min-width: 0; }
.generate-button { width: 100%; margin-top: 4px; font-weight: 600; }
.existing-task { padding-bottom: 0; margin-top: 12px; }
.query-button { width: 100%; margin-top: 12px; }
.form-error { margin-bottom: 12px; font-size: 13px; line-height: 1.7; color: var(--el-color-danger); }
.form-notice { padding: 14px; margin-bottom: 20px; font-size: 13px; line-height: 1.7; background: var(--el-fill-color-light); border-radius: 10px; }
.form-notice p { margin: 0 0 10px; overflow-wrap: anywhere; }
:deep(.el-form-item__label) { font-size: 13px; font-weight: 500; }
:deep(.el-form-item) { margin-bottom: 16px; }
</style>

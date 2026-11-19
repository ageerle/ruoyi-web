<!-- 默认消息列表页 -->
<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import ChatSender from '@/components/ChatSender/index.vue';
import WelecomeText from '@/components/WelecomeText/index.vue';
import { useUserStore } from '@/stores';
import { useChatStore } from '@/stores/modules/chat';
import { useFilesStore } from '@/stores/modules/files';
import { useSessionStore } from '@/stores/modules/session';

import ChatMessageImage from '../chatWithId/components/ChatMessageImage.vue';

const route = useRoute();
const userStore = useUserStore();
const chatStore = useChatStore();
const filesStore = useFilesStore();
const sessionStore = useSessionStore();

const senderValue = ref('');
const senderRef = ref<InstanceType<typeof ChatSender> | null>(null);

const sending = shallowRef<{ content: string; image?: File }>();
let discardPending = false;

async function handleSubmit(content: string, image?: File) {
  if (sending.value)
    return;

  const message = { content, image };
  sending.value = message;
  discardPending = false;
  senderValue.value = '';
  const title = content.trim().slice(0, 10) || '图片提问';
  let queuedSessionId: string | undefined;
  const opened = await sessionStore.createSessionList({
    userId: userStore.userInfo?.userId as number,
    sessionContent: content,
    sessionTitle: title,
    remark: title,
  }, (sessionId) => {
    if (discardPending)
      return;
    queuedSessionId = sessionId;
    chatStore.queueMessage({ sessionId, ...message });
  });

  sending.value = undefined;
  if (!opened && queuedSessionId)
    chatStore.takeMessage(queuedSessionId);

  if (!opened && route.name === 'chat' && userStore.token && !discardPending) {
    senderValue.value = content;
    if (image)
      filesStore.setImage(image);
  }
}

function cancelPending() {
  discardPending = true;
}
</script>

<template>
  <div class="chat-defaul-wrap">
    <WelecomeText v-if="!sending" />
    <div v-else class="first-message">
      <div class="first-message-user">
        <ChatMessageImage v-if="sending.image" :file="sending.image" />
        <span v-if="sending.content">{{ sending.content }}</span>
      </div>
      <Bubble :loading="true" :no-style="true" />
    </div>
    <ChatSender
      ref="senderRef"
      v-model="senderValue"
      :loading="!!sending"
      @submit="handleSubmit"
      @cancel="cancelPending"
    />
  </div>
</template>

<style scoped lang="scss">
.first-message {
  width: 100%;
  margin-bottom: 16px;
}

.first-message-user {
  width: fit-content;
  max-width: 80%;
  margin-left: auto;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
}

.chat-defaul-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  min-height: 450px;
}
</style>

<script lang="ts" setup>
import { computed, nextTick,ref,watch  } from 'vue'
import { HoverButton, SvgIcon } from '@/components/common'
import {  gptConfigStore, homeStore, useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import {NModal} from "naive-ui"
import aiModel from "@/views/mj/aiModel.vue"
import { chatSetting } from '@/api'

const { isMobile } = useBasicLayout()
interface Props {
  usingContext: boolean,
  haveData: boolean
}

interface Emit {
  (ev: 'export'): void
  (ev: 'handleClear'): void
}

defineProps<Props>()
const emit = defineEmits<Emit>()

const appStore = useAppStore()
const chatStore = useChatStore()

const collapsed = computed(() => appStore.siderCollapsed)
const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

function onScrollToTop() {
  const scrollRef = document.querySelector('#scrollRef')
  if (scrollRef)
    nextTick(() => scrollRef.scrollTop = 0)
}

function handleExport() {
  emit('export')
}

function handleClear() {
  emit('handleClear')
}
const uuid = chatStore.active;
const chatSet = new chatSetting( uuid==null?1002:uuid);
const nGptStore = ref( chatSet.getGptConfig())  ;
const st = ref({isShow:false});
watch(()=>gptConfigStore.myData,()=>nGptStore.value=  chatSet.getGptConfig() , {deep:true})
watch(()=>homeStore.myData.act,(n)=> n=='saveChat' && (nGptStore.value=  chatSet.getGptConfig() ), {deep:true})

</script>

<template>
  <header
    class="sticky top-0 left-0 right-0 z-30 border-b dark:border-neutral-800 bg-white/80 dark:bg-black/20 backdrop-blur chat-header top-header"
  >
    <div class="relative flex items-center justify-between min-w-0 overflow-hidden h-14" style="height: 116px; line-height: 116px;">
      <div class="flex items-center">
        <button
          class="flex items-center justify-center w-11 h-11"
          @click="handleUpdateCollapsed" v-if="isMobile"
        >
          <SvgIcon v-if="collapsed" class="text-2xl" icon="ri:align-justify" />
          <SvgIcon v-else class="text-2xl" icon="ri:align-right" />
        </button>
      </div>
      <p
        class="flex-1 px-4 pr-6 overflow-hidden cursor-pointer select-none text-ellipsis whitespace-nowrap"
        @dblclick="onScrollToTop"
      >
        {{ currentChatHistory?.title ?? '' }}
      </p>
      <div class="flex items-center space-x-2 header-button">
        <!-- <HoverButton @click="handleExport">
          <span class="text-xl text-[#4f555e] dark:text-white">
            <SvgIcon icon="ri:download-2-line" />
          </span>
        </HoverButton> -->
        <HoverButton @click="handleClear" class="clear-chat">
          <span class="text-xl text-[#4f555e] dark:text-white" >
            <IconSvg icon="clear" width="28px" height="22px"></IconSvg>
            <!-- <SvgIcon icon="ri:delete-bin-line" /> -->
          </span>
        </HoverButton>
      </div>
    </div>


  </header>

  <NModal v-model:show="st.isShow"   preset="card"  :title="$t('mjchat.modelChange')" class="!max-w-[540px] change-dialog" @close="st.isShow=false" >
        <aiModel @close="st.isShow=false"/>
  </NModal>
</template>

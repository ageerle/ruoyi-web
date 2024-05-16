<script setup lang="ts">
import { computed,defineAsyncComponent ,ref} from "vue";
import { SvgIcon} from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
const { isMobile } = useBasicLayout()
import { NTooltip } from 'naive-ui'
import { homeStore,useChatStore } from '@/store'
const chatStore = useChatStore()
//import gallery from '@/views/gallery/index.vue'

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))


const st= ref({'show':false,showImg:false, menu:[],active:'chat'})


import { router } from '@/router'

const goHome =computed(  () => {

  return router.currentRoute.value.name
});

const chatId= computed(()=>chatStore.active??'1002' );
</script>
<template>
<div class="flex-shrink-0 w-[60px] z-[1000]  h-full" v-if="!isMobile">
    <div class="flex h-full select-none flex-col items-center justify-between bg-[#e8eaf1] px-2 pt-4 pb-8 dark:bg-[#25272d]">
        <div class="flex flex-col space-y-4 flex-1">
            <a :href="`#/chat/${chatId}`"    @click="st.active='chat'" class="router-link-active router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]">
                <n-tooltip placement="right" trigger="hover">
                  <template #trigger>
                    <div  class="flex h-full justify-center items-center py-1 flex-col " :class="[ goHome =='Chat' ? 'active' : '']">
                    <SvgIcon icon="ri:wechat-line" class="text-3xl  flex-1"></SvgIcon>
                     <span class="text-[10px]">{{$t('mjtab.chat')}}</span>
                    </div>
                 </template>
                AI Chat
                </n-tooltip>
            </a>
            <a   @click="homeStore.setMyData({act:'showgpts'}) " class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]">
                <n-tooltip placement="right" trigger="hover">
                  <template #trigger>
                    <div  class="flex h-full justify-center items-center   py-1 flex-col" >
                    <SvgIcon icon="ri:apps-fill" class="text-3xl flex-1"></SvgIcon>
                     <span class="text-[10px]">应用</span>
                    </div>
                  </template>
                    应用商店
                </n-tooltip>
            </a>



            <a :href="`#/draw/${chatId}`" @click="st.active='draw'" class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]">
                <n-tooltip placement="right" trigger="hover">
                  <template #trigger>
                    <div  class="flex h-full justify-center items-center   py-1 flex-col" :class="[goHome=='draw' ? 'active' : '']">
                    <SvgIcon icon="ic:outline-palette" class="text-3xl flex-1"></SvgIcon>
                     <span class="text-[10px]">{{$t('mjtab.draw')}}</span>
                    </div>
                  </template>
                    {{$t('mjtab.drawinfo')}}
                </n-tooltip>
            </a>

					<a   @click="homeStore.setMyData({act:'gallery'}) " class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]">
						<n-tooltip placement="right" trigger="hover">
							<template #trigger>
								<div  class="flex h-full justify-center items-center   py-1 flex-col" >
									<SvgIcon icon="material-symbols:imagesmode-outline" class="text-3xl flex-1"></SvgIcon>
									<span class="text-[10px]">{{$t('mjtab.gallery')}}</span>
								</div>
							</template>
							{{ $t('mjtab.galleryInfo') }}
						</n-tooltip>
					</a>

<!--            <a :href="`#/music`" @click="st.active='music'" class=" router-link-exact-active h-12 w-12 cursor-pointer rounded-xl bg-white duration-300 dark:bg-[#34373c] hover:bg-[#bbb] dark:hover:bg-[#555]"-->
<!--             >-->
<!--                <n-tooltip placement="right" trigger="hover">-->
<!--                  <template #trigger> -->
<!--                    <div  class="flex  h-full justify-center items-center py-1 flex-col " :class="[ goHome =='music' ? 'active' : '']">-->
<!--                      <SvgIcon icon="arcticons:wynk-music" class="text-3xl flex-1"></SvgIcon>-->
<!--                      <span class="text-[10px]">音乐</span>-->
<!--                    </div>  -->
<!--                  </template>-->
<!--                    音乐创作-->
<!--                </n-tooltip>                -->
<!--            </a>-->

        </div>

    </div>
</div>
 <Setting v-if="st.show" v-model:visible="st.show" />


</template>


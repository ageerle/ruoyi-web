<script setup lang="ts">
import { myFetch, gptsType, mlog, chatSetting,my2Fetch } from '@/api';
import { homeStore,gptConfigStore,useChatStore, gptsUlistStore } from '@/store';
import { ref,computed ,watch  } from 'vue';
import { useMessage ,NButton,NImage,NPopover} from 'naive-ui';
import { SvgIcon } from '@/components/common';
import { useRouter } from 'vue-router';
import { getGpts } from '@/api/chatmsg';
import { t } from '@/locales';
import to from 'await-to-js';

const router = useRouter()
const ms = useMessage();
const chatStore = useChatStore()
const emit = defineEmits(['close','toq']);
const pp= defineProps<{q:string}>( );
//const gptsList= ref<gptsType[]>([]);
const gptsPageList = ref<gptsType[]>([]);
const gptsInitList = ref<gptsType[]>([]);
const gptsSearchList = ref<gptsType[]>([]);

const pageNum = ref(1);
const pageSize = ref(12);
const total = ref(0);


const st= ref({loadPage:false,q:'',tab:'',search:false});
// const tag= ref(['画图','文件','发票']);
const load= async ()=>{

    // const gptUrl= homeStore.myData.session.gptUrl?  homeStore.myData.session.gptUrl :'';
    // mlog('load',gptUrl );
     let d;
    if( homeStore.myData.session.gptUrl ){
       d = await my2Fetch( homeStore.myData.session.gptUrl);
    }else {
        const params = { pageNum: pageNum.value, pageSize: pageSize.value };
        const [err, result] = await to(getGpts(params));
        if(err){
            console.log("err===",err)
        }else{
            total.value = result.total;
            gptsInitList.value = result.rows as unknown as gptsType[];
        }

        d = await myFetch('https://gpts.ddaiai.com/open/gpts');

    }

}
const go= async ( item: gptsType)=>{
    const saveObj= {model:  `${ item.gid }`   ,gpts:item}
    gptConfigStore.setMyData(saveObj);
    if(chatStore.active){ //保存到对话框
        const  chatSet = new chatSetting( chatStore.active );
        if( chatSet.findIndex()>-1 ) chatSet.save( saveObj )
    }
    ms.success(t('mjchat.success2'));
    const gptUrl= `https://gpts.ddaiai.com/open/gptsapi/use`;
    myFetch(gptUrl,item );
    emit('close');
    mlog('go local ', homeStore.myData.local );
    if(homeStore.myData.local!=='Chat') router.replace({name:'Chat',params:{uuid:chatStore.active}});

    gptsUlistStore.setMyData( item );

}

const pageLoad = async () => {
    // 如果已经在加载中，或者已经加载完所有数据，直接返回，防止重复加载


    if (st.value.loadPage || (pageNum.value * pageSize.value >= total.value)) return;

    // 设置加载状态
    st.value.loadPage = true;
    pageNum.value += 1;

    const params = { pageNum: pageNum.value, pageSize: pageSize.value };

    try {
        const result = await getGpts(params);
        let rz = result.rows as unknown as gptsType[];
        // 更新总数据量
        total.value = result.total;

        // 合并新数据到现有列表
        gptsPageList.value = [...gptsPageList.value, ...rz];

        // 检查是否已经加载完所有数据
        if (pageNum.value * pageSize.value >= total.value) {
            ms.success("All data loaded");
        }
    } catch (err) {
        console.error("Error loading page:", err);
    } finally {
        // 无论成功与否，都要重置加载状态
        st.value.loadPage = false;
    }
};



const gptsList = computed(()=>{
    let rz:gptsType[]=[];
    if(st.value.tab=='search'){
        return gptsSearchList.value;
        //mlog('search', st.value.tab );
    }
    return rz.concat( gptsInitList.value,gptsPageList.value );
})
const searchQ= async (q:string)=>{
    st.value.q= q;
    st.value.tab= 'search';
    st.value.search= true;
    const gptUrl= `https://gpts.ddaiai.com/open/gptsapi/search?q=${ st.value.q }`;
    let d = await myFetch(gptUrl);
      st.value.search= false;
    gptsSearchList.value = d.data.list as gptsType[];
}
const goSearch =(q:string)=>{
    emit('toq',{q});
    searchQ(q);
}

const badgo=(item:gptsType ,e:Event )=>{
    e.stopPropagation();
    mlog('badgo', item );
    const gptUrl= `https://gpts.ddaiai.com/open/gptsapi/bad`;
    myFetch(gptUrl,item );
    item.bad= item.bad?(+item.bad+1):1;
}

watch(()=>pp.q,(n)=>{
    if(n=='') st.value.tab= '';
})
load();
defineExpose({ searchQ })
</script>
<template>

<div class="w-full h-full p-4 store-content">
    <template v-if="gptsList.length>0">
        <!-- <div class="flex items-center justify-start line-clamp-1 pb-4"  >
            <div class="m-1 cursor-pointer store-label-item" v-for="v in tag" @click="goSearch(v)" :key="v">
            <n-button strong  :bordered="false"  round size="small" type="success" v-if="v==pp.q">{{ v }}</n-button>
            <n-button strong secondary :bordered="false" round size="small" type="success" v-else>{{ v }}</n-button>
            </div>
        </div> -->
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"  >

            <div @click="go(v)" v-for="v in gptsList" class="group relative flex gap-3 rounded-2xl bg-[#e8eaf1] p-5 dark:bg-neutral-600 cursor-pointer store-info-item">

                <NImage :src="v.logo" :preview-disabled="true" lazy
                class="group-hover:scale-[130%] duration-300 shrink-0 overflow-hidden bg-base object-cover rounded-full bc-avatar w-[80px] h-[80px]">
                    <template #placeholder>
                      <div class="w-full h-full justify-center items-center flex"  >
                       <SvgIcon icon="line-md:downloading-loop" class="text-[60px] text-green-300"   ></SvgIcon>
                      </div>
                    </template>
                </NImage>
                <div class="min-w-0 flex-1 mt-[-10px]">
                    <div class="flex justify-between items-center">
                        <p style="font-size: 17px"> {{ v.name }}</p>
                    </div>
                    <div class="mt-0.5 text-zinc-400 text-md line-clamp-2">{{ v.info }}</div>

                </div>
                <!-- <img  class="group-hover:scale-[130%] duration-300 shrink-0 overflow-hidden bg-base object-cover rounded-full bc-avatar w-[80px] h-[80px]" :src="v.logo"/> -->
                <div class="space-x-1 flex absolute bottom-2 left-4 dianzan">
                     <n-popover trigger="hover">
                        <template #trigger>
                        <!-- <n-tag type="success" size="small" round> -->
                        <div style="color: #D84C10;" class="flex items-center"><SvgIcon icon="mdi:hot"  ></SvgIcon>{{ v.useCnt }}</div>
                        <!-- </n-tag> -->
                        </template>
                        <span>{{ $t('chat.like') }}</span>
                    </n-popover>
                     <n-popover trigger="hover" >
                        <template #trigger>
                        <!-- <n-tag type="success" size="small" round > -->
                        <div style="color: #0084FF; margin-left: 20px;" class="flex items-center cursor-pointer" @click="badgo(v, $event )"><SvgIcon icon="icon-park-outline:bad-two"  ></SvgIcon>
                        <span class="ml-[2px]" > {{ v.bad }}</span>
                        </div>
                        <!-- </n-tag> -->
                        </template>
                         <span>{{ $t('chat.bad') }}</span>
                    </n-popover>
                </div>
            </div>

        </div>
        <div class="flex items-center justify-center py-10" v-if="st.tab=='' ">
            <div @click="pageLoad()" v-if="st.loadPage">{{ $t('mjchat.loading2') }}</div>
            <NButton @click="pageLoad()" v-else>{{ $t('mjchat.loadmore') }}</NButton>
        </div>
    </template>
    <div class="h-full flex items-center justify-center flex-col"  v-else-if="st.tab=='search' && !st.search">
        <div>{{ $t('mjchat.nofind') }}<b class=" text-green-400">{{st.q}}</b> {{$t('mjchat.nofind2')}}</div>

        <div class="flex items-center justify-center flex-wrap">
            <div class="m-1 cursor-pointer" v-for="v in tag" @click="goSearch(v)"><n-button strong secondary round size="small" type="success" >{{ v }}</n-button></div>
        </div>

    </div>
    <div class="h-full flex items-center justify-center"  v-else>
        {{ $t('mjchat.loading2') }}
    </div>
</div>
</template>

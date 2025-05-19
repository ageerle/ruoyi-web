<script setup lang="ts">
import { computed, watch, ref, onMounted } from "vue";
import { NInput, NPopconfirm, NScrollbar } from "naive-ui";
import { SvgIcon } from "@/components/common";
import {
	gptConfigStore,
	gptConfigType,
	homeStore,
	useAppStore,
	useChatStore,
	useDataStore,
} from "@/store";
import { useBasicLayout } from "@/hooks/useBasicLayout";
import { debounce } from "@/utils/functions/debounce";
import { chatSetting, mlog } from "@/api";
import { changeSessionList ,getMessage,removeSession,getMessageList} from "@/api/bot";
import AiListText from "@/views/mj/aiListText.vue";

const { isMobile } = useBasicLayout();

const appStore = useAppStore();
const chatStore = useChatStore();
const dataSources = computed(() => chatStore.history);
// const dataStore = useDataStore();
// const dataSources=computed(() => dataStore.sessions)
// const messages=computed(() => dataStore.messages)
// console.log("===============dataStore", dataStore);
// console.log("===============dataStore.messages", messages);
// useDataStore

onMounted(() => {
	chatStore.initializeData();
});

async function handleSelect({ uuid }: Chat.History) {
	if (isActive(uuid)) return;

	if (chatStore.active)
		chatStore.updateHistory(chatStore.active, { isEdit: false });
	await chatStore.setActive(uuid);

	if (isMobile.value) appStore.setSiderCollapsed(true);
}

function handleEdit(
	// item:any,
	{ uuid }: Chat.History,
	isEdit: boolean,
	event?: MouseEvent
) {
	event?.stopPropagation();
	chatStore.updateHistory(uuid, { isEdit });
// 		item.isEdit = isEdit;
// console.log("handleEdit", item);
// 	dataStore.updateItemAction(item,false)
}

function handleDelete(index: number, event?: MouseEvent | TouchEvent) {
	event?.stopPropagation();
	chatStore.deleteHistory(index);
	if (isMobile.value) appStore.setSiderCollapsed(true);
}

const handleDeleteDebounce = debounce(handleDelete, 600);

function handleEnter(
	{ uuid }: Chat.History,
	isEdit: boolean,
	event: KeyboardEvent
) {
	event?.stopPropagation();
	// if (event.key === "Enter") dataStore.updateItemAction(item,false);
	if (event.key === "Enter") chatStore.updateHistory(uuid, { isEdit });
}

function isActive(uuid: number) {
	// console.log(dataStore.active, uuid);
	// return dataStore.active.id === uuid;
	return chatStore.active === uuid;
}

const chatSet = new chatSetting(chatStore.active ?? 1002);
const myuid = ref<gptConfigType[]>([]); //computed( ()=>chatSet.getObjs() ) ;
const toMyuid = () => (myuid.value = chatSet.getObjs());
toMyuid();
const isInObjs = (uuid: number): undefined | gptConfigType => {
	// console.log("isInObjs", uuid);
	if (!myuid.value.length) return;
	const index = myuid.value.findIndex((item: gptConfigType) => {
		return item.uuid == uuid;
	});
	if (index == -1) return;
	mlog("index", index, myuid.value[index]);
	return myuid.value[index];
};
watch(
	() => homeStore.myData.act,
	(n: string) => n == "saveChat" && toMyuid(),
	{ deep: true }
);
watch(() => gptConfigStore.myData, toMyuid, { deep: true });
</script>

<template>
	<NScrollbar class="px-4 chat-history">
		<div class="flex flex-col gap-2 text-sm">
			<!-- <p class="history-title" @click="newChangeSessionList">测试点击</p> -->

			<p class="history-title">{{ $t("common.history") }}</p>
			<template v-if="!dataSources.length">
				<div
					class="flex flex-col items-center mt-4 text-center text-neutral-300"
				>
					<SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
					<span>{{ $t("common.noData") }}</span>
				</div>
			</template>
			<template v-else>
				<div v-for="(item, index) of dataSources" :key="index">
					<a
						class="relative flex items-center gap-3 px-3 py-3 break-all border rounded-md cursor-pointer hover:bg-neutral-100 group dark:border-neutral-800 dark:hover:bg-[#24272e] chat-item"
						:class="isActive(item.uuid) && ['check-chat-item']"
						@click="handleSelect(item)"
					>
						<AiListText
							:myObj="isInObjs(item.uuid)"
							:myItem="item"
							:index="index"
						>
							<NInput
								style="width: 226px"
								v-if="item.isEdit"
								v-model:value="item.title"
								size="small"
								@keypress="handleEnter(item, false, $event)"
							/>
						</AiListText>
						<div
							v-if="isActive(item.uuid)"
							class="absolute z-10 flex visible right-1"
						>
							<template v-if="item.isEdit">
								<button class="p-1" @click="handleEdit(item, false, $event)">
									<SvgIcon icon="ri:save-line" />
								</button>
							</template>
							<template v-else>
								<button class="p-1">
									<SvgIcon
										icon="ri:edit-line"
										width="18px"
										height="18px"
										@click="handleEdit(item, true, $event)"
									/>
								</button>
								<NPopconfirm
									placement="bottom"
									@positive-click="handleDeleteDebounce(index, $event)"
								>
									<template #trigger>
										<button class="p-1">
											<SvgIcon
												icon="ri:delete-bin-line"
												width="16px"
												height="16px"
											/>
										</button>
									</template>
									{{ $t("chat.deleteHistoryConfirm") }}
								</NPopconfirm>
							</template>
						</div>
					</a>
				</div>
			</template>
		</div>
	</NScrollbar>
</template>

<template>
	<div class="fanyi-container">
		<n-card>
			<textComponent />
			<!-- <n-tabs animated :value="activeTab" @update:value="activeTab = $event">
				<n-tab-pane name="1" tab="文本">
					<textComponent />
				</n-tab-pane>
				<n-tab-pane name="2" tab="文档">
					<documentComponent />
				</n-tab-pane>
			</n-tabs> -->
		</n-card>
	</div>
</template>

<script setup>
import { ref } from "vue";
import documentComponent from "@/views/fanyi/components/documentComponent.vue";
import textComponent from "@/views/fanyi/components/textComponent.vue";
import { NCard, NTabs, NTabPane } from "naive-ui";

const activeTab = ref("1");
</script>

<style scoped lang="less"></style>

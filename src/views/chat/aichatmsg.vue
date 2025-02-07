<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { NDataTable, useMessage,NPagination } from 'naive-ui';
import { listByUser } from '@/api/chatmsg';
import to from 'await-to-js';
import { t } from '@/locales';

const message = useMessage();
const columns = ref([
  // {
  //   title: 'ID',
  //   key: 'id',
  //   width: 80,
  //   ellipsis: true,
  // },
  { title: t('model.content'), key: 'content', ellipsis: { tooltip: true } },
  { title: t('model.modelName'), key: 'modelName' , ellipsis: { tooltip: true } },
  { title: t('model.totalTokens'), key: 'totalTokens'},
  { title: t('model.deductCost'), key: 'deductCost'},
  { title: t('model.msgtime'), key: 'createTime' },
  // { title: t('model.msgremark'), key: 'remark'  , ellipsis: { tooltip: true } }
]);
const tableData = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageCount: 0, // 根据总条数和pageSize计算
  itemCount: 0, // 总条数
  showSizePicker: true,
  pageSizes: [10, 20, 30, 40],
  onChange: (page: number) => {
    fetchData(page, pagination.pageSize);
  },
  onUpdatePageSize: (pageSize: number) => {
    fetchData(1, pageSize);
  }
});

const fetchData = async (pageNum: number, pageSize: number) => {
  const params = { pageNum, pageSize };
  const [err, result] = await to(listByUser(params));
  if (err) {
    message.error(err.message);
    return;
  }
  tableData.value = result.data.rows;
  pagination.itemCount = result.data.total;
  pagination.pageCount = Math.ceil(result.data.total / pageSize);
};

onMounted(() => {
  fetchData(pagination.page, pagination.pageSize);
});
</script>

<template>
  <div class="flex h-full">
    <main class="flex-1 overflow-hidden h-full">
      <n-data-table 
        :columns="columns"
        :data="tableData"
      />
      <div class="pagination-wrapper">
        <n-pagination
          v-model:page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :item-count="pagination.itemCount"
          :page-sizes="pagination.pageSizes"
          :show-size-picker="pagination.showSizePicker"
          @update:page="pagination.onChange"
          @update:page-size="pagination.onUpdatePageSize"
        />
      </div>
    </main>
  </div>
</template>
<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end; /* Aligns the pagination to the right */
  padding: 10px; /* Adds space around the pagination */
}

</style>
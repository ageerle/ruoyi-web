<script setup lang="ts">
import type { AgentVO } from '@/api/agent/types';
import type { WfNodeInput, WfNodeInputDef, WorkflowNodeDto, WorkflowResp } from '@/api/chat/types';
import { useRouter } from 'vue-router';
import { getWorkflowDetail, getWorkflowList } from '@/api';
import { useAgentStore } from '@/stores/modules/agent';
import { useChatStore } from '@/stores/modules/chat';
import { useUserStore } from '@/stores/modules/user';

const router = useRouter();
const agentStore = useAgentStore();
const chatStore = useChatStore();
const userStore = useUserStore();

const workflows = ref<WorkflowResp[]>([]);
const loading = ref(false);
const pageSize = ref(20);
const currentPage = ref(1);
const total = ref(0);
const applications = computed(() => [
  ...agentStore.agentList.map(item => ({ type: 'agent' as const, data: item })),
  ...workflows.value.map(item => ({ type: 'workflow' as const, data: item })),
]);

// 复杂输入表单相关
const formVisible = ref(false);
const formLoading = ref(false);
const pendingWorkflow = ref<WorkflowResp | null>(null);
const pendingStartInputs = ref<WfNodeInputDef[]>([]);
const formValues = ref<WfNodeInput[]>([]);

async function loadApplications() {
  loading.value = true;
  try {
    const [res] = await Promise.all([
      getWorkflowList({ currentPage: currentPage.value, pageSize: pageSize.value }),
      agentStore.requestAgentList(),
    ]);
    // 后端 /workflow/public/search 返回 R<Page<WorkflowResp>>，结构为 {code,msg,data:{records,total}}；
    // 兼容 TableDataInfo 形态 {code,msg,rows,total}（hook-fetch 不解包，原样返回响应体）
    const payload = (res as any)?.data ?? res;
    const list = payload?.records ?? payload?.rows ?? [];
    workflows.value = list as WorkflowResp[];
    total.value = payload?.total ?? list.length;
  }
  catch (e) {
    console.error('加载工作流列表失败', e);
  }
  finally {
    loading.value = false;
  }
}

onMounted(loadApplications);

/**
 * 找到 start 节点：优先按组件名精确匹配（与后端 WorkflowEngine.findStartAndEndNode 一致），
 * 兜底再用"没有入边的节点"。仅靠"没有入边"在分支拓扑下可能误判，拿到错误节点的输入 schema。
 */
function findStartNode(wf: WorkflowResp): WorkflowNodeDto | undefined {
  const targetUuids = new Set((wf.edges || []).map(e => e.targetNodeUuid));
  const byComponent = (wf.nodes || []).find(
    n => n.wfComponent?.name === 'Start'
      || String(n.workflowComponentId) === '1',
  );
  if (byComponent)
    return byComponent;
  const candidates = (wf.nodes || []).filter(n => !targetUuids.has(n.uuid));
  return (
    candidates.find(n => Array.isArray(n.inputConfig?.user_inputs) && n.inputConfig.user_inputs.length > 0)
    || candidates[0]
  );
}

function extractStartInputs(startNode: WorkflowNodeDto | undefined): WfNodeInputDef[] {
  if (!startNode?.inputConfig?.user_inputs)
    return [];
  return (startNode.inputConfig.user_inputs as any[]).map(u => ({
    uuid: u.uuid,
    name: u.name,
    title: u.title,
    type: u.type,
    required: u.required,
    limit: u.limit,
  }));
}

function defaultInputsFromDefs(defs: WfNodeInputDef[]): WfNodeInput[] {
  return defs.map(d => ({
    uuid: d.uuid,
    name: d.name,
    content: { title: d.title, value: null, type: d.type },
    required: d.required,
  }));
}

/**
 * 是否需要弹表单：只有当存在非文本输入（type !== 1）或多个输入时。
 */
function needForm(defs: WfNodeInputDef[]): boolean {
  if (defs.length === 0)
    return false;
  if (defs.length > 1)
    return true;
  return defs[0].type !== 1;
}

async function onCardClick(wf: WorkflowResp) {
  try {
    const res = await getWorkflowDetail(wf.uuid);
    // 后端返回 R<WorkflowResp>，hook-fetch 不解包，需取 data
    const detail = ((res as any)?.data ?? res) as WorkflowResp;
    const startNode = findStartNode(detail);
    const startInputs = extractStartInputs(startNode);

    if (needForm(startInputs)) {
      // 复杂输入：弹表单收集
      pendingWorkflow.value = detail;
      pendingStartInputs.value = startInputs;
      formValues.value = defaultInputsFromDefs(startInputs);
      formVisible.value = true;
      return;
    }

    // 单文本输入或无输入：选中工作流并回主页
    await selectWorkflow(detail, startInputs, defaultInputsFromDefs(startInputs));
  }
  catch (e) {
    console.error('进入工作流失败', e);
    ElMessage.error('进入工作流失败');
  }
}

async function selectAgent(agent: AgentVO) {
  if (!userStore.token) {
    ElMessage.warning('请先登录');
    return;
  }
  chatStore.clearCurrentWorkflow();
  agentStore.setCurrentAgentInfo(agent);
  await router.push({ name: 'chat' });
}

async function submitForm() {
  // 校验必填
  const missing = formValues.value.some(i => i.required && (i.content.value === null || i.content.value === ''));
  if (missing) {
    ElMessage.warning('请填写所有必填参数');
    return;
  }
  formLoading.value = true;
  try {
    await selectWorkflow(
      pendingWorkflow.value!,
      pendingStartInputs.value,
      // 表单提交的值克隆一份（文本输入的 value 留给每轮聊天覆盖）
      formValues.value.map(i => ({ ...i, content: { ...i.content } })),
    );
    formVisible.value = false;
  }
  finally {
    formLoading.value = false;
  }
}

/**
 * 选中工作流：置入全局 currentWorkflow 并回主页（对话框居中）。
 * 不直接进入对话页；用户在主页输入后提交，chatWithId 据此走工作流模式。
 */
async function selectWorkflow(
  wf: WorkflowResp,
  startInputs: WfNodeInputDef[],
  inputs: WfNodeInput[],
) {
  if (!userStore.token) {
    ElMessage.warning('请先登录');
    return;
  }
  chatStore.setCurrentWorkflow({
    uuid: wf.uuid,
    title: wf.title,
    startInputs,
    inputs,
  });
  agentStore.clearCurrentAgentInfo();
  // 回到主页（居中对话框），由用户输入后触发对话
  router.push({ name: 'chat' });
}
</script>

<template>
  <div class="app-market">
    <div class="market-header">
      <h2 class="market-title">
        应用市场
      </h2>
      <p class="market-subtitle">
        选择智能体或工作流应用，进入对话即可使用
      </p>
    </div>

    <div v-loading="loading" class="market-grid">
      <el-empty v-if="!loading && applications.length === 0" description="暂无可用应用" />
      <div
        v-for="app in applications"
        :key="`${app.type}-${app.type === 'agent' ? app.data.id : app.data.uuid}`"
        class="wf-card"
        @click="app.type === 'agent' ? selectAgent(app.data) : onCardClick(app.data)"
      >
        <div class="wf-card-icon">
          <el-icon :size="28">
            <Cpu />
          </el-icon>
        </div>
        <div class="wf-card-body">
          <div class="wf-card-title">
            {{ app.type === 'agent' ? (app.data.agentDescribe || app.data.agentName) : app.data.title }}
          </div>
          <div class="wf-card-desc">
            {{ app.type === 'agent' ? '智能体应用' : (app.data.remark || '暂无描述') }}
          </div>
        </div>
        <div class="wf-card-footer">
          <el-tag class="app-type-tag" size="small" effect="plain">
            {{ app.type === 'agent' ? '智能体' : '工作流' }}
          </el-tag>
          <el-button type="primary" size="small" round>
            开始使用
          </el-button>
        </div>
      </div>
    </div>

    <!-- 复杂输入表单 -->
    <el-dialog v-model="formVisible" title="填写工作流输入" width="520px">
      <el-form label-position="top">
        <el-form-item
          v-for="item in formValues"
          :key="item.name"
          :label="`${item.content.title || item.name}${item.required ? ' *' : ''}`"
        >
          <el-input
            v-if="item.content.type === 1"
            v-model="item.content.value"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="请输入"
          />
          <el-input-number
            v-else-if="item.content.type === 2"
            v-model="item.content.value"
            class="w-full"
          />
          <el-switch
            v-else-if="item.content.type === 5"
            v-model="item.content.value"
          />
          <el-alert
            v-else
            type="warning"
            :closable="false"
            title="该参数类型暂不支持在应用市场填写，请在管理端运行"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="formLoading" @click="submitForm">
          进入对话
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.app-market {
  padding: 16px 24px;
  height: 100%;
  overflow-y: auto;
  background-color: var(--el-bg-color, #fff);
  border-radius: 12px;
}

.market-header {
  margin-bottom: 20px;

  .market-title {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 4px;
  }

  .market-subtitle {
    font-size: 13px;
    color: #909399;
    margin: 0;
  }
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.wf-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.12);
    transform: translateY(-2px);
  }

  .wf-card-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .wf-card-body {
    flex: 1;
    margin-bottom: 12px;
  }

  .wf-card-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .app-type-tag {
    flex: none;
  }

  .wf-card-desc {
    font-size: 13px;
    color: #909399;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 39px;
  }

  .wf-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #f0f0f0;
    padding-top: 10px;

  }
}
</style>

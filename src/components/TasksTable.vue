<script setup lang="ts">
import { ref, reactive, onMounted, watch, h } from 'vue';
import { storeToRefs } from 'pinia';
import {
  NDataTable,
  NTag,
  NButton,
  NSpace,
  NEmpty,
  NInput,
  type DataTableColumns,
  type DataTableRowKey,
  type DataTableSortState
} from 'naive-ui';
import type { Task } from '@/types/task';
import { useTaskStore } from '@/stores/tasks';

import BaseButton from '@/components/base/BaseButton.vue';
import CreateTaskModal from '@/components/CreateTaskModal.vue';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue';
import EditTaskModal from '@/components/EditTaskModal.vue';

const taskStore = useTaskStore();
const { isLoading, error, searchQuery, checkedRowKeys, tasks, totalCount } = storeToRefs(taskStore);

const isCreateModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isBulkDeleteModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isActionLoading = ref(false);
const selectedTask = ref<Task | null>(null);
const currentOrdering = ref<string>('-created_at');

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [5, 10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
    loadServerTasks();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadServerTasks();
  }
});

watch(totalCount, (newTotal) => {
  pagination.itemCount = newTotal;
});

watch(searchQuery, () => {
  pagination.page = 1;
  loadServerTasks();
});

function loadServerTasks() {
  taskStore.fetchTasks({
    page: pagination.page,
    page_size: pagination.pageSize,
    search: searchQuery.value,
    ordering: currentOrdering.value
  });
}

function handleSorterChange(options: DataTableSortState | null) {
  if (!options || !options.order) {
    currentOrdering.value = '-created_at';
  } else {
    currentOrdering.value =
      options.order === 'descend' ? `-${options.columnKey}` : `${options.columnKey}`;
  }
  pagination.page = 1;
  loadServerTasks();
}

async function handleCreateTask(newTaskData: {
  title: string;
  description: string;
  priority: Task['priority'];
}) {
  isActionLoading.value = true;
  try {
    await taskStore.createTask({
      title: newTaskData.title.trim(),
      description: newTaskData.description.trim(),
      priority: newTaskData.priority
    });
    isCreateModalOpen.value = false;
    loadServerTasks();
  } catch {
  } finally {
    isActionLoading.value = false;
  }
}

function openEditModal(task: Task) {
  selectedTask.value = task;
  isEditModalOpen.value = true;
}

async function confirmEdit(payload: Partial<Task>) {
  if (!selectedTask.value) return;
  isActionLoading.value = true;
  try {
    await taskStore.updateTask(selectedTask.value.id, payload);
    isEditModalOpen.value = false;
    selectedTask.value = null;
    loadServerTasks();
  } catch {
  } finally {
    isActionLoading.value = false;
  }
}

function openDeleteModal(task: Task) {
  selectedTask.value = task;
  isDeleteModalOpen.value = true;
}

async function confirmDelete() {
  if (!selectedTask.value) return;
  isActionLoading.value = true;
  try {
    await taskStore.deleteTask(selectedTask.value.id);
    isDeleteModalOpen.value = false;
    selectedTask.value = null;
    loadServerTasks();
  } catch {
  } finally {
    isActionLoading.value = false;
  }
}

async function confirmBulkDelete() {
  isActionLoading.value = true;
  try {
    await taskStore.bulkDeleteTasks();
    isBulkDeleteModalOpen.value = false;
    loadServerTasks();
  } catch {
  } finally {
    isActionLoading.value = false;
  }
}

async function handleSmartBulkToggle() {
  const selectedTasks = tasks.value.filter((t) => checkedRowKeys.value.includes(t.id));
  const areAllCompleted = selectedTasks.length > 0 && selectedTasks.every((t) => t.completed);

  isActionLoading.value = true;
  try {
    await taskStore.bulkUpdateTaskStatus(!areAllCompleted);
    loadServerTasks();
  } catch {
  } finally {
    isActionLoading.value = false;
  }
}

function handleCheck(keys: DataTableRowKey[]) {
  checkedRowKeys.value = keys;
}

const columns: DataTableColumns<Task> = [
  { type: 'selection' },
  {
    title: 'Title',
    key: 'title',
    ellipsis: { tooltip: true },
    sorter: true
  },
  {
    title: 'Priority',
    key: 'priority',
    sorter: true,
    render(row) {
      const typeMap = { low: 'success', medium: 'warning', high: 'error' } as const;
      return h(
        NTag,
        { type: typeMap[row.priority], round: true },
        { default: () => row.priority.toUpperCase() }
      );
    }
  },
  {
    title: 'Status',
    key: 'completed',
    sorter: true,
    render(row) {
      return h(
        NTag,
        {
          type: row.completed ? 'success' : 'default',
          size: 'small',
          round: true,
          bordered: false,
          style: {
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.2s ease'
          },
          onClick: async () => {
            await taskStore.toggleTaskStatus(row);
            loadServerTasks();
          }
        },
        {
          default: () => (row.completed ? '✓ Completed' : '○ In Progress')
        }
      );
    }
  },
  {
    title: 'Created At',
    key: 'created_at',
    defaultSortOrder: 'descend',
    sorter: true,
    render(row) {
      return new Date(row.created_at).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    render(row) {
      return h(NSpace, {}, () => [
        h(NButton, { size: 'small', onClick: () => openEditModal(row) }, { default: () => 'Edit' }),
        h(
          NButton,
          { size: 'small', type: 'error', secondary: true, onClick: () => openDeleteModal(row) },
          { default: () => 'Delete' }
        )
      ]);
    }
  }
];

onMounted(() => {
  loadServerTasks();
});

defineExpose({
  fetchTasks: loadServerTasks
});
</script>

<template>
  <div class="table-container">
    <div class="table-toolbar">
      <NInput
        v-model:value="searchQuery"
        placeholder="Search tasks by title or description..."
        clearable
        class="search-input"
      />

      <div class="toolbar-actions">
        <Transition name="fade">
          <div v-if="checkedRowKeys.length > 0" class="bulk-actions">
            <span class="selected-count"> Selected {{ checkedRowKeys.length }} task(s) </span>
            <NSpace align="center">
              <NButton size="small" type="primary" secondary @click="handleSmartBulkToggle">
                Toggle Status
              </NButton>
              <NButton size="small" type="error" @click="isBulkDeleteModalOpen = true">
                Delete Selected
              </NButton>
            </NSpace>
          </div>
        </Transition>

        <div class="header-actions">
          <BaseButton variant="primary" @click="isCreateModalOpen = true">
            + Create Task
          </BaseButton>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-banner">
      <p>{{ error }}</p>
      <NButton type="primary" size="small" @click="loadServerTasks">Retry</NButton>
    </div>

    <NDataTable
      v-else
      remote
      :loading="isLoading"
      :columns="columns"
      :data="tasks"
      :pagination="pagination"
      :row-key="(row) => row.id"
      :checked-row-keys="checkedRowKeys"
      @update:checked-row-keys="handleCheck"
      @update:sorter="handleSorterChange"
    >
      <template #empty>
        <NEmpty description="No tasks found" />
      </template>
    </NDataTable>

    <CreateTaskModal
      :open="isCreateModalOpen"
      :loading="isActionLoading"
      @close="isCreateModalOpen = false"
      @create="handleCreateTask"
    />

    <ConfirmDeleteModal
      :open="isDeleteModalOpen"
      :task-title="selectedTask?.title || ''"
      :loading="isActionLoading"
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
    />

    <ConfirmDeleteModal
      :open="isBulkDeleteModalOpen"
      :task-title="`${checkedRowKeys.length} selected tasks`"
      :loading="isActionLoading"
      @close="isBulkDeleteModalOpen = false"
      @confirm="confirmBulkDelete"
    />

    <EditTaskModal
      :open="isEditModalOpen"
      :task="selectedTask"
      :loading="isActionLoading"
      @close="isEditModalOpen = false"
      @submit="confirmEdit"
    />
  </div>
</template>

<style scoped>
.table-container {
  width: 100%;
  margin-top: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  min-height: 40px;
}

.search-input {
  max-width: 360px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  height: 40px;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 0 12px;
  height: 40px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.selected-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1ed760;
  white-space: nowrap;
}

.error-banner {
  background-color: rgba(233, 20, 41, 0.15);
  border: 1px solid rgba(233, 20, 41, 0.4);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #ff4d5e;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>

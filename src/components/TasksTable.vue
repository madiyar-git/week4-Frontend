<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
import { storeToRefs } from 'pinia';
import {
  NDataTable,
  NTag,
  NButton,
  NSpace,
  NEmpty,
  NInput,
  type DataTableColumns,
  type DataTableRowKey
} from 'naive-ui';
import type { Task } from '@/types/task';
import { useTaskStore } from '@/stores/tasks';

import BaseButton from '@/components/base/BaseButton.vue';
import CreateTaskModal from '@/components/CreateTaskModal.vue';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue';
import EditTaskModal from '@/components/EditTaskModal.vue';

const taskStore = useTaskStore();
const { isLoading, error, searchQuery, checkedRowKeys, filteredTasks } = storeToRefs(taskStore);

const isCreateModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isBulkDeleteModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isActionLoading = ref(false);
const selectedTask = ref<Task | null>(null);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [5, 10, 20, 50]
});

const priorityWeight: Record<Task['priority'], number> = {
  low: 1,
  medium: 2,
  high: 3
};

function fetchTasks() {
  taskStore.fetchTasks();
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
  } catch {
  } finally {
    isActionLoading.value = false;
  }
}

async function handleBulkToggleStatus(completed: boolean) {
  isActionLoading.value = true;
  try {
    await taskStore.bulkUpdateTaskStatus(completed);
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
    sorter: 'default'
  },
  {
    title: 'Priority',
    key: 'priority',
    sorter: (row1, row2) => priorityWeight[row1.priority] - priorityWeight[row2.priority],
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
    sorter: (row1, row2) => Number(row1.completed) - Number(row2.completed),
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
          onClick: () => taskStore.toggleTaskStatus(row)
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
    sorter: (row1, row2) =>
      new Date(row1.created_at).getTime() - new Date(row2.created_at).getTime(),
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
  fetchTasks();
});

defineExpose({
  fetchTasks
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

      <div v-if="checkedRowKeys.length > 0" class="bulk-actions">
        <span class="selected-count"> Selected {{ checkedRowKeys.length }} task(s) </span>
        <NSpace align="center">
          <NButton size="small" type="success" secondary @click="handleBulkToggleStatus(true)">
            Mark Done
          </NButton>
          <NButton size="small" type="warning" secondary @click="handleBulkToggleStatus(false)">
            Mark Pending
          </NButton>
          <NButton size="small" type="error" @click="isBulkDeleteModalOpen = true">
            Delete Selected
          </NButton>
        </NSpace>
      </div>

      <div class="header-actions">
        <BaseButton variant="primary" @click="isCreateModalOpen = true"> + Create Task </BaseButton>
      </div>
    </div>

    <div v-if="error" class="error-banner">
      <p>{{ error }}</p>
      <NButton type="primary" size="small" @click="fetchTasks">Retry</NButton>
    </div>

    <NDataTable
      v-else
      :loading="isLoading"
      :columns="columns"
      :data="filteredTasks"
      :pagination="pagination"
      :row-key="(row) => row.id"
      :checked-row-keys="checkedRowKeys"
      @update:checked-row-keys="handleCheck"
    >
      <template #empty>
        <NEmpty description="No tasks found" />
      </template>
    </NDataTable>

    <!-- Modals -->
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
  flex-wrap: wrap;
}

.search-input {
  max-width: 360px;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.selected-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1ed760;
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
</style>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue';
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
import { taskApi } from '@/api/tasks';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue';
import EditTaskModal from '@/components/EditTaskModal.vue';

const loading = ref(false);
const error = ref<string | null>(null);
const tasks = ref<Task[]>([]);

const searchQuery = ref('');

const checkedRowKeys = ref<DataTableRowKey[]>([]);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [5, 10, 20, 50]
});

const isDeleteModalOpen = ref(false);
const isBulkDeleteModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedTask = ref<Task | null>(null);
const isActionLoading = ref(false);

const priorityWeight: Record<Task['priority'], number> = {
  low: 1,
  medium: 2,
  high: 3
};

const columns: DataTableColumns<Task> = [
  {
    type: 'selection'
  },
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
          onClick: () => toggleTaskStatus(row)
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

const filteredTasks = computed(() => {
  if (!searchQuery.value.trim()) return tasks.value;
  const q = searchQuery.value.toLowerCase().trim();
  return tasks.value.filter((task) => {
    const matchTitle = task.title.toLowerCase().includes(q);
    const matchDesc = task.description?.toLowerCase().includes(q) ?? false;
    return matchTitle || matchDesc;
  });
});

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

async function toggleTaskStatus(task: Task) {
  try {
    const updatedCompleted = !task.completed;

    await taskApi.update(task.id, { completed: updatedCompleted });

    await fetchTasks();
  } catch (err: unknown) {
    alert(`Failed to update status: ${getErrorMessage(err)}`);
  }
}

async function fetchTasks() {
  loading.value = true;
  error.value = null;

  try {
    const response = await taskApi.getAll();
    tasks.value = response.data;
  } catch (err: unknown) {
    error.value = getErrorMessage(err) || 'Failed to load tasks.';
  } finally {
    loading.value = false;
  }
}

function handleCheck(keys: DataTableRowKey[]) {
  checkedRowKeys.value = keys;
}

async function confirmBulkDelete() {
  if (checkedRowKeys.value.length === 0) return;
  isActionLoading.value = true;

  try {
    await Promise.all(checkedRowKeys.value.map((id) => taskApi.delete(Number(id))));
    checkedRowKeys.value = [];
    isBulkDeleteModalOpen.value = false;
    await fetchTasks();
  } catch (err: unknown) {
    alert(`Bulk delete failed: ${getErrorMessage(err)}`);
  } finally {
    isActionLoading.value = false;
  }
}

async function handleBulkToggleStatus(completed: boolean) {
  if (checkedRowKeys.value.length === 0) return;
  isActionLoading.value = true;

  try {
    await Promise.all(checkedRowKeys.value.map((id) => taskApi.update(Number(id), { completed })));
    checkedRowKeys.value = [];
    await fetchTasks();
  } catch (err: unknown) {
    alert(`Bulk status update failed: ${getErrorMessage(err)}`);
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
    await taskApi.delete(selectedTask.value.id);
    isDeleteModalOpen.value = false;
    selectedTask.value = null;
    await fetchTasks();
  } catch (err: unknown) {
    alert(`Delete failed: ${getErrorMessage(err)}`);
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
    await taskApi.update(selectedTask.value.id, payload);
    isEditModalOpen.value = false;
    selectedTask.value = null;
    await fetchTasks();
  } catch (err: unknown) {
    alert(`Update failed: ${getErrorMessage(err)}`);
  } finally {
    isActionLoading.value = false;
  }
}

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
    </div>

    <div v-if="error" class="error-banner">
      <p>{{ error }}</p>
      <NButton type="primary" size="small" @click="fetchTasks">Retry</NButton>
    </div>

    <NDataTable
      v-else
      :loading="loading"
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

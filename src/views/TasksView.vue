<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import { storeToRefs } from 'pinia';
import { useApi } from '@/composables/useApi';
import type { Task } from '../types/task';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import TaskList from '../components/TaskList.vue';
import { usePagination } from '@/composables/usePagination';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue';
import { useSaveInClipBoard } from '@/composables/useSaveInClipBoard.ts';
import { taskApi } from '@/api/tasks.ts';
import { type Result, isError } from '@/types/result.ts';
import EditTaskModal from '@/components/EditTaskModal.vue';
import CreateTaskModal from '@/components/CreateTaskModal.vue';

const tasksStore = useTaskStore();
const { tasks } = storeToRefs(tasksStore);

const {
  loading: isFetchLoading,
  error: fetchError,
  execute: fetchExecute
} = useApi<Result<Task[]>>();
const { loading: isCreateLoading, execute: createExecute } = useApi<Task>();
const { loading: isActionLoading, error: actionError, execute: actionExecute } = useApi<unknown>();

const searchInput = ref<string>('');

// [ ] Поиск задания по названию
const filteredTasks = computed(() => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return tasks.value;

  return tasks.value.filter((task) => task.title.toLowerCase().includes(query));
});

const { pagedItems, currentPage, totalPages, next, prev } = usePagination(filteredTasks, 5);

watch(searchInput, () => {
  currentPage.value = 1;
});

const isCreateModalOpen = ref(false);
const isEditModalOpen = ref<boolean>(false);
const taskToEdit = ref<Task | null>(null);

// [ ] Изменение задания через модалку
function handleEditTask(task: Task): void {
  taskToEdit.value = task;
  isEditModalOpen.value = true;
}

async function confirmEditTask(payload: Partial<Task>): Promise<void> {
  if (!taskToEdit.value) return;
  const targetId = taskToEdit.value.id;

  await actionExecute(() => taskApi.update(targetId, payload));

  if (!actionError.value) {
    const index = tasks.value.findIndex((t) => t.id === targetId);
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...payload } as Task;
    }
    closeEditModal();
  } else {
    alert(`Failed to update task: ${actionError.value}`);
  }
}

function closeEditModal(): void {
  isEditModalOpen.value = false;
  taskToEdit.value = null;
}

const isDeleteModalOpen = ref<boolean>(false);
const taskToDelete = ref<Task | null>(null);

const isGlobalLoading = computed(
  () => isFetchLoading.value || isCreateLoading.value || isActionLoading.value
);

// Загрузка заданий
async function loadTasks(): Promise<void> {
  const result = await fetchExecute(async () => {
    const response = await taskApi.getAll();
    return { ok: true, data: response.data };
  });

  if (result) {
    if (isError(result)) {
      alert(result.error);
    } else {
      tasks.value = result.data;
    }
  }
}

// [ ] Создание задания
async function handleCreateTask(newTaskData: {
  title: string;
  description: string;
  priority: Task['priority'];
}) {
  if (isGlobalLoading.value) return;
  const result = await createExecute(async () => {
    const res = await taskApi.create({
      title: newTaskData.title.trim(),
      description: newTaskData.description.trim(),
      priority: newTaskData.priority
    });
    return res.data;
  });

  if (result) {
    tasks.value.unshift(result);
    currentPage.value = 1;
  }
}

// [ ] Изменение статуса задания
async function handleToggleCompleted(id: number, fields: Partial<Task>): Promise<void> {
  await actionExecute(() => taskApi.update(id, fields));

  if (actionError.value) {
    const taskIndex = tasks.value.findIndex((t) => t.id === id);
    const targetTask = tasks.value[taskIndex];

    if (targetTask && fields.completed !== undefined) {
      targetTask.completed = !fields.completed;
    }

    alert(`Failed to update task status: ${actionError.value}`);
  }
}

// [ ] Удаление задания через модалку
function handleDeleteTask(id: number): void {
  const foundTask = tasks.value.find((t) => t.id === id);
  if (foundTask) {
    taskToDelete.value = foundTask;
    isDeleteModalOpen.value = true;
  }
}

async function confirmDeleteTask(): Promise<void> {
  if (!taskToDelete.value) return;

  const targetId = taskToDelete.value.id;

  await actionExecute(() => taskApi.delete(targetId));

  if (!actionError.value) {
    tasks.value = tasks.value.filter((t) => t.id !== targetId);
    closeDeleteModal();
  } else {
    alert(`Delete error: ${actionError.value}`);
  }
}

function closeDeleteModal(): void {
  isDeleteModalOpen.value = false;
  taskToDelete.value = null;
}

// [ ] Групповые действия
async function bulkAction(
  actionName: 'toggle_all' | 'clear_completed' | 'clear_all'
): Promise<void> {
  if (actionName === 'toggle_all') {
    const areAllCompleted = tasks.value.every((t) => t.completed);
    const newStatus = !areAllCompleted;

    const promises = tasks.value.map((t) =>
      actionExecute(() => taskApi.update(t.id, { completed: newStatus }))
    );

    await Promise.all(promises);
    await loadTasks();
  } else if (actionName === 'clear_completed') {
    const completedTasks = tasks.value.filter((t) => t.completed);
    const promises = completedTasks.map((t) => actionExecute(() => taskApi.delete(t.id)));

    await Promise.all(promises);
    await loadTasks();
  } else if (actionName === 'clear_all') {
    const promises = tasks.value.map((t) => actionExecute(() => taskApi.delete(t.id)));

    await Promise.all(promises);
    await loadTasks();
  }
}

onMounted(() => {
  loadTasks();
});
</script>

<template>
  <main class="app-main">
    <div class="tasks-container">
      <h2 @click="useSaveInClipBoard('My Tasks')">My Tasks</h2>
      <n-button type="primary" @click="isCreateModalOpen = true"> + Create Task </n-button>

      <div class="tasks-page">
        <CreateTaskModal
          :open="isCreateModalOpen"
          :loading="isCreateLoading"
          @close="isCreateModalOpen = false"
          @create="handleCreateTask"
        />

        <hr class="divider" />
        <BaseInput v-model="searchInput" type="text" placeholder="Search" />

        <div v-if="isFetchLoading" class="spinner-container">
          <div class="spinner"></div>
          <p>Loading tasks from server...</p>
        </div>

        <div v-else-if="fetchError" class="error-banner">
          <p>Error: {{ fetchError }}</p>
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            style="width: 60%"
            @click="loadTasks"
          >
            Retry
          </BaseButton>
        </div>

        <p v-if="!isFetchLoading && tasks.length === 0" class="empty-text">
          No tasks found. Create your first task!
        </p>

        <TaskList
          v-else-if="tasks.length > 0"
          v-model="pagedItems"
          @delete="handleDeleteTask"
          @edit="handleEditTask"
          @update="handleToggleCompleted"
          @bulk-action="bulkAction"
        />

        <EditTaskModal
          :open="isEditModalOpen"
          :task="taskToEdit"
          :loading="isActionLoading"
          @close="closeEditModal"
          @submit="confirmEditTask"
        />

        <div class="pagination-controls">
          <BaseButton
            variant="secondary"
            :disabled="currentPage === 1 || isGlobalLoading"
            @click="prev"
          >
            Prev
          </BaseButton>

          <span class="pagination-indicator"> {{ currentPage }} / {{ totalPages }} </span>

          <BaseButton
            variant="secondary"
            :disabled="currentPage === totalPages || isGlobalLoading"
            @click="next"
          >
            Next
          </BaseButton>
        </div>
      </div>
    </div>
  </main>

  <ConfirmDeleteModal
    :open="isDeleteModalOpen"
    :task-title="taskToDelete?.title || ''"
    :loading="isActionLoading"
    @close="closeDeleteModal"
    @confirm="confirmDeleteTask"
  />
</template>

<style scoped>
.app-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
}

.tasks-container {
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

h2 {
  margin: 0 0 24px 0;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: #ffffff;
}

.divider {
  border: 0;
  border-top: 1px solid #282828;
  margin: 25px 0;
}

.empty-text {
  color: #b3b3b3;
  text-align: center;
  font-size: 0.95rem;
  padding: 20px 0;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #1db954;
  font-size: 0.95rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #282828;
  border-top: 2px solid #1db954;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  background-color: #4a1d24;
  border: 1px solid #ff4d4f;
  border-radius: 8px;
  padding: 24px;
  color: #feb2b2;
  text-align: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-banner p {
  margin: 0;
  font-size: 0.95rem;
}

.pagination-controls {
  display: flex;
  margin-top: 1vw;
  justify-content: center;
  align-items: center;
  gap: 1vw;
}

.pagination-indicator {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
}
</style>

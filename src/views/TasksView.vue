<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useTaskStore } from '@/stores/tasks';
import { storeToRefs } from 'pinia';
import { useApi } from '@/composables/useApi';
import type { Task } from '../types/task';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import TaskList from '../components/TaskList.vue';
import { usePagination } from '@/composables/usePagination';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.vue';
import { useSaveInClipBoard } from '@/composables/useSaveInClipBoard.ts';
import { useForm, type Errors } from '@/composables/useForm.ts';
import { taskApi } from '@/api/tasks.ts';
import { type Result, isError } from '@/types/result.ts';
import EditTaskModal from '@/components/EditTaskModal.vue';

interface TaskFormFields {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const validateTaskForm = (values: TaskFormFields): Errors<TaskFormFields> => {
  const errors: Errors<TaskFormFields> = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required';
  } else if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 symbols';
  }
  return errors;
};

const tasksStore = useTaskStore();
const { tasks } = storeToRefs(tasksStore);

const {
  loading: isFetchLoading,
  error: fetchError,
  execute: fetchExecute
} = useApi<Result<Task[]>>();
const { loading: isCreateLoading, error: createError, execute: createExecute } = useApi<Task>();
const { loading: isActionLoading, error: actionError, execute: actionExecute } = useApi<unknown>();

const searchInput = ref<string>('');

const filteredTasks = computed(() => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return tasks.value;

  return tasks.value.filter((task) => task.title.toLowerCase().includes(query));
});

const { pagedItems, currentPage, totalPages, next, prev } = usePagination(filteredTasks, 5);

watch(searchInput, () => {
  currentPage.value = 1;
});

const isEditModalOpen = ref<boolean>(false);
const taskToEdit = ref<Task | null>(null);

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

const { values, errors, handleSubmit, reset } = useForm<TaskFormFields>(
  {
    title: '',
    description: '',
    priority: 'medium'
  },
  validateTaskForm
);
const getErrorString = (err: string | string[] | null | undefined): string | undefined => {
  if (!err) return undefined;
  return Array.isArray(err) ? err[0] : err;
};

const isDeleteModalOpen = ref<boolean>(false);
const taskToDelete = ref<Task | null>(null);

const isGlobalLoading = computed(
  () => isFetchLoading.value || isCreateLoading.value || isActionLoading.value
);

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

const onSubmit = handleSubmit(async (fromData) => {
  if (isGlobalLoading.value) return;
  const result = await createExecute(async () => {
    const res = await taskApi.create({
      title: fromData.title.trim(),
      description: fromData.description.trim(),
      priority: fromData.priority
    });
    return res.data;
  });

  if (result) {
    tasks.value.unshift(result);
    reset();
    currentPage.value = 1;
  }
});

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
      <div class="tasks-page">
        <BaseCard class="task-form-card">
          <template #header>
            <h3>New Task</h3>
          </template>

          <form @submit.prevent="onSubmit" class="create-task-form">
            <div class="form-group">
              <BaseInput
                v-model="values.title"
                type="text"
                label="Title"
                placeholder="Task title (min 3 symbols)..."
                :disabled="isGlobalLoading"
                :error="getErrorString(errors.title) || createError || undefined"
                required
              />
            </div>

            <div class="form-group">
              <BaseInput
                v-model="values.description"
                label="Description"
                placeholder="Description (optional)..."
                :disabled="isGlobalLoading"
              />
            </div>

            <div class="form-group">
              <label for="priority">Priority</label>
              <select
                id="priority"
                v-model="values.priority"
                :class="values.priority"
                :disabled="isGlobalLoading"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              :disabled="isGlobalLoading"
              :loading="isCreateLoading"
              style="width: 100%; margin-top: 12px"
            >
              Create New Task
            </BaseButton>
          </form>
        </BaseCard>

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

.task-form-card {
  margin-bottom: 25px;
}

h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1db954;
}

.create-task-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group:last-of-type {
  margin-bottom: 20px;
}

label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff;
  text-align: left;
}

select {
  background-color: #242424;
  border: 1px solid #727272;
  color: #ffffff;
  padding: 12px;
  border-radius: 4px;
  font-size: 0.95rem;
  box-sizing: border-box;
  cursor: pointer;
  font-family: sans-serif;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

select:focus {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  outline: none;
}

select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.low {
  background-color: rgba(29, 185, 84, 0.12);
  color: #1ed760;
  border-color: rgba(29, 185, 84, 0.3);
}

.medium {
  background-color: rgba(255, 170, 0, 0.12);
  color: #ffb703;
  border-color: rgba(255, 170, 0, 0.3);
}

.high {
  background-color: rgba(233, 20, 41, 0.15);
  color: #ff4d5e;
  border-color: rgba(233, 20, 41, 0.35);
}

select option {
  background-color: #242424;
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

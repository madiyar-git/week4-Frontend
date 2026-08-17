import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DataTableRowKey } from 'naive-ui';
import type { Task } from '@/types/task';
import { taskApi, type CreateTaskDto, type UpdateTaskDto, type TaskQueryParams } from '@/api/tasks';
import { useNotify } from '@/composables/useNotify';
import { formatErrorMessage } from '@/api/errorHandler';

export const useTaskStore = defineStore('tasks', () => {
  const notify = useNotify();
  const tasks = ref<Task[]>([]);
  const totalCount = ref<number>(0);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const searchQuery = ref<string>('');
  const checkedRowKeys = ref<DataTableRowKey[]>([]);

  const filteredTasks = computed(() => {
    if (!searchQuery.value.trim()) return tasks.value;
    const q = searchQuery.value.toLowerCase().trim();
    return tasks.value.filter((task) => {
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) ?? false;
      return matchTitle || matchDesc;
    });
  });

  async function fetchTasks(params?: TaskQueryParams): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await taskApi.getAll(params);
      tasks.value = response.data.results;
      totalCount.value = response.data.count;
    } catch (err) {
      const message = formatErrorMessage(err);
      error.value = message;
      notify.error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function createTask(payload: CreateTaskDto): Promise<void> {
    try {
      const response = await taskApi.create(payload);
      tasks.value = [response.data, ...tasks.value];
      notify.success('Task created successfully!');
    } catch (err) {
      const message = formatErrorMessage(err);
      notify.error(message);
      throw new Error(message);
    }
  }

  async function updateTask(id: number, patch: UpdateTaskDto): Promise<void> {
    try {
      const response = await taskApi.update(id, patch);
      tasks.value = tasks.value.map((t) => (t.id === id ? response.data : t));
      notify.success('Task updated successfully!');
    } catch (err) {
      const message = formatErrorMessage(err);
      notify.error(message);
      throw new Error(message);
    }
  }

  async function toggleTaskStatus(task: Task): Promise<void> {
    const updatedStatus = !task.completed;
    try {
      const response = await taskApi.update(task.id, { completed: updatedStatus });
      tasks.value = tasks.value.map((t) => (t.id === task.id ? response.data : t));
      notify.success(`Status updated for "${task.title}"`);
    } catch (err) {
      const message = formatErrorMessage(err);
      notify.error(message);
    }
  }

  async function deleteTask(id: number): Promise<void> {
    try {
      await taskApi.delete(id);
      tasks.value = tasks.value.filter((t) => t.id !== id);
      notify.success('Task deleted successfully!');
    } catch (err) {
      const message = formatErrorMessage(err);
      notify.error(message);
      throw new Error(message);
    }
  }

  async function bulkDeleteTasks(): Promise<void> {
    if (checkedRowKeys.value.length === 0) return;
    isLoading.value = true;
    const count = checkedRowKeys.value.length;

    try {
      await Promise.all(checkedRowKeys.value.map((id) => taskApi.delete(Number(id))));
      const idsSet = new Set(checkedRowKeys.value.map(Number));
      tasks.value = tasks.value.filter((t) => !idsSet.has(t.id));
      checkedRowKeys.value = [];
      notify.success(`Deleted ${count} task(s)!`);
    } catch (err) {
      const message = formatErrorMessage(err);
      notify.error(message);
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function bulkUpdateTaskStatus(completed: boolean): Promise<void> {
    if (checkedRowKeys.value.length === 0) return;
    isLoading.value = true;

    try {
      await Promise.all(
        checkedRowKeys.value.map((id) => taskApi.update(Number(id), { completed }))
      );
      const idsSet = new Set(checkedRowKeys.value.map(Number));
      tasks.value = tasks.value.map((t) => (idsSet.has(t.id) ? { ...t, completed } : t));
      notify.success(`Status updated for ${checkedRowKeys.value.length} task(s)!`);
      checkedRowKeys.value = [];
    } catch (err) {
      const message = formatErrorMessage(err);
      notify.error(message);
    } finally {
      isLoading.value = false;
    }
  }

  function reset(): void {
    tasks.value = [];
    totalCount.value = 0;
    error.value = null;
    isLoading.value = false;
    searchQuery.value = '';
    checkedRowKeys.value = [];
  }

  return {
    tasks,
    totalCount,
    isLoading,
    error,
    searchQuery,
    checkedRowKeys,
    filteredTasks,
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    bulkDeleteTasks,
    bulkUpdateTaskStatus,
    reset
  };
});

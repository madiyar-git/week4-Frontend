import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { Task } from '@/types/task'
import type { AxiosError } from 'axios'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function fetchTasks(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await api.get<Task[]>('/tasks/')
      tasks.value = data
    } catch (err) {
      const axiosError = err as AxiosError
      error.value = axiosError.response?.status === 401 
        ? 'Session expired. Please log in again.' 
        : 'Failed to load tasks.'
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(payload: Omit<Task, 'id' | 'owner' | 'created_at'>): Promise<void> {
    try {
      const { data } = await api.post<Task>('/tasks/', payload)
      tasks.value = [data, ...tasks.value]
    } catch (err) {
      const systemError = err as Error
      throw new Error(systemError.message || 'Failed to create task.')
    }
  }

  async function updateTask(id: number, patch: Partial<Task>): Promise<void> {
    try {
      const { data } = await api.patch<Task>(`/tasks/${id}/`, patch)
      tasks.value = tasks.value.map(t => t.id === id ? data : t)
    } catch (err) {
      const systemError = err as Error
      throw new Error(systemError.message || 'Failed to update task.')
    }
  }

  async function deleteTask(id: number): Promise<void> {
    try {
      await api.delete(`/tasks/${id}/`)
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (err) {
      const systemError = err as Error
      throw new Error(systemError.message || 'Failed to delete task.')
    }
  }

  function reset(): void {
    tasks.value = []
    error.value = null
    isLoading.value = false
  }

  return { tasks, isLoading, error, fetchTasks, createTask, updateTask, deleteTask, reset }
})
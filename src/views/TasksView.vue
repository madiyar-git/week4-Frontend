<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { storeToRefs } from 'pinia'
import type { Task } from '../types/task'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import TaskList from '../components/TaskList.vue'

const tasksStore = useTaskStore()
const { tasks, isLoading, error } = storeToRefs(tasksStore)

const newTitle = ref<string>('')
const newDescription = ref<string>('')
const newPriority = ref<'low' | 'medium' | 'high'>('medium')
const isSubmitting = ref<boolean>(false)
const formError = ref<string | null>(null)

const isFormValid = computed<boolean>(() => {
  return newTitle.value.trim().length >= 3
})

async function handleCreateTask(): Promise<void> {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true
  formError.value = null

  try {
    await tasksStore.createTask({
      title: newTitle.value.trim(),
      description: newDescription.value.trim(),
      priority: newPriority.value,
      completed: false,
    })

    newTitle.value = ''
    newDescription.value = ''
    newPriority.value = 'medium'
  } catch (err: unknown) {
    console.error(err)
    const errorObject = err as Error
    formError.value = errorObject.message || 'Failed to create task.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleToggleCompleted(id: number, fields: Partial<Task>): Promise<void> {
  try {
    await tasksStore.updateTask(id, fields)
  } catch (err: unknown) {
    console.error(err)
    alert('Failed to update task status.')
  }
}

async function handleDeleteTask(id: number): Promise<void> {
  try {
    await tasksStore.deleteTask(id)
  } catch (err: unknown) {
    console.error(err)
    alert('Failed to delete task.')
  }
}

async function bulkAction(
  actionName: 'toggle_all' | 'clear_completed' | 'clear_all',
): Promise<void> {
  if (actionName === 'toggle_all') {
    const areAllCompleted = tasks.value.every((t) => t.completed)
    const newStatus = !areAllCompleted
    const promises = tasks.value.map((t) => tasksStore.updateTask(t.id, { completed: newStatus }))

    try {
      await Promise.all(promises)
    } catch (err: unknown) {
      console.error(err)
      alert('Failed to update all tasks.')
    }
  } else if (actionName === 'clear_completed') {
    const completedTasks = tasks.value.filter((t) => t.completed)
    try {
      const promises = completedTasks.map((t) => tasksStore.deleteTask(t.id))
      await Promise.all(promises)
    } catch (err: unknown) {
      console.error(err)
      alert('Failed to clear completed tasks.')
    }
  } else if (actionName === 'clear_all') {
    try {
      const promises = tasks.value.map((t) => tasksStore.deleteTask(t.id))
      await Promise.all(promises)
    } catch (err: unknown) {
      console.error(err)
      alert('Failed to clear all tasks.')
    }
  }
}

onMounted(() => {
  tasksStore.fetchTasks()
})
</script>

<template>
  <main class="app-main">
    <div class="tasks-container">
      <h2>My Tasks</h2>

      <BaseCard class="task-form-card">
        <template #header>
          <h3>New Task</h3>
        </template>

        <form @submit.prevent="handleCreateTask" class="create-task-form">
          <div class="form-group">
            <BaseInput
              v-model="newTitle"
              type="text"
              label="Title"
              placeholder="Task title (min 3 symbols)..."
              :disabled="isSubmitting"
              :error="formError || undefined"
              required
            />
          </div>

          <div class="form-group">
            <BaseInput
              v-model="newDescription"
              label="Description"
              placeholder="Description (optional)..."
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="priority">Priority</label>
            <select
              id="priority"
              v-model="newPriority"
              :class="newPriority"
              :disabled="isSubmitting"
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
            :disabled="!isFormValid || isLoading"
            :loading="isLoading"
            style="width: 100%; margin-top: 12px"
          >
            Create New Task
          </BaseButton>
        </form>
      </BaseCard>

      <hr class="divider" />

      <div v-if="isLoading" class="spinner-container">
        <div class="spinner"></div>
        <p>Loading tasks from server...</p>
      </div>

      <div v-else-if="error" class="error-banner">
        <p>Error: {{ error }}</p>
        <BaseButton
          type="button"
          variant="secondary"
          size="sm"
          style="width: 60%"
          @click="tasksStore.fetchTasks()"
        >
          Retry
        </BaseButton>
      </div>

      <p v-if="!isLoading && tasks.length === 0" class="empty-text">
        No tasks found. Create your first task!
      </p>

      <TaskList
        v-else-if="tasks.length > 0"
        v-model="tasks"
        @delete="handleDeleteTask"
        @update="handleToggleCompleted"
        @bulk-action="bulkAction"
      />
    </div>
  </main>
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
  background-color: #1a2a3a;
  color: #90cdf4;
  border-color: #2b6cb0;
}

.medium {
  background-color: #3d2a1d;
  color: #fbd38d;
  border-color: #dd6b20;
}

.high {
  background-color: #3d1d24;
  color: #feb2b2;
  border-color: #e53e3e;
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
</style>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { useTaskStore } from '@/stores/tasks'
import { storeToRefs } from 'pinia'
import type { Task } from '../types/task'
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
      completed: false
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

async function bulkAction(actionName: 'toggle_all' | 'clear_completed' | 'clear_all'): Promise<void> {
  if (actionName === 'toggle_all') {
    const areAllCompleted = tasks.value.every(t => t.completed)
    const newStatus = !areAllCompleted
    const promises = tasks.value.map(t => tasksStore.updateTask(t.id, { completed: newStatus }))

    try {
      await Promise.all(promises)
    } catch (err: unknown) {
      console.error(err) 
      alert('Failed to update all tasks.')
    }
  } 
  
  else if (actionName === 'clear_completed') {
    const completedTasks = tasks.value.filter(t => t.completed)
    try {
      const promises = completedTasks.map(t => tasksStore.deleteTask(t.id))
      await Promise.all(promises)
    } catch (err: unknown) {
      console.error(err) 
      alert('Failed to clear completed tasks.')
    }
  } 
  
  else if (actionName === 'clear_all') {
    try {
      const promises = tasks.value.map(t => tasksStore.deleteTask(t.id))
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

      <form @submit.prevent="handleCreateTask" class="create-task-form">
        <h3>New Task</h3>
        
        <div class="form-group">
          <input 
            v-model="newTitle" 
            type="text" 
            placeholder="Task title (min 3 symbols)..." 
            required 
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <textarea 
            v-model="newDescription" 
            placeholder="Description (optional)..."
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="priority">Priority: </label>
          <select id="priority" v-model="newPriority" :disabled="isSubmitting">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <p v-if="formError" class="error-text">{{ formError }}</p>
        
        <button type="submit" :disabled="!isFormValid || isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Add Task' }}
        </button>
      </form>

      <hr class="divider" />

      <div v-if="isLoading" class="spinner-container">
        <div class="spinner"></div>
        <p>Loading tasks from server...</p>
      </div>
      
      <div v-else-if="error" class="error-banner">
        <p>Error: {{ error }}</p>
        <button @click="tasksStore.fetchTasks()" class="retry-btn">Retry</button>
      </div>
      
      <p v-else-if="tasks.length === 0" class="empty-text">No tasks found. Create your first task!</p>
      
      <TaskList 
        v-else 
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

.create-task-form {
  background-color: #181818;
  border: 1px solid #282828;
  padding: 40px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 25px;
}

.create-task-form h3 {
  margin: 0 0 20px 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1db954;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
}

input, textarea, select {
  background-color: #3e3e3e;
  border: 1px solid #535353;
  color: #ffffff;
  padding: 12px;
  border-radius: 4px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  font-family: sans-serif;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #1db954;
  background-color: #4a4a4a;
}

input:disabled, textarea:disabled, select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  height: 90px;
}

select {
  cursor: pointer;
}

.create-task-form button[type="submit"] {
  width: 100%;
  background-color: #1db954;
  color: #000000;
  border: none;
  padding: 14px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  transition: transform 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
}

.create-task-form button[type="submit"]:hover:not(:disabled) {
  background-color: #1ed760;
  transform: scale(1.02);
}

.create-task-form button[type="submit"]:active:not(:disabled) {
  transform: scale(0.98);
}

.create-task-form button[type="submit"]:disabled {
  background-color: #535353;
  color: #b3b3b3;
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.divider {
  border: 0;
  border-top: 1px solid #282828;
  margin: 25px 0;
}

.error-text {
  background-color: #4a1d24;
  color: #feb2b2;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #ff4d4f;
  box-sizing: border-box;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-banner {
  background-color: #4a1d24;
  border: 1px solid #ff4d4f;
  border-radius: 8px;
  padding: 24px;
  color: #feb2b2;
  text-align: center;
  box-sizing: border-box;
}

.error-banner p {
  margin: 0 0 16px 0;
  font-size: 0.95rem;
}

.retry-btn {
  background-color: #1db954;
  color: #000000;
  border: none;
  padding: 10px 24px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.retry-btn:hover {
  background-color: #1ed760;
  transform: scale(1.02);
}

.retry-btn:active {
  transform: scale(0.98);
}
</style>
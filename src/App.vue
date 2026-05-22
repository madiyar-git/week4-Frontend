<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Task } from './types/task'
import TaskList from './components/TaskList.vue';
import axios from 'axios'
import { fetchTasks, updateTask, deleteTask as deleteTaskApi, createTask } from './api/tasks'

const tasks = ref<Task[]>([])
const isLoading = ref<boolean>(false)
const error = ref<string | null>(null)

const deleteTask = async (id: number) => {
  try {
    await deleteTaskApi(id) // удаляем в бэкенде
    tasks.value = tasks.value.filter(task => task.id !== id) // удаляем с экрана
  } catch (err) {
    console.error('Error:', err)
  }
}

const loadTasks = async () => {
  isLoading.value = true
  error.value = null
  try {
    tasks.value = await fetchTasks()
  } catch (err ){
      if (axios.isAxiosError(err)) {
      error.value = err.response?.data?.message || err.message || 'Server ERROR'
    } else if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Undefined ERROR'
    }    console.error('API Error', err)
  } finally {
    isLoading.value = false
  }
}

async function createNewTask() {
  try {
    const newTaskData: Partial<Task> = {
      title: 'New task',
      description: '', 
      completed: false,
      priority: 'medium' 
    }

    const savedTask = await createTask(newTaskData)
    
    tasks.value = [savedTask, ...tasks.value]
    
    if (tasks.value.length > 10) {
      tasks.value = tasks.value.slice(0, 10)
    }
  } catch (err) {
    console.error('Fail creating:', err)
  }
}

const taskUpdater = async (id: number, updateFields: Partial<Task>) =>{
  try{
    await updateTask(id, updateFields)
  } catch (err){
    console.error('Error: ',err)
  }
}

async function bulkAction(actionName: 'toggle_all' | 'clear_completed_local' | 'clear_all_local') {
  
  if (actionName === 'toggle_all') {
    const areAllCompleted = tasks.value.every(t => t.completed)
    const newStatus = !areAllCompleted
    const promises = tasks.value.map(t => updateTask(t.id, { completed: newStatus }))
    try {
      await Promise.all(promises)
      tasks.value.forEach(t => t.completed = newStatus)
    } catch (e) {
      console.error('Error ', e)
    }
  }

  else if (actionName === 'clear_completed_local') {
    const completedVisibleTasks = tasks.value.filter(t => t.completed)

    try {
      for (const task of completedVisibleTasks) {
        await deleteTaskApi(task.id) 
      }
      
      tasks.value = tasks.value.filter(t => !t.completed)
    } catch (e) {
      console.error('Error delete done tasks: ', e)
    }
  }

  else if (actionName === 'clear_all_local') {
    const tasksToDelete = [...tasks.value]

    try {
      for (const task of tasksToDelete) {
        await deleteTaskApi(task.id) 
      }
      
      tasks.value = []
    } catch (e) {
      console.error('Error delete all tasks:', e)
    }
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<template>
  <main class="app-main">
    <h1>Task Manager</h1>
    <div v-if="isLoading" class="spinner-container">
      <div class="spinner"></div>
      <p>Loading tasks from server...</p>
    </div>
    <div v-else-if="error" class="error-banner">
      <p> Error: {{ error }}</p>
      <button @click="loadTasks" class="retry-btn">Retry</button>
    </div>
    <TaskList v-else v-model="tasks" @delete="deleteTask" @update="taskUpdater" @bulk-action="bulkAction" @create-task="createNewTask"/>
  </main> 
</template>

<style>
body {
  margin: 0;
  background-color: #121212;
  color: #ffffff;
  font-family: sans-serif;
}

.app-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

h1 {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 50px;
  width: 220px;
  border-radius: 25px;
  color: #000000;
  background-color: #1db954; 
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: -0.5px;
}

.spinner-container { 
  text-align: center; 
  padding: 40px; 
  color: #1db954; 
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #282828;
  border-top: 4px solid #1db954;
  border-radius: 50%;
  margin: 0 auto 10px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-banner {
  padding: 20px;
  background-color: #282828;
  border: 1px solid #ff4d4f;
  border-radius: 8px;
  color: #ff4d4f;
  text-align: center;
}
.retry-btn {
  margin-top: 12px;
  padding: 10px 24px;
  background-color: #1db954;
  color: black;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}
.retry-btn:hover {
  transform: scale(1.05);
}
</style>
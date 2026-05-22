<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from "../types/task";
import TaskCard from "./TaskCard.vue"


const tasks = defineModel<Task[]>({required: true})

defineEmits<{
  'delete': [TaskId: number]
  'update': [taskId: number, fields: Partial<Task>]
  'bulk-action': [action: 'toggle_all' | 'clear_completed_local' | 'clear_all_local']
  'create-task': []
}>()

const completedCount = computed(() =>{
    return tasks.value.filter(t => t.completed).length
})

</script>

<template>
    <div class="task-list-container">
        <div class="stats-panel">
            <div class="stats-text">
                Tasks: {{ tasks.length }} (completed: {{ completedCount }})
            </div>
            
            <div class="bulk-actions" v-if="tasks.length > 0">
                <button @click="$emit('bulk-action', 'toggle_all')" class="bulk-btn success">
                    {{ tasks.every(t => t.completed) ? 'Mark done' : 'Mark active' }}
                </button>
                
                <button @click="$emit('bulk-action', 'clear_completed_local')" class="bulk-btn warning">
                    Delete done tasks
                </button>
                
                <button @click="$emit('bulk-action', 'clear_all_local')" class="bulk-btn danger">
                    Delete all
                </button>
            </div>
        </div>

        <button @click="$emit('create-task')" class="create-task-btn">
            <span class="plus-icon">+</span> Добавить задачу
        </button>

        <div v-if="tasks.length > 0" class="task-list">
            <TaskCard v-for="(task,index) in tasks" :key="task.id" v-model="tasks[index]!" @delete="$emit('delete', $event)" @update="(id, fields) => $emit('update',id, fields)"/>
        </div>
        <p v-else class="empty-state">No tasks yet</p>
    </div>
</template>

<style scoped>
.task-list-container {
  width: 100%;
  max-width: 450px; 
  margin: 0 auto;
}

.stats-panel {
  margin-bottom: 24px;
  background: #181818;
  border: 1px solid #282828;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  color: #b3b3b3;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.bulk-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}

.bulk-btn {
  background-color: #282828;
  color: #ffffff;
  border: 1px solid #3e3e3e;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bulk-btn.success:hover {
  background-color: #1db954; 
  border-color: #1db954;
  color: #000000;
}

.bulk-btn.warning:hover {
  background-color: #fbd38d; 
  border-color: #fbd38d;
  color: #000000;
}

.bulk-btn.danger:hover {
  background-color: #ff4d4f; 
  border-color: #ff4d4f;
  color: #ffffff;
}

.bulk-btn:active {
  transform: scale(0.95);
}

.create-task-btn {
  width: 100%;
  background-color: #1db954;
  color: #000000;
  border: none;
  padding: 14px;
  border-radius: 25px; 
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.create-task-btn:hover {
  background-color: #1ed760; 
  transform: scale(1.02); 
}

.create-task-btn:active {
  transform: scale(0.98);
}

.plus-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px; 
}

.empty-state {
  text-align: center;
  color: #b3b3b3;
  font-style: italic;
  margin-top: 40px;
}
</style>
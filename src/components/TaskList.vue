<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '../types/task';
import BaseButton from '@/components/base/BaseButton.vue';
import TaskCard from './TaskCard.vue';

const tasks = defineModel<Task[]>({ required: true });

defineEmits<{
  delete: [TaskId: number];
  update: [taskId: number, fields: Partial<Task>];
  'bulk-action': [action: 'toggle_all' | 'clear_completed' | 'clear_all'];
}>();

const completedCount = computed(() => {
  return tasks.value.filter((t) => t.completed).length;
});
</script>

<template>
  <div class="task-list-container">
    <div class="stats-panel">
      <div class="stats-text">Tasks: {{ tasks.length }} (completed: {{ completedCount }})</div>

      <div class="bulk-actions" v-if="tasks.length > 0">
        <BaseButton
          type="button"
          variant="primary"
          size="sm"
          @click="$emit('bulk-action', 'toggle_all')"
        >
          Mark all
        </BaseButton>

        <BaseButton
          type="button"
          variant="secondary"
          size="sm"
          @click="$emit('bulk-action', 'clear_completed')"
        >
          Delete done tasks
        </BaseButton>

        <BaseButton
          type="button"
          variant="danger"
          size="sm"
          @click="$emit('bulk-action', 'clear_all')"
        >
          Delete all
        </BaseButton>
      </div>
    </div>

    <div v-if="tasks.length > 0" class="task-list">
      <TaskCard
        v-for="(task, index) in tasks"
        :key="task.id"
        v-model="tasks[index]!"
        @delete="$emit('delete', $event)"
        @update="(id, fields) => $emit('update', id, fields)"
      />
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
}

.bulk-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
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

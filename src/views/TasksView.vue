<script setup lang="ts">
import { ref } from 'vue';
import TasksTable from '@/components/TasksTable.vue';
import { useSaveInClipBoard } from '@/composables/useSaveInClipBoard';

const tasksTableRef = ref<InstanceType<typeof TasksTable> | null>(null);
</script>

<template>
  <main class="app-main">
    <div class="tasks-container">
      <h2 @click="useSaveInClipBoard('My Tasks')">My Tasks</h2>

      <TasksTable ref="tasksTableRef" />
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
  max-width: 1000px;
  box-sizing: border-box;
}

h2 {
  margin: 0 0 24px 0;
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: #ffffff;
  cursor: pointer;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>

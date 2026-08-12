<script setup lang="ts">
import { ref } from 'vue';
import BaseButton from '@/components/base/BaseButton.vue';
import CreateTaskModal from '@/components/CreateTaskModal.vue';
import TasksTable from '@/components/TasksTable.vue';
import { useSaveInClipBoard } from '@/composables/useSaveInClipBoard';
import { taskApi } from '@/api/tasks';
import type { Task } from '@/types/task';

const tasksTableRef = ref<InstanceType<typeof TasksTable> | null>(null);

const isCreateModalOpen = ref(false);
const isCreateLoading = ref(false);

async function handleCreateTask(newTaskData: {
  title: string;
  description: string;
  priority: Task['priority'];
}) {
  isCreateLoading.value = true;
  try {
    await taskApi.create({
      title: newTaskData.title.trim(),
      description: newTaskData.description.trim(),
      priority: newTaskData.priority
    });

    isCreateModalOpen.value = false;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    alert(`Failed to create task: ${message}`);
  } finally {
    isCreateLoading.value = false;
  }
}
</script>

<template>
  <main class="app-main">
    <div class="tasks-container">
      <h2 @click="useSaveInClipBoard('My Tasks')">My Tasks</h2>

      <div class="header-actions">
        <BaseButton variant="primary" @click="isCreateModalOpen = true"> + Create Task </BaseButton>
      </div>

      <TasksTable ref="tasksTableRef" />

      <CreateTaskModal
        :open="isCreateModalOpen"
        :loading="isCreateLoading"
        @close="isCreateModalOpen = false"
        @create="handleCreateTask"
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
  max-width: 1000px; /* Увеличено под ширину таблицы */
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { NPagination, NSkeleton } from 'naive-ui';
import type { Task } from '@/types/task';
import { useTaskStore } from '@/stores/tasks';
import BaseButton from '@/components/base/BaseButton.vue';
import TaskCard from './TaskCard.vue';

defineEmits<{
  edit: [task: Task];
  'bulk-action': [action: 'toggle_all' | 'clear_completed' | 'clear_all'];
}>();

const taskStore = useTaskStore();

const { tasks, totalCount, searchQuery, isLoading } = storeToRefs(taskStore);

const page = ref(1);
const pageSize = ref(10);
const selectedId = ref<number | null>(null);

const completedCount = computed(() => {
  return tasks.value.filter((t) => t.completed).length;
});

function handleSelect(id: number) {
  selectedId.value = id;
}

async function handleUpdateTask(id: number, fields: Partial<Task>) {
  await taskStore.updateTask(id, fields);
}

async function handleDeleteTask(id: number) {
  await taskStore.deleteTask(id);
}

function handlePageChange(newPage: number) {
  page.value = newPage;
  taskStore.fetchTasks({
    page: page.value,
    page_size: pageSize.value,
    search: searchQuery.value
  });
}

function handlePageSizeChange(newPageSize: number) {
  pageSize.value = newPageSize;
  page.value = 1;
  taskStore.fetchTasks({
    page: page.value,
    page_size: pageSize.value,
    search: searchQuery.value
  });
}
</script>

<template>
  <div class="task-list-container">
    <div class="stats-panel">
      <div class="stats-text">Tasks: {{ totalCount }} (completed: {{ completedCount }})</div>

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

    <div v-if="isLoading" class="task-list">
      <div v-for="n in pageSize" :key="n" class="skeleton-card">
        <NSkeleton height="20px" width="60%" radius="4px" />
        <NSkeleton height="14px" width="90%" radius="4px" />
        <div class="skeleton-footer">
          <NSkeleton height="24px" width="70px" radius="12px" />
          <NSkeleton height="24px" width="50px" radius="4px" />
        </div>
      </div>
    </div>

    <div v-else-if="tasks.length > 0" class="task-list">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :model-value="task"
        :class="{ selected: task.id === selectedId }"
        v-memo="[task.id, task.completed, task.title, task.priority, task.id === selectedId]"
        @click="handleSelect(task.id)"
        @delete="handleDeleteTask"
        @update="handleUpdateTask"
        @edit="$emit('edit', $event)"
      />

      <div class="pagination-wrapper">
        <NPagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :item-count="totalCount"
          :page-sizes="[5, 10, 20, 50]"
          show-size-picker
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </div>

    <p v-else class="empty-state">No tasks yet</p>
  </div>
</template>

<style scoped>
.task-list-container {
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  min-height: 650px;
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

.skeleton-card {
  background: #181818;
  border: 1px solid #282828;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  color: #b3b3b3;
  font-style: italic;
  margin-top: 40px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 12px 0;
}
</style>

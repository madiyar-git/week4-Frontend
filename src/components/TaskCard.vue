<script setup lang="ts">
import type { Task } from '../types/task';
import { ref } from 'vue';

const isEditing = ref<boolean>(false);
const isEditingDesc = ref<boolean>(false);
const task = defineModel<Task>({ required: true });

const emit = defineEmits<{
  delete: [taskId: number];
  update: [taskId: number, fields: Partial<Task>];
  edit: [task: Task];
}>();

function saveTitle() {
  if (!isEditing.value) return;
  isEditing.value = false;
  const trimmed = task.value.title.trim();
  const finalTitle = trimmed !== '' ? trimmed : 'No name...';
  task.value.title = finalTitle;
  emit('update', task.value.id, { title: finalTitle });
}

function saveDesc() {
  if (!isEditingDesc.value) return;
  isEditingDesc.value = false;
  emit('update', task.value.id, { description: task.value.description });
}

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
];
</script>

<template>
  <div class="task-card" :class="{ 'is-completed': task.completed }">
    <div class="task-header">
      <div class="title-wrapper">
        <h3 v-if="!isEditing" class="title" @dblclick="isEditing = true">
          {{ task.title && task.title.trim() !== '' ? task.title : 'No name...' }}
        </h3>
        <n-input
          v-else
          v-model:value="task.title"
          size="small"
          placeholder="Enter task name"
          class="title-input"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
        />
      </div>

      <div class="actions">
        <n-checkbox
          v-model:checked="task.completed"
          size="medium"
          @update:checked="emit('update', task.id, { completed: task.completed })"
        />
        <n-button size="small" secondary type="primary" @click="emit('edit', task)">
          Edit
        </n-button>
        <n-button
          size="small"
          quaternary
          type="error"
          class="delete-btn"
          @click="emit('delete', task.id)"
        >
          ✕
        </n-button>
      </div>
    </div>

    <div class="description-section">
      <p
        v-if="!isEditingDesc"
        class="description"
        :class="{ empty: !task.description }"
        @dblclick="isEditingDesc = true"
      >
        {{ task.description || 'Add description...' }}
      </p>
      <n-input
        v-else
        v-model:value="task.description"
        type="textarea"
        size="small"
        placeholder="Add description..."
        :autosize="{ minRows: 2, maxRows: 4 }"
        @blur="saveDesc"
      />
    </div>

    <div class="task-footer">
      <n-select
        v-model:value="task.priority"
        size="small"
        :options="priorityOptions"
        class="priority-select"
        @update:value="emit('update', task.id, { priority: task.priority })"
      />
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background-color: #181818;
  border: 1px solid #282828;
  border-radius: 6px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
  box-sizing: border-box;
  width: 100%;
}

.task-card:hover {
  background-color: #202020;
  border-color: #333333;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
}

.title-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.title-input {
  width: 100%;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.delete-btn {
  padding: 0 6px !important;
  font-size: 0.9rem !important;
  font-weight: bold;
}

.description-section {
  min-height: 24px;
}

.description {
  margin: 0;
  font-size: 0.95rem;
  color: #b3b3b3;
  line-height: 1.4;
  cursor: pointer;
  white-space: pre-wrap;
  word-break: break-word;
}

.description.empty {
  color: #555555;
  font-style: italic;
}

.description.empty:hover {
  color: #888888;
}

.task-footer {
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.priority-select {
  width: 110px;
}

:deep(.n-input) {
  --n-height: 32px !important;
  font-size: 1.25rem !important;
}

:deep(.n-input--textarea) {
  --n-height: auto !important;
}

:deep(.n-base-selection) {
  --n-height: 26px !important;
  font-size: 0.75rem !important;
  font-weight: 700;
  text-transform: uppercase;
}

.is-completed {
  opacity: 0.5;
}

.is-completed .title,
.is-completed .description {
  text-decoration: line-through;
}
</style>

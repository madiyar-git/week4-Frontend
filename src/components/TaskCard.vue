<script setup lang="ts">
import type { Task } from '../types/task';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
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
  const secondTitle = 'No name...';

  const finalTitle = trimmed && trimmed !== '' ? trimmed : secondTitle;

  task.value.title = finalTitle;
  emit('update', task.value.id, { title: finalTitle });
}
</script>

<template>
  <div class="task-card" :class="{ 'is-completed': task.completed }">
    <div class="task-header">
      <h3 v-if="!isEditing" @dblclick="isEditing = true" class="title">
        {{ task.title && task.title.trim() !== '' ? task.title : (task.title = 'No name...') }}
      </h3>

      <BaseInput
        v-else
        v-model="task.title"
        placeholder="Enter task name"
        @blur="saveTitle"
        @keyup.enter="saveTitle"
        required
      />

      <div class="buttons">
        <BaseButton type="button" variant="primary" size="sm" @click="emit('edit', task)">
          Edit
        </BaseButton>

        <BaseInput
          type="checkbox"
          v-model="task.completed"
          class="checkbox"
          @change.stop="$emit('update', task.id, { completed: task.completed })"
        />
        <BaseButton
          type="submit"
          variant="danger"
          size="sm"
          :disabled="false"
          :loading="false"
          @click="emit('delete', task.id)"
          class="delete-btn"
        >
          &times;
        </BaseButton>
      </div>
    </div>

    <div v-if="!isEditingDesc" class="description-block">
      <p v-if="task.description" @dblclick="isEditingDesc = true" class="description">
        {{ task.description }}
      </p>
      <p v-else @dblclick="isEditingDesc = true" class="description-placeholder">
        Add description...
      </p>
    </div>

    <BaseInput
      v-else
      v-model="task.description"
      @blur="((isEditingDesc = false), $emit('update', task.id, { description: task.description }))"
      @keyup.enter="
        ((isEditingDesc = false), $emit('update', task.id, { description: task.description }))
      "
    />

    <select
      class="priority-badge"
      :class="task.priority"
      v-model="task.priority"
      @change="$emit('update', task.id, { priority: task.priority })"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </div>
</template>

<style scoped>
.task-card {
  background-color: #181818;
  border: 1px solid #282828;
  padding: 20px;
  border-radius: 8px;
  min-height: 7vw;
  display: flex;
  flex-direction: column;

  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    opacity 0.4s ease;
}

.task-card:hover {
  background-color: #282828;
  border-color: #3e3e3e;
  box-shadow: 0 2px 8px rgb(88, 107, 77);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
}

.title-input {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  background-color: #3e3e3e;
  border: 1px solid #535353;
  border-radius: 4px;
  padding: 4px 8px;
  width: 75%;
  box-sizing: border-box;
}
.title-input:focus,
.description-input:focus {
  outline: none;
  border-color: #1db954;
}

.description {
  margin: 12px 0 0 0;
  font-size: 0.9rem;
  color: #b3b3b3;
  line-height: 1.4;
  cursor: pointer;
  min-width: 0;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.description-placeholder {
  margin: 12px 0 0 0;
  font-size: 0.9rem;
  color: #535353;
  font-style: italic;
  cursor: pointer;
  line-height: 1.4;
}
.description-placeholder:hover {
  color: #b3b3b3;
}

.description-input {
  width: 100%;
  margin-top: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  color: #ffffff;
  background-color: #3e3e3e;
  padding: 10px;
  border: 1px solid #535353;
  border-radius: 6px;
  box-sizing: border-box;
  resize: vertical;
  min-height: 60px;
}

.buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #80ffac;
}

.delete-btn {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  min-width: auto !important;
  min-height: auto !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
  color: #535353 !important;
  font-size: 1.4rem !important;
  line-height: 0.8 !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;

  transition:
    color 0.2s,
    background-color 0.2s,
    transform 0.2s !important;
}

.delete-btn:hover {
  color: #ff4d4f !important;
  background-color: rgba(255, 77, 79, 0.1) !important;
  transform: scale(1.1);
}

.delete-btn:active {
  transform: scale(0.95);
}

.is-completed {
  opacity: 0.6;
}
.is-completed .title,
.is-completed .description {
  text-decoration: line-through;
  color: #6fce66;
}

.priority-badge {
  margin-top: auto;
  padding-top: 12px;
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  border: none;
  cursor: pointer;
  outline: none;
}

.low {
  background-color: rgba(29, 185, 84, 0.12);
  color: #1ed760;
  border-color: rgba(29, 185, 84, 0.3);
}

.medium {
  background-color: rgba(255, 170, 0, 0.12);
  color: #ffb703;
  border-color: rgba(255, 170, 0, 0.3);
}

.high {
  background-color: rgba(233, 20, 41, 0.15);
  color: #ff4d5e;
  border-color: rgba(233, 20, 41, 0.35);
}

select.priority-badge option,
select option {
  background-color: #282828 !important;
  color: #ffffff !important;
}
</style>

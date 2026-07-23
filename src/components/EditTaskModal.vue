<script setup lang="ts">
import { watch } from 'vue';
import type { Task } from '@/types/task';
import { useForm, type Errors } from '@/composables/useForm';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps<{
  open: boolean;
  task: Task | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: Partial<Task>): void;
}>();

const validate = (values: Partial<Task>): Errors<Partial<Task>> => {
  const errors: Errors<Partial<Task>> = {};
  if (values.title !== undefined && !values.title.trim()) {
    errors.title = 'Title cannot be empty';
  }
  return errors;
};

const { values, errors, handleSubmit, reset } = useForm<Partial<Task>>(
  {
    title: props.task?.title ?? '',
    description: props.task?.description ?? '',
    priority: props.task?.priority ?? 'medium'
  },
  validate
);

const getErrorString = (err: string | string[] | null | undefined): string | undefined => {
  if (!err) return undefined;
  return Array.isArray(err) ? err[0] : err;
};

function handleClose() {
  reset();
  emit('close');
}

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      values.value.title = newTask.title;
      values.value.description = newTask.description;
      values.value.priority = newTask.priority;
    }
  },
  { immediate: true }
);

const onSubmit = handleSubmit((formData) => {
  emit('submit', formData);
});
</script>

<template>
  <div v-if="open" class="modal-backdrop">
    <div class="modal-content">
      <h3>Edit Task</h3>
      <form @submit.prevent="onSubmit">
        <BaseInput
          v-model="values.title"
          label="Title"
          :error="getErrorString(errors.title)"
          required
        />
        <BaseInput v-model="values.description" label="Description" />

        <div class="form-group">
          <label for="priority">Priority</label>
          <select
            id="priority"
            v-model="values.priority"
            :class="['priority-select', values.priority]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div class="modal-actions">
          <BaseButton type="button" variant="secondary" @click="handleClose">Cancel</BaseButton>
          <BaseButton type="submit" variant="primary" :loading="loading">Save Changes</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: #121212;
  border: 1px solid #282828;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #ffffff;
  animation: slideUp 0.2s ease-out;
}

.modal-content h3 {
  margin: 0;
  font-size: 1.35rem;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.form-group label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #b3b3b3;
  letter-spacing: 0.2px;
  text-transform: uppercase;
}

.priority-select {
  width: 100%;
  padding: 12px 16px;
  border-radius: 3px;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.priority-select.low {
  background-color: rgba(29, 185, 84, 0.15);
  color: #1ed760;
  border-color: rgba(29, 185, 84, 0.4);
}

.priority-select.medium {
  background-color: rgba(255, 170, 0, 0.15);
  color: #ffb703;
  border-color: rgba(255, 170, 0, 0.4);
}

.priority-select.high {
  background-color: rgba(233, 20, 41, 0.18);
  color: #ff4d5e;
  border-color: rgba(233, 20, 41, 0.45);
}

.priority-select:hover {
  transform: scale(1.02);
}

.priority-select option {
  background-color: #282828;
  color: #ffffff;
  font-weight: 600;
  padding: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup lang="ts">
import { watch } from 'vue';
import type { Task } from '@/types/task';
import { useForm, type Errors } from '@/composables/useForm';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';

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
  } else if (values.title !== undefined && values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 symbols';
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
  <BaseModal :open="open" title="Edit Task" @close="handleClose">
    <form id="edit-task-form" class="task-form" @submit.prevent="onSubmit">
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
    </form>

    <template #footer>
      <BaseButton type="button" variant="secondary" @click="handleClose"> Cancel </BaseButton>
      <BaseButton type="submit" form="edit-task-form" variant="primary" :loading="loading">
        Save Changes
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  border-radius: 50px;
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
</style>

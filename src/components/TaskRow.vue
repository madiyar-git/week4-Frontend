<script setup lang="ts">
import { onUpdated, ref } from 'vue';
import type { Task } from '@/types/task';

defineProps<{
  task: Task;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: number): void;
}>();

const updateCount = ref(0);

onUpdated(() => {
  updateCount.value++;
});
</script>

<template>
  <div class="task-row" :class="{ selected: isSelected }" @click="emit('select', task.id)">
    <span class="id">#{{ task.id }}</span>
    <span class="title">{{ task.title }}</span>
    <span class="updates">Renders: {{ updateCount }}</span>
  </div>
</template>

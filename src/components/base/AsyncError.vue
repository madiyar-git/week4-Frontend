<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue';

defineProps<{
  retry?: () => void;
}>();
</script>

<template>
  <div class="async-error">
    <p>Unable to load the component (network error)</p>

    <BaseButton v-if="retry" variant="danger" size="sm" @click="retry"> Try again </BaseButton>
  </div>
</template>

<style scoped>
.async-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid #ff4d4f;
  border-radius: 8px;
  color: #ff4d4f;
  text-align: center;
  margin: 12px 0;
}

p {
  margin: 0;
  font-size: 0.9rem;
}
</style>

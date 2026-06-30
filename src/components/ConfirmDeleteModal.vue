<script setup lang="ts">
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';

interface Props {
  open: boolean;
  taskTitle: string;
  loading?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();
</script>

<template>
  <BaseModal :open="open" title="Delete task" @close="emit('close')">
    <p class="confirm-text">
      Are you sure you want to delete <span class="highlight">«{{ taskTitle }}»</span>? This action
      cannot be undone.
    </p>

    <template #footer>
      <BaseButton variant="secondary" size="md" :disabled="loading" @click="emit('close')">
        Cancel
      </BaseButton>
      <BaseButton variant="danger" size="md" :loading="loading" @click="emit('confirm')">
        Delete
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-text {
  margin: 0;
  color: #e0e0e0;
}
.highlight {
  color: #ffffff;
  font-weight: 600;
  word-break: break-all;
}
</style>

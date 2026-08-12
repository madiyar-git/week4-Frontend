<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'reset' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'sm',
  type: 'button',
  loading: false,
  disabled: false,
  error: 'Something wrong'
});

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const naiveType = computed(() => {
  if (props.variant === 'danger') return 'error';
  if (props.variant === 'secondary') return 'default';
  return 'primary';
});

const naiveSize = computed(() => {
  if (props.size === 'lg') return 'large';
  if (props.size === 'md') return 'medium';
  return 'small';
});
</script>

<template>
  <n-button
    :attr-type="type"
    :type="naiveType"
    :size="naiveSize"
    :loading="loading"
    :disabled="disabled"
    round
    class="base-button-wrapper"
    @click="$emit('click', $event)"
  >
    <slot />
  </n-button>
</template>

<style scoped>
.base-button-wrapper {
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'reset' | 'submit';
  loading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'sm',
  type: 'button',
  loading: false,
  disabled: false
});

const buttonClasses = computed(() => {
  return [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    { 'base-button--loading': props.loading }
  ];
});
</script>

<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled || loading">
    <span v-if="loading" class="base-button__spinner" aria-hidden="true"></span>

    <span class="base-button__content">
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 700;
  border-radius: 50px;
  border: 1px solid transparent;
  cursor: pointer;
  letter-spacing: 0.5px;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.1s ease,
    box-shadow 0.2s ease;

  position: relative;
  outline: none;
}

.base-button:not(:disabled):hover {
  transform: scale(1.04);
}

.base-button:not(:disabled):active {
  transform: scale(1);
}

.base-button:focus-visible {
  box-shadow:
    0 0 0 3px rgba(29, 185, 84, 0.5),
    0 0 0 5px #000000;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.base-button--primary {
  background-color: #1db954;
  color: #000000;
}
.base-button--primary:not(:disabled):hover {
  background-color: #1ed760;
}

.base-button--secondary {
  background-color: #ffffff;
  color: #000000;
  border-color: #ffffff;
}
.base-button--secondary:not(:disabled):hover {
  background-color: #f6f6f6;
}

.base-button--danger {
  background-color: #e91429;
  color: #0c0c0c;
}
.base-button--danger:not(:disabled):hover {
  background-color: #f12439;
}

.base-button--sm {
  padding: 8px 18px;
  font-size: 0.8125rem;
  gap: 6px;
}

.base-button--md {
  padding: 12px 32px;
  font-size: 0.875rem;
  gap: 8px;
}

.base-button--lg {
  padding: 14px 48px;
  font-size: 1rem;
  gap: 10px;
}

.base-button--loading .base-button__content {
  visibility: hidden;
}

.base-button__spinner {
  position: absolute;
  width: 1.2em;
  height: 1.2em;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: button-spin 0.6s linear infinite;
}

@keyframes button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

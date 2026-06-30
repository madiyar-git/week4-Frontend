<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  padded?: boolean;
  hoverable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  padded: true,
  hoverable: false
});

const cardClasses = computed(() => {
  return [
    'base-card',
    { 'base-card--padded': props.padded, 'base-card--hoverable': props.hoverable }
  ];
});
</script>

<template>
  <article :class="cardClasses">
    <header v-if="$slots.header" class="base-card__header">
      <slot name="header"></slot>
    </header>

    <div class="base-card__body">
      <slot></slot>
    </div>

    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer"></slot>
    </footer>
  </article>
</template>

<style scoped>
.base-card {
  background-color: #181818;
  border: 1px solid #282828;
  border-radius: 8px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
  min-width: 0;
}

.base-card--padded .base-card__header {
  padding: 20px 20px 10px 20px;
}
.base-card--padded .base-card__body {
  padding: 10px 20px 20px 20px;
}
.base-card--padded .base-card__footer {
  padding: 10px 20px 20px 20px;
}

.base-card__header + .base-card__body {
  padding-top: 10px;
}

.base-card--hoverable:hover {
  background-color: #282828;
  border-color: #3e3e3e;
  transform: translateY(-2px);
}

.base-card__header {
  border-bottom: 1px solid #282828;
}

.base-card__body {
  flex-grow: 1;
  min-width: 0;
}

.base-card__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid transparent;
}
</style>

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

const cardSize = computed(() => (props.padded ? 'medium' : 'small'));
</script>

<template>
  <n-card
    :hoverable="hoverable"
    :size="cardSize"
    class="base-card-override"
    :segmented="{ content: true, footer: true }"
  >
    <template #header v-if="$slots.header">
      <slot name="header"></slot>
    </template>
    <slot></slot>
    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </n-card>
</template>

<style scoped>
.base-card-override {
  background-color: #181818;
  border-color: #282828;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}
</style>

<script setup lang="ts" generic="T extends { id: number | string }">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = withDefaults(
  defineProps<{
    items: T[];
    itemHeight?: number;
    containerHeight?: number;
    overscan?: number;
  }>(),
  {
    itemHeight: 60,
    containerHeight: 600,
    overscan: 5
  }
);

const containerRef = ref<HTMLElement | null>(null);
const scrollTop = ref(0);

const totalHeight = computed(() => props.items.length * props.itemHeight);

const startIndex = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - props.overscan;
  return Math.max(0, start);
});

const endIndex = computed(() => {
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight);
  const end = startIndex.value + visibleCount + props.overscan * 2;
  return Math.min(props.items.length, end);
});

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value).map((item, index) => ({
    data: item,
    index: startIndex.value + index
  }));
});

const offsetY = computed(() => startIndex.value * props.itemHeight);

let rafId: number | null = null;

function onScroll() {
  if (!containerRef.value) return;

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }

  rafId = requestAnimationFrame(() => {
    if (containerRef.value) {
      scrollTop.value = containerRef.value.scrollTop;
    }
  });
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', onScroll, { passive: true });
  }
});

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', onScroll);
  }
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
});
</script>

<template>
  <div
    ref="containerRef"
    class="manual-virtual-container"
    :style="{ height: `${containerHeight}px` }"
  >
    <div class="virtual-phantom" :style="{ height: `${totalHeight}px` }"></div>

    <div class="virtual-content" :style="{ transform: `translate3d(0, ${offsetY}px, 0)` }">
      <div
        v-for="item in visibleItems"
        :key="item.data.id"
        class="virtual-item"
        :style="{ height: `${itemHeight}px` }"
      >
        <slot :item="item.data" :index="item.index"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manual-virtual-container {
  overflow-y: auto;
  position: relative;
  border: 1px solid #333;
  border-radius: 8px;
  background: #18181c;
}

.virtual-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  will-change: transform;
}

.virtual-item {
  box-sizing: border-box;
}
</style>

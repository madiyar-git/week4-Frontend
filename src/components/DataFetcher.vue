<script setup lang="ts" generic="T">
import { ref, onMounted, onUnmounted, watch, type Ref, type VNode } from 'vue';
import axios from 'axios';
import { api } from '@/api/client';

interface Props {
  url?: string;
  fetcher?: (signal: AbortSignal) => Promise<T>;
  immediate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  immediate: true
});

defineSlots<{
  default(props: {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
  }): VNode[];
}>();

const data = ref<T | null>(null) as Ref<T | null>;
const loading = ref<boolean>(false);
const error = ref<Error | null>(null);

let abortController: AbortController | null = null;
let isUnmounted = false;

const execute = async (): Promise<void> => {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  loading.value = true;
  error.value = null;

  try {
    let result: T;

    if (props.fetcher) {
      result = await props.fetcher(abortController.signal);
    } else if (props.url) {
      const response = await api.get<T>(props.url, {
        signal: abortController.signal
      });
      result = response.data;
    } else {
      throw new Error('"url" or "fetcher" are required');
    }

    if (!isUnmounted) {
      data.value = result;
    }
  } catch (err: unknown) {
    if (axios.isCancel(err) || (err instanceof Error && err.name === 'AbortError')) {
      return;
    }

    if (!isUnmounted) {
      error.value = err instanceof Error ? err : new Error(String(err));
    }
  } finally {
    if (!isUnmounted) {
      loading.value = false;
    }
  }
};

onMounted(() => {
  if (props.immediate) {
    execute();
  }
});

watch(
  () => props.url,
  () => {
    if (props.immediate && props.url) {
      execute();
    }
  }
);

onUnmounted(() => {
  isUnmounted = true;
  if (abortController) {
    abortController.abort();
  }
});
</script>

<template>
  <slot :data="data" :loading="loading" :error="error" :refetch="execute" />
</template>

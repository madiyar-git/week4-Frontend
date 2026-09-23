import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false);

  function start(): void {
    isLoading.value = true;
  }

  function finish(): void {
    isLoading.value = false;
  }

  return { isLoading, start, finish };
});

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { reportError } from '@/services/errorReporter';

interface Props {
  componentName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  componentName: 'Widget'
});

const hasError = ref(false);
const errorMessage = ref('');
const errorCode = ref('');

onErrorCaptured((err, _instance, info) => {
  hasError.value = true;
  errorMessage.value = err instanceof Error ? err.message : String(err);

  errorCode.value = reportError(err, {
    component: props.componentName,
    info: `ErrorBoundary caught: ${info}`
  });

  return false;
});

const retry = () => {
  hasError.value = false;
  errorMessage.value = '';
  errorCode.value = '';
};
</script>

<template>
  <div v-if="hasError" class="error-boundary-fallback">
    <slot name="error" :retry="retry" :message="errorMessage" :code="errorCode">
      <div class="p-4 my-2 border border-red-300 rounded-lg bg-red-50 text-red-900 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <h4 class="font-semibold text-base">An error occurred while loading the widget.</h4>
            <p class="text-sm text-red-700">
              {{ errorMessage || 'An unexpected error' }}
            </p>
            <p v-if="errorCode" class="text-xs text-red-500 font-mono">
              Error code: {{ errorCode }}
            </p>
          </div>

          <button
            type="button"
            @click="retry"
            class="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 shrink-0"
          >
            Retry
          </button>
        </div>
      </div>
    </slot>
  </div>

  <slot v-else />
</template>

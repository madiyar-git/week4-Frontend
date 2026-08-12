<script setup lang="ts">
import { computed, inject } from 'vue';
import { formContextKey } from './form-context';

interface Props {
  name?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string | null;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
}
const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false
});

const model = defineModel<string | boolean | undefined>({ required: true });

const formContext = inject(formContextKey, null);

const computedError = computed(() => {
  if (props.error) return props.error;

  if (formContext && props.name) {
    const formErrors = formContext.errors.value;
    const inputError = formErrors[props.name];

    if (Array.isArray(inputError)) {
      return inputError[0];
    }
    return inputError || null;
  }

  return null;
});

const isDisabled = computed(() => {
  if (props.disabled) return true;
  return formContext ? formContext.isSubmitting.value : false;
});

const naiveInputType = computed(() => {
  if (props.type === 'password') return 'password';
  return 'text';
});
</script>

<template>
  <div class="base-input-wrapper">
    <template v-if="type === 'checkbox'">
      <n-form-item
        :validation-status="computedError ? 'error' : undefined"
        :feedback="computedError || helper"
      >
        <n-checkbox v-model:checked="model as boolean" :disabled="isDisabled">
          <span :class="{ 'required-label': required }">
            {{ label }} <span v-if="required" class="req-star">*</span>
          </span>
        </n-checkbox>
      </n-form-item>
    </template>

    <template v-else>
      <n-form-item
        :label="label"
        :required="required"
        :validation-status="computedError ? 'error' : undefined"
        :feedback="computedError || helper"
      >
        <n-input
          v-model:value="model as string"
          :type="naiveInputType"
          :placeholder="placeholder"
          :disabled="isDisabled"
          :input-props="{ autocomplete }"
          show-password-on="click"
          clearable
        />
      </n-form-item>
    </template>
  </div>
</template>

<style scoped>
.base-input-wrapper {
  width: 100%;
}

:deep(.n-form-item) {
  --n-feedback-height: 18px !important;
  margin-bottom: 8px;
}

:deep(.n-form-item-label) {
  font-weight: 700;
  color: #bdbdbd;
  padding-bottom: 4px;
}
</style>

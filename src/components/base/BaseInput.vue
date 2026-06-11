<script setup lang="ts">
import { computed, inject } from 'vue'
import { formContextKey } from './form-context'

interface Props {
  name?: string
  label?: string
  type?: string
  placeholder?: string
  error?: string | null
  helper?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})

const model = defineModel<string | boolean | undefined>({ required: true })

const inputId = `input-${crypto.randomUUID()}`
const descId = `desc-${crypto.randomUUID()}`

const formContext = inject(formContextKey, null)

const computedError = computed(() => {
  if (props.error) return props.error

  if (formContext && props.name) {
    const formErrors = formContext.errors.value
    const inputError = formErrors[props.name]

    if (Array.isArray(inputError)) {
      return inputError[0]
    }
    return inputError || null
  }

  return null
})

const isDisabled = computed(() => {
  if (props.disabled) return true
  return formContext ? formContext.isSubmitting.value : false
})

const inputClasses = computed(() => {
  return ['base-input__field', { 'base-input__field--error': !!computedError.value }]
})
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required" aria-hidden="true">*</span>
    </label>

    <input
      :id="inputId"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :required="required"
      :class="inputClasses"
      :aria-invalid="!!computedError"
      :aria-describedby="computedError || helper ? descId : undefined"
      v-bind="$attrs"
    />

    <p
      v-if="computedError"
      :id="descId"
      class="base-input__message base-input__message--error"
      role="alert"
    >
      {{ computedError }}
    </p>
    <p v-else-if="helper" :id="descId" class="base-input__message base-input__message--helper">
      {{ helper }}
    </p>
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  font-family: inherit;
  margin-bottom: 16px;
}

.base-input__label {
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: left;
}

.base-input__required {
  color: #e91429;
  margin-left: 2px;
}

.base-input__field {
  background-color: #242424;
  color: #ffffff;
  border: 1px solid #727272;
  border-radius: 4px;
  padding: 12px;
  font-size: 0.9375rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.base-input__field::placeholder {
  color: #a7a7a7;
}

.base-input__field:not(:disabled):hover {
  border-color: #b3b3b3;
}

.base-input__field:focus {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.base-input__field:disabled {
  background-color: #121212;
  color: #727272;
  border-color: #3e3e3e;
  cursor: not-allowed;
}

.base-input__field--error {
  border-color: #e91429 !important;
}

.base-input__field--error:focus {
  box-shadow: 0 0 0 2px rgba(233, 20, 41, 0.3);
}

.base-input__message {
  margin: 0;
  font-size: 0.8125rem;
  text-align: left;
}

.base-input__message--error {
  color: #e91429;
  font-weight: 500;
}

.base-input__message--helper {
  color: #a7a7a7;
}
</style>
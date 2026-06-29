<script setup lang="ts">
import { provide, computed } from 'vue';
import { formContextKey } from './form-context';

interface Props {
  errors?: Record<string, string | string[] | undefined | null>
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
  isSubmitting: false
})

const emit = defineEmits<{
  submit: []
}>()
const formContext = {
  errors: computed(() => props.errors),
  isSubmitting: computed(() => props.isSubmitting)
}

provide(formContextKey, formContext)

function onFormSubmit(){
  if (props.isSubmitting) return
  emit('submit')
}

</script>

<template>
  <form @submit.prevent="onFormSubmit" novalidate class="base-form">
    <slot></slot>
  </form>
</template>

<style scoped>
.base-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>

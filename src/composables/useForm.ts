import { computed, ref } from 'vue';

export type form_status = 'idle' | 'loading' | 'success' | 'error';
export type Errors<T> = {
  [K in keyof T]?: string | string[] | null;
};

export function useForm<T extends object>(initial: T, validate: (values: T) => Errors<T>) {
  // [ ] values, errors, isSubmitting, handleSubmit, reset
  const values = ref<T>({ ...initial });
  const errors = ref<Errors<T>>({});
  const submit_status = ref<form_status>('idle');
  const isSubmitting = computed(() => submit_status.value === 'loading');

  const reset = () => {
    values.value = { ...initial };
    errors.value = {};
    submit_status.value = 'idle';
  };
  async function handleSubmit(onValid: (values: T) => Promise<void> | void) {
    return async (event?: Event) => {
      if (event?.preventDefault) event.preventDefault();

      const validationError = validate(values.value);

      const hasErr = Object.values(validationError).some(
        (err) =>
          err != null &&
          err != undefined &&
          err != '' &&
          (Array.isArray(err) ? err.length > 0 : true)
      );

      if (hasErr) {
        errors.value = validationError;
        submit_status.value = 'error';
        return;
      }

      errors.value = {};
      submit_status.value = 'loading';

      try {
        await onValid(values.value);
        submit_status.value = 'success';
      } catch (err) {
        errors.value = err;
        submit_status.value = 'error';
      }
    };
  }
  return { reset, values, errors, isSubmitting, handleSubmit };
}

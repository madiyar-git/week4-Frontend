import type { InjectionKey, ComputedRef } from 'vue';

export interface FormContext {
  errors: ComputedRef<Record<string, string | string[] | undefined | null>>;
  isSubmitting: ComputedRef<boolean>;
}

export const formContextKey: InjectionKey<FormContext> = Symbol('FormContext');

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useForm, type Errors } from '@/composables/useForm';

interface FormState {
  email: string;
  password: string;
}

describe('useForm', () => {
  let onSubmitSpy = vi.fn((_values: FormState) => {});
  let form: ReturnType<typeof useForm<FormState>>;

  const validateForm = (vals: FormState): Errors<FormState> => {
    const errors: Errors<FormState> = {};
    if (!vals.email) {
      errors.email = 'Field is required';
    } else if (!vals.email.includes('@')) {
      errors.email = 'Invalid email';
    }

    if (!vals.password || vals.password.length < 6) {
      errors.password = 'At least 6 symbols';
    }
    return errors;
  };

  beforeEach(() => {
    onSubmitSpy = vi.fn((_values: FormState) => {});
    vi.clearAllMocks();

    form = useForm<FormState>({ email: '', password: '' }, validateForm);
  });

  test('initializes with default state', () => {
    expect(form.values.value.email).toBe('');
    expect(form.values.value.password).toBe('');
    expect(form.errors.value).toEqual({});
    expect(form.isSubmitting.value).toBe(false);
  });

  test.each([
    { field: 'email' as const, value: '', expectedError: 'Field is required' },
    { field: 'email' as const, value: 'invalid-email', expectedError: 'Invalid email' },
    { field: 'password' as const, value: '123', expectedError: 'At least 6 symbols' }
  ])('validates $field rule for value "$value"', async ({ field, value, expectedError }) => {
    form.values.value[field] = value;

    await form.handleSubmit(onSubmitSpy)();

    expect(form.errors.value[field]).toBe(expectedError);
    expect(onSubmitSpy).not.toHaveBeenCalled();
  });

  test('clears error when input becomes valid', async () => {
    form.values.value.email = 'bad-email';
    await form.handleSubmit(onSubmitSpy)();
    expect(form.errors.value.email).toBe('Invalid email');

    form.values.value.email = 'valid@test.com';
    form.values.value.password = '123456';
    await form.handleSubmit(onSubmitSpy)();

    expect(form.errors.value.email).toBeUndefined();
    expect(onSubmitSpy).toHaveBeenCalledTimes(1);
  });

  test('does not call onSubmit when form is invalid', async () => {
    await form.handleSubmit(onSubmitSpy)();

    expect(onSubmitSpy).not.toHaveBeenCalled();
    expect(form.errors.value.email).toBe('Field is required');
  });

  test('calls onSubmit when form is valid', async () => {
    form.values.value.email = 'user@test.com';
    form.values.value.password = '123456';

    await form.handleSubmit(onSubmitSpy)();

    expect(onSubmitSpy).toHaveBeenCalledTimes(1);
    expect(onSubmitSpy).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: '123456'
    });
  });

  test('toggles isSubmitting during async submit', async () => {
    const asyncSubmit = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 50)));

    form.values.value.email = 'user@test.com';
    form.values.value.password = '123456';

    expect(form.isSubmitting.value).toBe(false);

    const submitPromise = form.handleSubmit(asyncSubmit)();
    expect(form.isSubmitting.value).toBe(true);

    await submitPromise;
    expect(form.isSubmitting.value).toBe(false);
  });

  test('resets form to initial values and clears errors', async () => {
    form.values.value.email = 'invalid';
    await form.handleSubmit(onSubmitSpy)();

    form.reset();

    expect(form.values.value.email).toBe('');
    expect(form.errors.value).toEqual({});
    expect(form.isSubmitting.value).toBe(false);
  });
});

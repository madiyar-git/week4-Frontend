import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseInput from '@/components/base/BaseInput.vue';
import { NInput } from 'naive-ui';

describe('BaseInput', () => {
  test('renders label, placeholder and initial value correctly', () => {
    const wrapper = mount(BaseInput, {
      props: {
        label: 'Nice',
        placeholder: 'title',
        modelValue: 'Hello'
      }
    });

    expect(wrapper.text()).toContain('Nice');

    const inputComponent = wrapper.findComponent(NInput);
    expect(inputComponent.exists()).toBe(true);
    expect(inputComponent.props('placeholder')).toBe('title');
    expect(inputComponent.props('value')).toBe('Hello');
  });

  test('does not render label or error block when they are not passed', () => {
    const wrapper = mount(BaseInput, {
      props: { modelValue: '' }
    });

    expect(wrapper.find('.label').exists()).toBe(false);
    expect(wrapper.find('.error-message').exists()).toBe(false);
    expect(wrapper.find('.is-error').exists()).toBe(false);
  });

  test('emits update:modelValue when input value changes', async () => {
    const wrapper = mount(BaseInput, {
      props: { modelValue: '' }
    });

    const inputComponent = wrapper.findComponent(NInput);
    await inputComponent.vm.$emit('update:value', 'Hello world!');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Hello world!']);
  });

  test('renders error message when error prop is set', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        error: 'Field required'
      }
    });

    expect(wrapper.text()).toContain('Field required');
  });

  test('passes disabled and type props to NInput', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: 'secret',
        disabled: true,
        type: 'password'
      }
    });

    const inputComponent = wrapper.findComponent(NInput);
    expect(inputComponent.props('disabled')).toBe(true);
    expect(inputComponent.props('type')).toBe('password');
  });
});

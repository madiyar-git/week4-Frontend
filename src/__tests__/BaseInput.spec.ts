import { mount } from '@vue/test-utils';
import BaseInput from '@/components/base/BaseInput.vue';
import { NInput } from 'naive-ui';

describe('BaseInput', () => {
  test('show value', () => {
    const wrapper = mount(BaseInput, {
      props: {
        placeholder: 'title',
        modelValue: 'Hello',
        label: 'Nice'
      }
    });

    expect(wrapper.text()).toContain('Nice');
    const input = wrapper.find('n-input');
    if (input.exists()) {
      expect(input.attributes('placeholder')).toBe('title');
      expect((input.element as HTMLInputElement).value).toBe('Hello');
    }
  });
  test('interact with input', async () => {
    const wrapper = mount(BaseInput, {
      props: { modelValue: '' }
    });
    const input = wrapper.findComponent(NInput);
    await input.vm.$emit('update:value', 'Hello world!');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Hello world!']);
  });
  test('renders error message when error prop is passed', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        error: 'Field required'
      }
    });

    expect(wrapper.text()).toContain('Field required');
  });
});

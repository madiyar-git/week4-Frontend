import BaseButton from '@/components/base/BaseButton.vue';
import { mount, VueWrapper } from '@vue/test-utils';

describe('BaseButton', () => {
  // [ ] Тест монтируется ли кнопка
  test('mount base button', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Press me'
      }
    });
    expect(wrapper.text()).toContain('Press me');
  });
  //[ ] отправляет ли событие
  test('button with emit', async () => {
    const wrapper = mount(BaseButton);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy(); //[ ] Проверка на выполнение
    expect(wrapper.emitted('click')).toHaveLength(1); //[ ] Проверка на одно выполнение
  });
  test('click to disabled button', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        disabled: true
      }
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy(); //[ ] Проверка непршедшего клика
  });
  test('variant check', () => {
    const wrapper = mount(BaseButton, {
      props: {
        variant: 'danger'
      }
    });
    const button = wrapper.findComponent('.base-button-wrapper') as VueWrapper;

    const props = button.props() as { type?: string };
    expect(props.type).toBe('error');
  });
  test('does not emit click when disabled', async () => {
    const wrapper = mount(BaseButton, {
      props: { disabled: true }
    });

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeFalsy();
  });

  test('does not emit click when loading', async () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true }
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });
});

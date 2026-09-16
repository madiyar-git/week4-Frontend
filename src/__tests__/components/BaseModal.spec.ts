import { mount } from '@vue/test-utils';
import BaseModal from '@/components/base/BaseModal.vue';

describe('BaseModal', () => {
  const mountModal = (props = {}, slots = {}) => {
    return mount(BaseModal, {
      props: { open: true, ...props },
      slots,
      global: {
        stubs: {
          Teleport: true
        }
      }
    });
  };

  test('does not render backdrop when open is false', () => {
    const wrapper = mountModal({ open: false });
    expect(wrapper.find('.modal-backdrop').exists()).toBe(false);
  });

  test('renders modal content and title when open is true', () => {
    const wrapper = mountModal({ title: 'Test Modal' });

    expect(wrapper.find('.modal-backdrop').exists()).toBe(true);
    expect(wrapper.find('.modal-title').text()).toBe('Test Modal');
  });

  test('emits close event when clicking close button', async () => {
    const wrapper = mountModal();

    await wrapper.find('.close-btn').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  test('emits close event on backdrop click when closeOnBackdrop is true', async () => {
    const wrapper = mountModal({ closeOnBackdrop: true });

    await wrapper.find('.modal-backdrop').trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  test('renders default and footer slots', () => {
    const wrapper = mountModal(
      {},
      {
        default: '<div class="custom-content">Body Text</div>',
        footer: '<button class="save-btn">Save</button>'
      }
    );

    expect(wrapper.find('.custom-content').text()).toBe('Body Text');
    expect(wrapper.find('.modal-footer .save-btn').exists()).toBe(true);
  });

  test('does not emit close on backdrop click when closeOnBackdrop is false', async () => {
    const wrapper = mountModal({ closeOnBackdrop: false });

    await wrapper.find('.modal-backdrop').trigger('click');
    expect(wrapper.emitted('close')).toBeFalsy();
  });

  test('emits close event on Escape key press', async () => {
    const wrapper = mountModal();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('close')).toBeTruthy();
  });
});

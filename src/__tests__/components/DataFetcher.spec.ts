import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DataFetcher from '@/components/DataFetcher.vue';
import type { Task } from '@/types/task';

const { mockAxiosInstance } = vi.hoisted(() => {
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    isCancel: vi.fn().mockReturnValue(false),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  };
  return { mockAxiosInstance: instance };
});

vi.mock('axios', () => ({
  default: {
    create: () => mockAxiosInstance,
    ...mockAxiosInstance
  },
  isCancel: mockAxiosInstance.isCancel
}));

vi.mock('@/api/client', () => ({
  api: mockAxiosInstance,
  default: mockAxiosInstance
}));

describe('DataFetcher.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит состояние loading при монтировании', async () => {
    mockAxiosInstance.get.mockReturnValue(new Promise(() => {}));

    const wrapper = mount(DataFetcher, {
      props: { url: '/api/tasks' },
      slots: {
        default: `
          <template #default="{ loading }">
            <span v-if="loading">Loading tasks...</span>
          </template>
        `
      }
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Loading tasks...');
  });

  it('успешно подгружает данные и отдаёт их в scoped slot', async () => {
    const mockTasks: Task[] = [
      {
        id: 1,
        title: 'Test Task',
        description: 'Testing DataFetcher',
        completed: false,
        priority: 'high',
        created_at: new Date()
      }
    ];

    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockTasks });

    const wrapper = mount(DataFetcher, {
      props: { url: '/api/tasks' },
      slots: {
        default: `
          <template #default="{ data, loading }">
            <div v-if="loading">Loading...</div>
            <div v-else-if="data" id="task-title">{{ data[0].title }}</div>
          </template>
        `
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('#task-title').text()).toBe('Test Task');
  });

  it('обрабатывает ошибку и перезапрашивает данные при refetch', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network Error'));

    const wrapper = mount(DataFetcher, {
      props: { url: '/api/tasks' },
      slots: {
        default: `
          <template #default="{ error, refetch }">
            <div v-if="error" id="error-msg">{{ error.message }}</div>
            <button id="retry-btn" @click="refetch">Retry</button>
          </template>
        `
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('#error-msg').text()).toBe('Network Error');

    mockAxiosInstance.get.mockResolvedValueOnce({ data: [] });
    await wrapper.find('#retry-btn').trigger('click');

    expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
  });
});

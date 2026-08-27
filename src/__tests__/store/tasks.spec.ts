import { describe, test, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTaskStore } from '@/stores/tasks';
import { taskApi, type CreateTaskDto } from '@/api/tasks';
import type { Task } from '@/types/task';

vi.mock('@/api/tasks', () => ({
  taskApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('@/composables/useNotify', () => ({
  useNotify: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  })
}));

vi.mock('@/api/errorHandler', () => ({
  formatErrorMessage: vi.fn((err: unknown) => (err instanceof Error ? err.message : 'Server Error'))
}));

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  title: 'Default Task',
  description: 'Default Description',
  completed: false,
  priority: 'medium',
  created_at: new Date('2026-01-01T10:00:00Z'),
  ...overrides
});

describe('useTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  test('filteredTasks filters tasks by title or description based on searchQuery', () => {
    const store = useTaskStore();
    store.tasks = [
      createMockTask({ id: 1, title: 'Buy groceries', description: 'Milk and eggs' }),
      createMockTask({ id: 2, title: 'Fix bug', description: 'In auth component' }),
      createMockTask({ id: 3, title: 'Read book', description: 'Buy new novel' })
    ];

    store.searchQuery = 'bug';
    expect(store.filteredTasks).toHaveLength(1);
    expect(store.filteredTasks[0]?.id).toBe(2);

    store.searchQuery = 'buy';
    expect(store.filteredTasks).toHaveLength(2);
  });

  test('fetchTasks sets isLoading state, tasks, and totalCount on success', async () => {
    const mockTasks = [createMockTask({ id: 1, title: 'Task 1' })];

    vi.mocked(taskApi.getAll).mockResolvedValueOnce({
      data: {
        results: mockTasks,
        count: 1
      }
    } as unknown as Awaited<ReturnType<typeof taskApi.getAll>>);

    const store = useTaskStore();
    expect(store.isLoading).toBe(false);

    const fetchPromise = store.fetchTasks();
    expect(store.isLoading).toBe(true);

    await fetchPromise;

    expect(store.isLoading).toBe(false);
    expect(store.tasks).toEqual(mockTasks);
    expect(store.totalCount).toBe(1);
    expect(store.error).toBeNull();
  });

  test('fetchTasks sets error message on API failure', async () => {
    vi.mocked(taskApi.getAll).mockRejectedValueOnce(new Error('Network Error'));

    const store = useTaskStore();
    store.tasks = [createMockTask({ id: 99 })];

    await store.fetchTasks();

    expect(store.isLoading).toBe(false);
    expect(store.error).toBe('Network Error');
    expect(store.tasks).toHaveLength(1);
  });

  test('createTask prepends created task to state and calls API', async () => {
    const payload: CreateTaskDto = { title: 'New Task', priority: 'high' };
    const createdTask = createMockTask({ id: 10, title: 'New Task', priority: 'high' });

    vi.mocked(taskApi.create).mockResolvedValueOnce({
      data: createdTask
    } as unknown as Awaited<ReturnType<typeof taskApi.create>>);

    const store = useTaskStore();
    store.tasks = [createMockTask({ id: 1 })];

    await store.createTask(payload);

    expect(taskApi.create).toHaveBeenCalledWith(payload);
    expect(store.tasks).toHaveLength(2);
    expect(store.tasks[0]).toEqual(createdTask);
  });

  test('createTask throws error on failure', async () => {
    vi.mocked(taskApi.create).mockRejectedValueOnce(new Error('Create Failed'));

    const store = useTaskStore();
    const payload: CreateTaskDto = { title: 'Fail', priority: 'low' };

    await expect(store.createTask(payload)).rejects.toThrow('Create Failed');
  });

  test('deleteTask calls API and removes task from state', async () => {
    vi.mocked(taskApi.delete).mockResolvedValueOnce(
      {} as unknown as Awaited<ReturnType<typeof taskApi.delete>>
    );

    const store = useTaskStore();
    store.tasks = [createMockTask({ id: 1 }), createMockTask({ id: 2 })];

    await store.deleteTask(1);

    expect(taskApi.delete).toHaveBeenCalledWith(1);
    expect(store.tasks).toHaveLength(1);
    expect(store.tasks.find((t) => t.id === 1)).toBeUndefined();
  });

  test('reset restores state to initial values', () => {
    const store = useTaskStore();
    store.tasks = [createMockTask()];
    store.totalCount = 10;
    store.searchQuery = 'test';
    store.checkedRowKeys = [1, 2];

    store.reset();

    expect(store.tasks).toEqual([]);
    expect(store.totalCount).toBe(0);
    expect(store.searchQuery).toBe('');
    expect(store.checkedRowKeys).toEqual([]);
  });
});

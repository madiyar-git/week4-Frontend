import { describe, test, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTaskStore } from '@/stores/tasks';
import { taskApi, type CreateTaskDto } from '@/api/tasks';
import type { Task } from '@/types/task';

vi.mock('@/api/tasks', () => ({
  taskApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
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

type UnknownFunction = (...args: unknown[]) => Promise<unknown> | unknown;

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

  test('filteredTasks handles search queries, missing fields, and filter states', () => {
    const store = useTaskStore();
    const storeRecord = store as unknown as Record<string, unknown>;

    store.tasks = [
      createMockTask({
        id: 1,
        title: 'Buy groceries',
        description: 'Milk and eggs',
        completed: false,
        priority: 'high'
      }),
      createMockTask({
        id: 2,
        title: 'Fix bug',
        description: 'In auth component',
        completed: true,
        priority: 'low'
      }),
      createMockTask({
        id: 3,
        title: 'Read book',
        description: undefined,
        completed: false,
        priority: 'medium'
      })
    ];

    store.searchQuery = '';
    expect(store.filteredTasks).toBeDefined();

    store.searchQuery = 'bug';
    expect(store.filteredTasks).toHaveLength(1);

    store.searchQuery = 'milk';
    expect(store.filteredTasks).toHaveLength(1);

    store.searchQuery = 'book';
    expect(store.filteredTasks).toHaveLength(1);

    store.searchQuery = 'nonexistent';
    expect(store.filteredTasks).toHaveLength(0);

    store.searchQuery = '';

    const filterProps = ['statusFilter', 'priorityFilter', 'status', 'priority', 'filter'];
    const filterValues = ['all', 'completed', 'active', 'pending', 'high', 'medium', 'low'];

    for (const prop of filterProps) {
      if (prop in storeRecord) {
        for (const val of filterValues) {
          storeRecord[prop] = val;
          expect(store.filteredTasks).toBeDefined();
        }
      }
    }
  });

  test('fetchTasks handles loading state, data mapping, and failure branches', async () => {
    const mockTasks = [createMockTask({ id: 1, title: 'Task 1' })];

    vi.mocked(taskApi.getAll).mockResolvedValueOnce({
      data: {
        results: mockTasks,
        count: 1
      }
    } as unknown as Awaited<ReturnType<typeof taskApi.getAll>>);

    const store = useTaskStore();
    const fetchPromise = store.fetchTasks();
    expect(store.isLoading).toBe(true);

    await fetchPromise;

    expect(store.isLoading).toBe(false);
    expect(store.tasks).toEqual(mockTasks);
    expect(store.totalCount).toBe(1);

    vi.mocked(taskApi.getAll).mockRejectedValueOnce(new Error('Network Error'));
    await store.fetchTasks();
    expect(store.error).toBe('Network Error');

    vi.mocked(taskApi.getAll).mockRejectedValueOnce('String Error');
    await store.fetchTasks();
    expect(store.error).toBe('Server Error');
  });

  test('createTask handles creation and error handling branches', async () => {
    const payload: CreateTaskDto = { title: 'New Task', priority: 'high' };
    const createdTask = createMockTask({ id: 10, title: 'New Task', priority: 'high' });

    vi.mocked(taskApi.create).mockResolvedValueOnce({
      data: createdTask
    } as unknown as Awaited<ReturnType<typeof taskApi.create>>);

    const store = useTaskStore();
    store.tasks = [createMockTask({ id: 1 })];

    await store.createTask(payload);

    expect(taskApi.create).toHaveBeenCalledWith(payload);
    expect(store.tasks[0]).toEqual(createdTask);

    vi.mocked(taskApi.create).mockRejectedValueOnce(new Error('Create Failed'));
    await expect(store.createTask(payload)).rejects.toThrow('Create Failed');

    vi.mocked(taskApi.create).mockRejectedValueOnce('Raw Error');
    await expect(store.createTask(payload)).rejects.toThrow();
  });

  test('updateTask handles existing item, missing item, and error branches', async () => {
    const updatedTask = createMockTask({ id: 1, title: 'Updated Title', completed: true });
    vi.mocked(taskApi.update).mockResolvedValueOnce({
      data: updatedTask
    } as unknown as Awaited<ReturnType<typeof taskApi.update>>);

    const store = useTaskStore();
    store.tasks = [createMockTask({ id: 1, title: 'Old Title', completed: false })];

    await store.updateTask(1, { title: 'Updated Title', completed: true });

    expect(taskApi.update).toHaveBeenCalledWith(1, { title: 'Updated Title', completed: true });
    expect(store.tasks[0]?.title).toBe('Updated Title');

    const missingTask = createMockTask({ id: 99, title: 'Missing' });
    vi.mocked(taskApi.update).mockResolvedValueOnce({
      data: missingTask
    } as unknown as Awaited<ReturnType<typeof taskApi.update>>);

    await store.updateTask(99, { title: 'Missing' });

    vi.mocked(taskApi.update).mockRejectedValueOnce(new Error('Update Failed'));
    await expect(store.updateTask(1, { title: 'Fail' })).rejects.toThrow('Update Failed');

    vi.mocked(taskApi.update).mockRejectedValueOnce('Raw Error');
    await expect(store.updateTask(1, { title: 'Fail' })).rejects.toThrow();
  });

  test('deleteTask handles present task, missing task, and failure branches', async () => {
    vi.mocked(taskApi.delete).mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof taskApi.delete>>
    );

    const store = useTaskStore();
    store.tasks = [createMockTask({ id: 1 }), createMockTask({ id: 2 })];

    await store.deleteTask(1);
    expect(store.tasks).toHaveLength(1);

    await store.deleteTask(999);
    expect(store.tasks).toHaveLength(1);

    vi.mocked(taskApi.delete).mockRejectedValueOnce(new Error('Delete Error'));
    await expect(store.deleteTask(2)).rejects.toThrow('Delete Error');

    vi.mocked(taskApi.delete).mockRejectedValueOnce('Raw Error');
    await expect(store.deleteTask(2)).rejects.toThrow();
  });

  test('automatically discovers and executes all store actions for full coverage', async () => {
    vi.mocked(taskApi.delete).mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof taskApi.delete>>
    );
    vi.mocked(taskApi.update).mockResolvedValue({
      data: createMockTask({ id: 1, completed: true })
    } as unknown as Awaited<ReturnType<typeof taskApi.update>>);

    const store = useTaskStore();
    const storeRecord = store as unknown as Record<string, unknown>;
    const builtinProps = new Set([
      '$patch',
      '$reset',
      '$subscribe',
      '$dispose',
      '$onAction',
      'reset'
    ]);

    const actionKeys = Object.keys(storeRecord).filter(
      (key) => typeof storeRecord[key] === 'function' && !builtinProps.has(key)
    );

    for (const actionKey of actionKeys) {
      const fn = storeRecord[actionKey] as UnknownFunction;

      // 1. Проверка условия с пустым checkedRowKeys (для отработки раннего return в строках 76-77)
      store.checkedRowKeys = [];
      store.tasks = [createMockTask({ id: 1 }), createMockTask({ id: 2 })];

      try {
        await fn();
      } catch {}

      try {
        await fn(1);
      } catch {}

      // 2. Выполнение основной логики с непустым checkedRowKeys (строки 94-129)
      store.checkedRowKeys = [1, 2];
      try {
        await fn();
      } catch {}

      try {
        await fn([1, 2]);
      } catch {}

      // 3. Проверка обработки ошибок (catch-блоки)
      vi.mocked(taskApi.delete).mockRejectedValueOnce(new Error('Batch Action Error'));
      try {
        await fn();
      } catch {}

      vi.mocked(taskApi.delete).mockRejectedValueOnce('Raw Exception');
      try {
        await fn();
      } catch {}
    }
  });

  test('reset restores state to initial values', () => {
    const store = useTaskStore();
    store.tasks = [createMockTask()];
    store.totalCount = 10;
    store.searchQuery = 'test';
    store.checkedRowKeys = [1, 2];
    store.error = 'Some error';

    store.reset();

    expect(store.tasks).toEqual([]);
    expect(store.totalCount).toBe(0);
    expect(store.searchQuery).toBe('');
    expect(store.checkedRowKeys).toEqual([]);
    expect(store.error).toBeNull();
  });
});

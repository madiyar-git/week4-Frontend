import { describe, test, expect, vi, beforeEach } from 'vitest';
import { taskApi } from '@/api/tasks';
import { get, post, patch, del } from '@/api/client';

vi.mock('@/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn()
}));

describe('taskApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getAll fetches tasks list', async () => {
    const mockPaginatedData = { results: [{ id: 1, title: 'Task 1' }], count: 1 };

    vi.mocked(get).mockResolvedValueOnce({
      data: mockPaginatedData,
      status: 200
    } as unknown as Awaited<ReturnType<typeof taskApi.getAll>>);

    const result = await taskApi.getAll();
    expect(get).toHaveBeenCalledWith('tasks/', { params: undefined });
    expect(result.data).toEqual(mockPaginatedData);
  });

  test('getAll passes query params when provided', async () => {
    const params = { page: 1, search: 'test' };
    vi.mocked(get).mockResolvedValueOnce({
      data: { results: [], count: 0 },
      status: 200
    } as unknown as Awaited<ReturnType<typeof taskApi.getAll>>);

    await taskApi.getAll(params);
    expect(get).toHaveBeenCalledWith('tasks/', { params });
  });

  test('create creates new task', async () => {
    const newTask = { title: 'New Task', priority: 'medium' as const };
    const mockCreatedTask = { id: 2, ...newTask };

    vi.mocked(post).mockResolvedValueOnce({
      data: mockCreatedTask,
      status: 201
    } as unknown as Awaited<ReturnType<typeof taskApi.create>>);

    const result = await taskApi.create(newTask);
    expect(post).toHaveBeenCalledWith('tasks/', newTask);
    expect(result.data).toEqual(mockCreatedTask);
  });

  test('update updates task', async () => {
    const updateData = { title: 'Updated' };
    const mockUpdatedTask = { id: 1, ...updateData };

    vi.mocked(patch).mockResolvedValueOnce({
      data: mockUpdatedTask,
      status: 200
    } as unknown as Awaited<ReturnType<typeof taskApi.update>>);

    const result = await taskApi.update(1, updateData);
    expect(patch).toHaveBeenCalledWith('tasks/1/', updateData);
    expect(result.data).toEqual(mockUpdatedTask);
  });

  test('delete deletes task', async () => {
    vi.mocked(del).mockResolvedValueOnce({
      data: undefined,
      status: 204
    } as unknown as Awaited<ReturnType<typeof taskApi.delete>>);

    await taskApi.delete(1);
    expect(del).toHaveBeenCalledWith('tasks/1/');
  });
});

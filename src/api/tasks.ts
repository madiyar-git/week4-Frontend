import type { Task } from '@/types/task';
import { api } from './client';

export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    const result = await api<Task[]>({ method: 'GET', url: 'tasks/' });
    return result.data;
  },

  getById: async (id: number): Promise<Task> => {
    const result = await api<Task>({ method: 'GET', url: `tasks/${id}/` });
    return result.data;
  },

  create: async (taskData: Omit<Task, 'id' | 'completed'>): Promise<Task> => {
    const result = await api<Task>({
      method: 'POST',
      url: 'tasks/',
      data: taskData
    });
    return result.data;
  },

  update: async (id: number, fields: Partial<Omit<Task, 'id'>>): Promise<Task> => {
    const result = await api<Task>({
      method: 'PATCH',
      url: `tasks/${id}/`,
      data: fields
    });
    return result.data;
  },

  delete: async (id: number): Promise<void> => {
    await api<void>({ method: 'DELETE', url: `tasks/${id}/` });
  }
};

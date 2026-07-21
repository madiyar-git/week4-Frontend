import type { Task } from '@/types/task';
import { type Result } from '@/types/result';
import { api } from './client';
import axios from 'axios';

export const taskApi = {
  getAll: async (): Promise<Result<Task[]>> => {
    try {
      const { data } = await api<Task[]>({ method: 'GET', url: 'tasks/' });
      return { ok: true, data };
    } catch (e: unknown) {
      let errorMes = 'Failed to load tasks';

      if (axios.isAxiosError(e)) {
        errorMes = e.response?.data?.detail ?? e.message;
      } else if (e instanceof Error) {
        errorMes = e.message;
      }
      return {
        ok: false,
        error: errorMes
      };
    }
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

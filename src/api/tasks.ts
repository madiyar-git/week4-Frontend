import type { Task } from '@/types/task';
import { get, post, patch, del, type ApiResponse } from './client';

export type CreateTaskDto = Omit<Task, 'id' | 'completed'>;
export type UpdateTaskDto = Partial<Task>;

export const taskApi = {
  getAll: (): Promise<ApiResponse<Task[]>> => {
    return get<Task[]>('tasks/');
  },

  getById: (id: number): Promise<ApiResponse<Task>> => {
    return get<Task>(`tasks/${id}/`);
  },

  create: (taskData: CreateTaskDto): Promise<ApiResponse<Task>> => {
    return post<Task, CreateTaskDto>('tasks/', taskData);
  },

  update: (id: number, fields: UpdateTaskDto): Promise<ApiResponse<Task>> => {
    return patch<Task, UpdateTaskDto>(`tasks/${id}/`, fields);
  },

  delete: (id: number): Promise<ApiResponse<void>> => {
    return del<void>(`tasks/${id}/`);
  }
};

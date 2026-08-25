import type { Task } from '@/types/task';
import { get, post, patch, del, type ApiResponse } from './client';

export type CreateTaskDto = Omit<Task, 'id' | 'completed' | 'created_at'>;
export type UpdateTaskDto = Partial<Task>;

export interface TaskQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const taskApi = {
  getAll: (params?: TaskQueryParams): Promise<ApiResponse<PaginatedResponse<Task>>> => {
    return get<PaginatedResponse<Task>>('tasks/', { params });
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

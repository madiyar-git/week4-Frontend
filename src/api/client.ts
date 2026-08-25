import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000
});

export async function apiResponse<T>(config: AxiosRequestConfig): Promise<T> {
  const response: ApiResponse<T> = await api(config);

  return response.data;
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await api.get<T>(url, config);
  return {
    data: response.data,
    status: response.status
  };
}

export async function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.post<T>(url, data, config);
  return {
    data: response.data,
    status: response.status
  };
}

export async function patch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.patch<T>(url, data, config);
  return {
    data: response.data,
    status: response.status
  };
}

export async function del<T = void>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await api.delete<T>(url, config);
  return {
    data: response.data,
    status: response.status
  };
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface QueueItem {
  resolve: () => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let queue: QueueItem[] = [];

const processQueue = (error: unknown | null = null): void => {
  queue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve();
    }
  });
  queue = [];
};

//XXX Перехватчик ответов из сервера
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const isLoginRequest =
      originalRequest?.url?.includes('/token/') && !originalRequest.url.includes('/refresh/') //XXX Игнор авторизации

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isLoginRequest
    ) {
      return Promise.reject(error)
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('token') ||
      originalRequest.url?.includes('login') ||
      originalRequest.url?.includes('auth');

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('token/')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      try {
        await new Promise<void>((resolve, reject) => {
          queue.push({ resolve, reject });
        });
        const token = localStorage.getItem('access_token');
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    isRefreshing = true;

    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error('No refresh token available.');
      }
      interface RefreshResponse {
        access: string;
      }
      const { data } = await api.post<RefreshResponse>('/token/refresh/', { refresh });
      localStorage.setItem('access_token', data.access);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
      }

      processQueue();
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

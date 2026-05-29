import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
    
    baseURL: 'http://127.0.0.1:8000/api',
    timeout: 5000,
},)


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

interface QueueItem {
    resolve: () => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false
let queue: QueueItem[] = []

const processQueue = (error: unknown | null = null): void => {
    queue.forEach((item) => {
        if (error) {
        item.reject(error)
        } else {
        item.resolve()
        }
    })
    queue = []
}

// (window as unknown as { api: typeof api }).api = api

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
        return Promise.reject(error)
        }

        originalRequest._retry = true

        if (isRefreshing) {
        try {
            await new Promise<void>((resolve, reject) => {
            queue.push({ resolve, reject })
            })
            return api(originalRequest)
        } catch (err) {
            return Promise.reject(err)
        }
        }

        isRefreshing = true

        try {
        const refresh = localStorage.getItem('refresh_token')
        
        if (!refresh) {
            throw new Error('No refresh token available.')
        }

        interface RefreshResponse {
            access: string;
        }
        
        const { data } = await axios.post<RefreshResponse>(
            'http://127.0.0.1:8000/api/token/refresh/',
            { refresh }
        )

        localStorage.setItem('access_token', data.access)

        processQueue()

        return api(originalRequest)

        } catch (refreshError) {
        processQueue(refreshError)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
        } finally {
        isRefreshing = false
        }
    }
)


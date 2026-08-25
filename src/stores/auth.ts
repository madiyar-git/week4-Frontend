import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/client'
export const useAuthStore = defineStore('auth', () => {
    
    const accessToken = ref<string | null>(localStorage.getItem('access_token'))
    const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
    const username = ref<string | null>(localStorage.getItem('username'))
    const isAuthenticated = computed(() => !!accessToken.value)
    async function login(user: string, password: string) {
        const { data } = await api.post<{ access: string; refresh: string }>(
        '/token/', { username: user, password }
        )
        accessToken.value = data.access
        refreshToken.value = data.refresh
        username.value = user
        persist()
    }
    async function register(user: string, password: string) {
        await api.post('/register/', { username: user, password })
    }
    async function refresh() {
        if (!refreshToken.value) throw new Error('No refresh token')
        const { data } = await api.post<{ access: string }>(
        '/token/refresh/', { refresh: refreshToken.value }
        )
        accessToken.value = data.access
        persist()
    }
    function logout() {
        accessToken.value = null
        refreshToken.value = null
        username.value = null
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('username')
    }
    function persist() {
        if (accessToken.value) localStorage.setItem('access_token', accessToken.value)
        if (refreshToken.value) localStorage.setItem('refresh_token', refreshToken.value)
        if (username.value) localStorage.setItem('username', username.value)
    }
    return { accessToken, refreshToken, username, isAuthenticated, login, register, refresh, logout }
})

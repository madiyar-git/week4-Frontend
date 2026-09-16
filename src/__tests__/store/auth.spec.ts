import { describe, test, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api/client';

vi.mock('@/api/client', () => ({
  api: {
    post: vi.fn()
  }
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('initializes state from localStorage', () => {
    localStorage.setItem('access_token', 'acc-123');
    localStorage.setItem('refresh_token', 'ref-456');
    localStorage.setItem('username', 'alex');

    const store = useAuthStore();

    expect(store.accessToken).toBe('acc-123');
    expect(store.refreshToken).toBe('ref-456');
    expect(store.username).toBe('alex');
    expect(store.isAuthenticated).toBe(true);
  });

  test('login sets state and saves tokens to localStorage', () => {
    const store = useAuthStore();
    store.login('alex', 'access_token_val', 'refresh_token_val');

    expect(store.accessToken).toBe('access_token_val');
    expect(store.refreshToken).toBe('refresh_token_val');
    expect(store.username).toBe('alex');
    expect(store.isAuthenticated).toBe(true);

    expect(localStorage.getItem('access_token')).toBe('access_token_val');
    expect(localStorage.getItem('refresh_token')).toBe('refresh_token_val');
    expect(localStorage.getItem('username')).toBe('alex');
  });

  test('login without username covers empty persist branch', () => {
    const store = useAuthStore();
    store.login('', 'access_token_val', 'refresh_token_val');

    expect(store.accessToken).toBe('access_token_val');
    expect(localStorage.getItem('username')).toBeNull();
  });

  test('register calls endpoint with payload', async () => {
    const store = useAuthStore();
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

    await store.register('user1', 'pass123');
    expect(api.post).toHaveBeenCalledWith('/register/', { username: 'user1', password: 'pass123' });
  });

  test('refresh updates access token when refresh_token exists', async () => {
    localStorage.setItem('refresh_token', 'valid_refresh');
    const store = useAuthStore();

    vi.mocked(api.post).mockResolvedValueOnce({ data: { access: 'new_access_token' } });

    await store.refresh();

    expect(api.post).toHaveBeenCalledWith('/token/refresh/', { refresh: 'valid_refresh' });
    expect(store.accessToken).toBe('new_access_token');
    expect(localStorage.getItem('access_token')).toBe('new_access_token');
  });

  test('refresh throws error when no refresh_token exists', async () => {
    const store = useAuthStore();
    await expect(store.refresh()).rejects.toThrow('No refresh token');
  });

  test('logout resets state and removes items from localStorage', () => {
    const store = useAuthStore();
    store.login('alex', 'acc', 'ref');

    store.logout();

    expect(store.accessToken).toBeNull();
    expect(store.refreshToken).toBeNull();
    expect(store.username).toBeNull();
    expect(store.isAuthenticated).toBe(false);

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });
});

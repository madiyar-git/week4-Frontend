import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLoadingStore } from '@/stores/loading';

describe('Loading Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('должен иметь начальное состояние isLoading равным false', () => {
    const store = useLoadingStore();
    expect(store.isLoading).toBe(false);
  });

  it('должен корректно изменять состояние через методы start и finish', () => {
    const store = useLoadingStore();

    store.start();
    expect(store.isLoading).toBe(true);

    store.finish();
    expect(store.isLoading).toBe(false);
  });
});

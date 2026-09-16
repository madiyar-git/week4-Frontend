import { config } from '@vue/test-utils';
import { vi } from 'vitest';

config.global.stubs = {
  'n-button': true,
  NConfigProvider: true,
  NGlobalStyle: true,
  RouterLink: true,
  RouterView: true
};

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

vi.stubGlobal('localStorage', localStorageMock);

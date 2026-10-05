import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, defineComponent } from 'vue';
import type { AxiosError } from 'axios';
import ErrorBoundary from '@/components/ErrorBoundary.vue';
import { api } from '@/api/client';
import * as errorReporterModule from '@/services/errorReporter';

const ThrowingComponent = defineComponent({
  name: 'ThrowingComponent',
  setup() {
    return () => {
      throw new Error('Widget render crash test');
    };
  }
});

describe('Error Handling and Monitoring System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ErrorBoundary', () => {
    it('catches render errors in child components and displays fallback UI with retry button', async () => {
      const reportSpy = vi
        .spyOn(errorReporterModule, 'reportError')
        .mockReturnValue('ERR-TEST-123');

      const originalConsoleError = console.error;
      console.error = vi.fn();

      const wrapper = mount(ErrorBoundary, {
        props: { componentName: 'TestTableWidget' },
        slots: {
          default: () => h(ThrowingComponent)
        }
      });

      await wrapper.vm.$nextTick();

      console.error = originalConsoleError;

      expect(wrapper.text()).toContain('An error occurred while loading the widget.');
      expect(wrapper.text()).toContain('Widget render crash test');
      expect(wrapper.text()).toContain('ERR-TEST-123');

      expect(reportSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'TestTableWidget',
          info: expect.stringContaining('ErrorBoundary caught')
        })
      );
    });
  });

  describe('Axios Interceptor & HTTP Filtering', () => {
    it('does not send 400, 401, and 404 status codes to reportError', async () => {
      const reportSpy = vi.spyOn(errorReporterModule, 'reportError');
      const originalAdapter = api.defaults.adapter;
      const statusesToIgnore = [400, 401, 404];

      for (const status of statusesToIgnore) {
        api.defaults.adapter = async () => {
          throw {
            response: { status, data: {}, statusText: 'Error', headers: {}, config: {} },
            config: { url: `/test-${status}`, method: 'get', _retry: true },
            isAxiosError: true,
            name: 'AxiosError',
            message: `Request failed with status code ${status}`,
            toJSON: () => ({})
          } as unknown as AxiosError;
        };

        try {
          await api.get(`/test-${status}`);
        } catch {}

        expect(reportSpy).not.toHaveBeenCalled();
      }

      api.defaults.adapter = originalAdapter;
    });

    it('sends server errors and network errors to reportError', async () => {
      const reportSpy = vi.spyOn(errorReporterModule, 'reportError').mockReturnValue('ERR-500');
      const originalAdapter = api.defaults.adapter;

      api.defaults.adapter = async () => {
        throw {
          response: {
            status: 500,
            data: {},
            statusText: 'Internal Server Error',
            headers: {},
            config: {}
          },
          config: { url: '/api/data', method: 'post' },
          isAxiosError: true,
          name: 'AxiosError',
          message: 'Request failed with status code 500',
          toJSON: () => ({})
        } as unknown as AxiosError;
      };

      try {
        await api.post('/api/data');
      } catch {}

      expect(reportSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          info: 'HTTP Interceptor Error',
          extra: expect.objectContaining({ status: 500, url: '/api/data' })
        })
      );

      reportSpy.mockClear();

      api.defaults.adapter = async () => {
        throw {
          request: {},
          config: { url: '/api/ping', method: 'get' },
          isAxiosError: true,
          name: 'AxiosError',
          message: 'Network Error',
          toJSON: () => ({})
        } as unknown as AxiosError;
      };

      try {
        await api.get('/api/ping');
      } catch {}

      expect(reportSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          info: 'HTTP Interceptor Error'
        })
      );

      api.defaults.adapter = originalAdapter;
    });
  });
});

import { describe, test, expect } from 'vitest';
import { useNotify } from '@/composables/useNotify.ts';

const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockInfo = vi.fn();
const mockWarning = vi.fn();

vi.mock('naive-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('naive-ui')>();
  return {
    ...actual,
    createDiscreteApi: vi.fn(() => ({
      message: {
        success: mockSuccess,
        error: mockError,
        info: mockInfo,
        warning: mockWarning
      }
    }))
  };
});

describe('useNotify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('triggers success notification', () => {
    const notify = useNotify();
    notify.success('Success message');

    expect(mockSuccess).toHaveBeenCalledWith('Success message', {
      keepAliveOnHover: true,
      closable: true,
      duration: 3000
    });
  });

  test('triggers error notification with string and Error instance', () => {
    const notify = useNotify();

    notify.error('String error');
    expect(mockError).toHaveBeenCalledWith('String error', expect.any(Object));

    notify.error(new Error('Network Error'));
    expect(mockError).toHaveBeenCalledWith(
      'Network error. Please check your internet connection.',
      expect.any(Object)
    );
  });

  test('triggers info notification', () => {
    const notify = useNotify();
    notify.info('Info message');

    expect(mockInfo).toHaveBeenCalledWith('Info message', expect.any(Object));
  });

  test('triggers warning notification', () => {
    const notify = useNotify();
    notify.warning('Warning message');

    expect(mockWarning).toHaveBeenCalledWith('Warning message', expect.any(Object));
  });
});

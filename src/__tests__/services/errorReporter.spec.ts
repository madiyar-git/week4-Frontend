import { describe, it, expect, vi } from 'vitest';
import { reportError } from '@/services/errorReporter';
import { logger } from '@/services/logger';

describe('errorReporter', () => {
  it('should generate error code, log error details and return the code', () => {
    const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
    const testError = new Error('Database connection failed');

    const errorCode = reportError(testError, { component: 'TestComponent' });

    expect(errorCode).toMatch(/^ERR-[A-Z0-9]{6}$/);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ErrorReporter]'),
      expect.objectContaining({
        code: errorCode,
        message: 'Database connection failed',
        component: 'TestComponent'
      })
    );
  });

  it('should handle non-Error exceptions correctly', () => {
    const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    const errorCode = reportError('String error message');

    expect(errorCode).toMatch(/^ERR-[A-Z0-9]{6}$/);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        message: 'String error message'
      })
    );
  });
});

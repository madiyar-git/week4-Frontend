import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from '@/services/logger.ts';

describe('LocalLogger Service', () => {
  beforeEach(() => {
    logger.clearLogs();
    vi.restoreAllMocks();
  });

  it('should log info, warn, and error messages and store them in localStorage', () => {
    logger.info('Test info message', { foo: 'bar' });
    logger.warn('Test warn message');
    logger.error('Test error message', { password: 'secret_password', token: 'abc' });

    const logs = logger.getLogs();
    expect(logs.length).toBe(3);

    expect(logs[0]?.level).toBe('info');
    expect(logs[0]?.message).toBe('Test info message');
    expect(logs[0]?.context).toEqual({ foo: 'bar' });

    expect(logs[1]?.level).toBe('warn');
    expect(logs[1]?.message).toBe('Test warn message');

    expect(logs[2]?.level).toBe('error');
    expect(logs[2]?.message).toBe('Test error message');
    expect(logs[2]?.context).toEqual({
      password: '[REDACTED]',
      token: '[REDACTED]'
    });
  });

  it('should clear logs successfully', () => {
    logger.info('Some message');
    expect(logger.getLogs().length).toBe(1);

    logger.clearLogs();
    expect(logger.getLogs().length).toBe(0);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('app_error_logs', 'invalid-json');
    const logs = logger.getLogs();
    expect(logs).toEqual([]);
  });
});

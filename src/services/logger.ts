const SENSITIVE_KEYS = ['password', 'token', 'access', 'refresh', 'secret'];
const MAX_BUFFER_SIZE = 50;
const STORAGE_KEY = 'app_error_logs';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  route?: string;
  appVersion?: string;
}

function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  const sanitizedObj: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const toLow = key.toLowerCase();
    const isSens = SENSITIVE_KEYS.some((sensKey) => toLow.includes(sensKey));
    if (isSens) {
      sanitizedObj[key] = '[REDACTED]';
    } else {
      sanitizedObj[key] = sanitizeData(value);
    }
  }

  return sanitizedObj;
}

class LocalLogger {
  private getBuffer(): LogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveBuffer(buffer: LogEntry[]) {
    try {
      const trimmed = buffer.slice(-MAX_BUFFER_SIZE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('[Logger] Failed to save logs to localStorage', e);
    }
  }

  public log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      context: context ? (sanitizeData(context) as Record<string, unknown>) : undefined,
      timestamp: new Date().toISOString(),
      route: window.location.pathname,
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
    };

    const buffer = this.getBuffer();
    buffer.push(entry);
    this.saveBuffer(buffer);

    if (import.meta.env.DEV) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      /* eslint-disable no-console */
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, entry);
      /* eslint-enable no-console */
    }
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  public error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  public getLogs(): LogEntry[] {
    return this.getBuffer();
  }

  public clearLogs() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const logger = new LocalLogger();

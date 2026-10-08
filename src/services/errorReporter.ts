import { logger } from '@/services/logger.ts';

export interface ErrorContext {
  component?: string;
  info?: string;
  route?: string;
  extra?: Record<string, unknown>;
}

export function reportError(error: unknown, context: ErrorContext = {}): string {
  const errorCode = 'ERR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const errorMessage = error instanceof Error ? error.message : String(error);

  const errorDetails = {
    code: errorCode,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    ...context
  };

  logger.error(`[ErrorReporter] ${errorMessage}`, errorDetails);

  return errorCode;
}

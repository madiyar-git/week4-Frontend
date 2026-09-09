import type { PiniaPluginContext } from 'pinia';

const SENSITIVE_KEYS = ['password', 'token', 'access', 'refresh', 'secret'];

function sanitizeData(data: unknown) {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => SENSITIVE_KEYS[item]);
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

export function loggerPlugin({ store }: PiniaPluginContext) {
  if (!import.meta.env.DEV) {
    return;
  }
  store.$onAction(({ name, args, onError, after }) => {
    const startTime = performance.now();
    const sanitizedArgs = sanitizeData(args);

    console.groupCollapsed(`[Pinia Action] ${store.$id} ➔ ${name}`);
    console.log('Args:', sanitizedArgs);

    after((result) => {
      const duration = (performance.now() - startTime).toFixed(2);
      const sanitizedResult = sanitizeData(result);
      if (sanitizedResult !== undefined) {
        console.log('Result:', sanitizedResult);
      }
      console.log(`Duration: ${duration}ms`);
      console.groupEnd();
    });

    onError((err) => {
      const duration = (performance.now() - startTime).toFixed(2);
      console.error('Error:', err);
      console.log(`Duration: ${duration}ms`);
      console.groupEnd();
    });
  });

  return {
    $log: (msg: string) => {
      if (import.meta.env.DEV) {
        console.log(`[Custom Log] [${store.$id}]: ${msg}`);
      }
    }
  };
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $log?: (message: string) => void;
  }
}

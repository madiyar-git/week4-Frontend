import { createDiscreteApi, darkTheme } from 'naive-ui';
import { formatErrorMessage } from '@/api/errorHandler';

let messageApi: ReturnType<typeof createDiscreteApi>['message'] | null = null;

function getMessage() {
  if (!messageApi) {
    const { message } = createDiscreteApi(['message'], {
      configProviderProps: {
        theme: darkTheme
      }
    });
    messageApi = message;
  }
  return messageApi;
}

export function useNotify() {
  return {
    success: (text: string) => {
      getMessage().success(text, { keepAliveOnHover: true });
    },
    error: (errOrText: unknown) => {
      const text = typeof errOrText === 'string' ? errOrText : formatErrorMessage(errOrText);

      getMessage().error(text, { keepAliveOnHover: true });
    },
    info: (text: string) => {
      getMessage().info(text, { keepAliveOnHover: true });
    },
    warning: (text: string) => {
      getMessage().warning(text, { keepAliveOnHover: true });
    }
  };
}

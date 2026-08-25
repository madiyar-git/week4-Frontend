import { createDiscreteApi, darkTheme } from 'naive-ui';
import { formatErrorMessage } from '@/api/errorHandler';

let messageApi: ReturnType<typeof createDiscreteApi>['message'] | null = null;

function getMessage() {
  if (!messageApi) {
    const { message } = createDiscreteApi(['message'], {
      configProviderProps: {
        theme: darkTheme
      },
      messageProviderProps: {
        placement: 'top-right',
        max: 3
      }
    });
    messageApi = message;
  }
  return messageApi;
}

export function useNotify() {
  return {
    success: (text: string) => {
      getMessage().success(text, { keepAliveOnHover: true, closable: true, duration: 3000 });
    },
    error: (errOrText: unknown) => {
      const text = typeof errOrText === 'string' ? errOrText : formatErrorMessage(errOrText);

      getMessage().error(text, { keepAliveOnHover: true, closable: true, duration: 3000 });
    },
    info: (text: string) => {
      getMessage().info(text, { keepAliveOnHover: true, closable: true, duration: 3000 });
    },
    warning: (text: string) => {
      getMessage().warning(text, { keepAliveOnHover: true, closable: true, duration: 3000 });
    }
  };
}

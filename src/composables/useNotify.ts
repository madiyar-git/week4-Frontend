import { useMessage } from 'naive-ui';
import { formatErrorMessage } from '@/api/errorHandler';

export function useNotify() {
  const message = useMessage();

  return {
    success: (text: string) => {
      message.success(text, { keepAliveOnHover: true });
    },
    error: (errOrText: unknown) => {
      const text = typeof errOrText === 'string' ? errOrText : formatErrorMessage(errOrText);

      message.error(text, { keepAliveOnHover: true });
    },
    info: (text: string) => {
      message.info(text, { keepAliveOnHover: true });
    },
    warning: (text: string) => {
      message.warning(text, { keepAliveOnHover: true });
    }
  };
}

import { ref, type Ref } from 'vue';
import axios, { AxiosError } from 'axios';

interface ApiErrorStructure {
  detail?: string;
}

export function useApi<T>() {
  const data: Ref<T | null> = ref(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const reset = () => {
    data.value = null;
    loading.value = false;
    error.value = null;
  };

  const execute = async (apiCall: () => Promise<T>): Promise<T | null> => {
    loading.value = true;
    error.value = null;

    try {
      const result = await apiCall();
      data.value = result;
      return result;
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const axiosError = e as AxiosError<ApiErrorStructure>;
        error.value = axiosError.response?.data?.detail ?? axiosError.message;
      } else if (e instanceof Error) {
        error.value = e.message;
      } else {
        error.value = 'An unexpected error occurred';
      }
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, error, execute, reset };
}

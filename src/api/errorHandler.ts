export interface ApiErrorResponse {
  message?: string | string[];
  detail?: string;
  [key: string]: unknown;
}

interface AxiosErrorLike {
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
}

function isAxiosError(err: unknown): err is AxiosErrorLike {
  return typeof err === 'object' && err !== null && 'response' in err;
}

export function formatErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) {
    return 'An unknown error occurred. Please try again later.';
  }

  if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
    return 'Network error. Please check your internet connection.';
  }

  if (isAxiosError(err) && err.response) {
    const status = err.response.status;
    const data = err.response.data;

    const backendMessage =
      data?.detail || (typeof data?.message === 'string' ? data.message : null);

    switch (status) {
      case 400:
        return backendMessage || 'Invalid request data.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource or task was not found.';
      case 422:
        return backendMessage || 'Please check your input and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server is temporarily unavailable. Please try again later.';
      default:
        return backendMessage || (status ? `Server error (${status}).` : 'Server error.');
    }
  }

  return err.message || 'An error occurred while performing the operation.';
}

import { describe, test, expect } from 'vitest';
import { formatErrorMessage } from '@/api/errorHandler.ts';

function createAxiosError(
  message: string,
  response?: { status?: number; data?: Record<string, unknown> }
) {
  const err = new Error(message);
  if (response) {
    (err as unknown as { response: typeof response }).response = response;
  }
  return err;
}

describe('formatErrorMessage', () => {
  test('returns default message when input is not an Error instance', () => {
    expect(formatErrorMessage('Not an error')).toBe(
      'An unknown error occurred. Please try again later.'
    );
    expect(formatErrorMessage(null)).toBe('An unknown error occurred. Please try again later.');
    expect(formatErrorMessage({ message: 'Error' })).toBe(
      'An unknown error occurred. Please try again later.'
    );
  });

  test('handles network and fetch errors', () => {
    expect(formatErrorMessage(new Error('Network Error'))).toBe(
      'Network error. Please check your internet connection.'
    );
    expect(formatErrorMessage(new Error('Failed to fetch data'))).toBe(
      'Network error. Please check your internet connection.'
    );
  });

  test('handles standard errors without Axios response', () => {
    expect(formatErrorMessage(new Error('Custom internal error'))).toBe('Custom internal error');
    expect(formatErrorMessage(new Error(''))).toBe(
      'An error occurred while performing the operation.'
    );
  });

  test('handles Axios errors with backend messages (detail & message string)', () => {
    const errDetail = createAxiosError('Axios error', {
      status: 400,
      data: { detail: 'Specific detail message' }
    });
    expect(formatErrorMessage(errDetail)).toBe('Specific detail message');

    const errMessage = createAxiosError('Axios error', {
      status: 400,
      data: { message: 'Specific message string' }
    });
    expect(formatErrorMessage(errMessage)).toBe('Specific message string');
  });

  test('handles HTTP status codes correctly', () => {
    expect(formatErrorMessage(createAxiosError('Err', { status: 400 }))).toBe(
      'Invalid request data.'
    );
    expect(formatErrorMessage(createAxiosError('Err', { status: 401 }))).toBe(
      'Session expired. Please log in again.'
    );
    expect(formatErrorMessage(createAxiosError('Err', { status: 403 }))).toBe(
      'You do not have permission to perform this action.'
    );
    expect(formatErrorMessage(createAxiosError('Err', { status: 404 }))).toBe(
      'The requested resource or task was not found.'
    );
    expect(formatErrorMessage(createAxiosError('Err', { status: 422 }))).toBe(
      'Please check your input and try again.'
    );

    [500, 502, 503, 504].forEach((status) => {
      expect(formatErrorMessage(createAxiosError('Err', { status }))).toBe(
        'Server is temporarily unavailable. Please try again later.'
      );
    });
  });

  test('handles default fallback for unhandled HTTP status codes', () => {
    expect(formatErrorMessage(createAxiosError('Err', { status: 409 }))).toBe(
      'Server error (409).'
    );
    expect(formatErrorMessage(createAxiosError('Err', {}))).toBe('Server error.');
  });
});

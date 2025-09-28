import type { ApiResponse } from '@common/types';

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
};

export const createApiResponse = <T>(
  data?: T,
  error?: string
): ApiResponse<T> => {
  return {
    data,
    error,
    status: error ? 'error' : 'success',
  };
};

export const parseJSON = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        result[key] || {},
        source[key] as any
      );
    } else {
      result[key] = source[key] as T[typeof key];
    }
  }

  return result;
};
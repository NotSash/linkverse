import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/services/api';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  showErrorToast?: boolean;
  initialData?: T;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  setData: (data: T | null) => void;
  reset: () => void;
}

export function useApi<T = unknown>(
  apiFunction?: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    successMessage,
    showErrorToast = true,
    initialData,
  } = options;

  const [data, setData] = useState<T | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  // Use refs for callbacks to avoid stale closures
  const optionsRef = useRef(options);
  const apiFunctionRef = useRef(apiFunction);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    apiFunctionRef.current = apiFunction;
  }, [apiFunction]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      const fn = apiFunctionRef.current;
      if (!fn) return null;

      const currentRequestId = ++requestIdRef.current;

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await fn(...args);

        if (currentRequestId === requestIdRef.current && mountedRef.current) {
          setData(result);
          setLoading(false);

          if (successMessage) toast.success(successMessage);
          optionsRef.current.onSuccess?.(result);
        }

        return result;
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);

        if (currentRequestId === requestIdRef.current && mountedRef.current) {
          setError(errorMessage);
          setLoading(false);

          if (showErrorToast) toast.error(errorMessage);
          optionsRef.current.onError?.(errorMessage);
        }

        return null;
      }
    },
    [successMessage, showErrorToast]
  );

  const reset = useCallback(() => {
    if (mountedRef.current) {
      setData(initialData ?? null);
      setLoading(false);
      setError(null);
    }
  }, [initialData]);

  return { data, loading, error, execute, setData, reset };
}

/**
 * Auto-execute API call on mount
 */
export function useApiOnMount<T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  args: unknown[] = [],
  options: UseApiOptions<T> = {}
) {
  const api = useApi<T>(apiFunction, options);
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (!hasExecuted.current) {
      hasExecuted.current = true;
      api.execute(...args);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return api;
}

export default useApi;
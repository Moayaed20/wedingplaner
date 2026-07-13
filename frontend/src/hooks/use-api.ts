"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api";

type ApiState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

export function useApi<T>(
  factory: (token: string | null) => Promise<T>,
  deps: unknown[] = [],
): ApiState<T> & { refetch: () => void } {
  const { token } = useAuth();
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  // تخزين factory في ref لتجنب إعادة تشغيل التأثير عند تغيرها
  const factoryRef = useRef(factory);
  useEffect(() => {
    factoryRef.current = factory;
  }, [factory]);

  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await factoryRef.current(token);
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "حدث خطأ غير متوقع";
      setState({ data: null, isLoading: false, error: message });
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    // التبعيات: token + deps، وليس factory لأننا نستخدم ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ...deps]);

  return { ...state, refetch: fetchData };
}

export function useMutation<T, P>(
  factory: (params: P, token: string | null) => Promise<T>,
): {
  mutate: (params: P) => Promise<T | undefined>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
} {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (params: P) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await factory(params, token);
        return result;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "حدث خطأ غير متوقع";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [factory, token],
  );

  return { mutate, isLoading, error, reset: () => setError(null) };
}

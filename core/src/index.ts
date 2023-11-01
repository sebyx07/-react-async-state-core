import React, { useEffect, useState } from "react";

// Define the types
type AsyncState<T> = {
  loading: boolean;
  result: T | null;
  error: Error | null;
};

type Callback<T> = (resolve: (value: T) => void, reject: (reason?: any) => void) => void;

type AsyncComponentProps<T> = {
  suspense?: () => React.ReactElement;
  error?: (error: Error) => React.ReactElement;
  success?: (data: T) => React.ReactElement;
};

type UseAsyncStateOptions<T> = {
  retry?: {
    count: number;
    retryDelay: number;
  };
  cache?: {
    cacheKey: string;
  };
  onLoaded?: (data: T) => void;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onLoading?: () => void;
  onRetry?: (remainingRetries: number) => void;
};

export const useAsyncState = <T>(
  callback: Callback<T>,
  deps: React.DependencyList,
  options?: UseAsyncStateOptions<T>
) => {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
    result: null,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;
    let retries = options?.retry?.count || 0;

    const execute = () => {
      const promise = new Promise<T>((resolve, reject) => {
        callback(resolve, reject);
      });

      promise
        .then(result => {
          if (!isCancelled) {
            setState({ loading: false, result, error: null });
            if (options?.onSuccess) options.onSuccess(result);
            if (options?.onLoaded) options.onLoaded(result);
          }
        })
        .catch(error => {
          if (!isCancelled) {
            setState({ loading: false, result: null, error });
            if (options?.onError) options.onError(error);
          }

          if (options?.retry && retries > 0) {
            setTimeout(() => {
              retries--;
              if (options?.onRetry) options.onRetry(retries);
              execute();
            }, options.retry.retryDelay);
          }
        });
    };

    if (options?.onLoading) options.onLoading();
    execute();

    return () => {
      isCancelled = true;
    };
  }, deps);

  const setSuccess = (data: T) => {
    setState({ loading: false, result: data, error: null });
    if (options?.onSuccess) options.onSuccess(data);
  };

  const AsyncComponent: React.FC<AsyncComponentProps<T>> = ({ suspense, error, success }) => {
    if (suspense && state.loading) return suspense();
    if (error && state.error) return error(state.error);
    if (success && state.result) return success(state.result);
    return null;
  };

  return {
    AsyncComponent,
    state,
    setSuccess,
  };
};

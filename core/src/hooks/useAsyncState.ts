import React, { useEffect, useState } from 'react'

type AsyncState<T> = {
  loading: boolean
  result: T | null
  error: Error | null
}

type Callback<T> = (
  resolve: (value: T) => void,
  reject: (reason?: any) => void,
) => void

type AsyncComponentProps<T> = {
  suspense?: () => React.ReactElement
  error?: (error: Error) => React.ReactElement
  success?: (data: T) => React.ReactElement
}

type UseAsyncStateOptions<T> = {
  retry?: {
    count: number
    retryDelay: number
  }
  cache?: {
    cacheKey: string
  }
  onLoaded?: (data: T) => void
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onLoading?: (cachingOptions: { cacheKey?: string }) => T | void
  onRetry?: (remainingRetries: number) => void
}

export const useAsyncState = <T>(
  callback: Callback<T>,
  deps: React.DependencyList,
  options?: UseAsyncStateOptions<T>,
) => {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
    result: null,
    error: null,
  })

  useEffect(() => {
    let isCancelled = false
    let retries = options?.retry?.count || 0
    const cache = options?.cache || {}
    if (options?.onLoading) {
      const cachedData = options.onLoading(cache)
      if (cachedData) {
        setState({ loading: false, result: cachedData as T, error: null })
        if (options.onSuccess) options.onSuccess(cachedData as T)
        if (options.onLoaded) options.onLoaded(cachedData as T)
        return
      }
    }

    const execute = () => {
      const promise = new Promise<T>((resolve, reject) => {
        callback(resolve, reject)
      })

      promise
        .then((result) => {
          if (!isCancelled) {
            setState({ loading: false, result, error: null })
            if (options?.onSuccess) options.onSuccess(result)
            if (options?.onLoaded) options.onLoaded(result)
          }
        })
        .catch((error) => {
          if (!isCancelled) {
            setState({ loading: false, result: null, error })
            if (options?.onError) options.onError(error)
          }

          if (options?.retry && retries > 0) {
            setTimeout(() => {
              retries--
              if (options.onRetry) options.onRetry(retries)
              execute()
            }, options.retry.retryDelay)
          }
        })
    }

    execute()

    return () => {
      isCancelled = true
    }
  }, deps)

  const AsyncComponent: React.FC<AsyncComponentProps<T>> = ({
    suspense,
    error,
    success,
  }) => {
    if (suspense && state.loading) return suspense()
    if (error && state.error) return error(state.error)
    if (success && state.result) return success(state.result)
    return null
  }

  return {
    AsyncComponent,
    state,
  }
}

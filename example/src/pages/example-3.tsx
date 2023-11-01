import React from 'react'
import { useAsyncState } from '@react-async-state/core'

export const Example3Page: React.FC = () => {
  const retryOptions = {
    count: 3,
    retryDelay: 500,
  }
  const cacheOptions = {
    cacheKey: '1234',
  }

  const fetchFromLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key)
  }

  const saveToLocalStorage = (key: string, data: string) => {
    localStorage.setItem(key, data)
  }

  const clearFromLocalStorage = (key: string) => {
    localStorage.removeItem(key)
  }

  const beforeLoad = (cacheKey: string) => {
    const cachedData = fetchFromLocalStorage(cacheKey)
    return cachedData ? JSON.parse(cachedData) : null
  }

  const onLoaded = (data: string) => {
    saveToLocalStorage(cacheOptions.cacheKey, JSON.stringify(data))
  }

  const handleClearCache = () => {
    clearFromLocalStorage(cacheOptions.cacheKey)
    alert('Cache cleared!')
  }

  const { AsyncComponent } = useAsyncState(
    (resolve, reject) => {
      const cachedData = beforeLoad(cacheOptions.cacheKey)
      if (cachedData) {
        resolve(cachedData)
      } else {
        setTimeout(() => {
          resolve('Data loaded after 2 seconds!')
        }, 2000)
      }
    },
    [],
    {
      retry: retryOptions,
      cache: cacheOptions,
      onLoaded,
    },
  )

  return (
    <div>
      <AsyncComponent
        suspense={() => <div>Loading...</div>}
        error={(error) => <div>{error.message}</div>}
        success={(data) => (
          <div>
            <h1>Example 1</h1>
            <p>{data.toString()}</p>
            <button onClick={handleClearCache}>Clear Cache</button>
          </div>
        )}
      />
    </div>
  )
}

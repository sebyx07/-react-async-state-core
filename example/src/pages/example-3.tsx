import React from 'react'
import { IndexedDBStorage, useAsyncState } from '@react-async-state/core'

type BasicObject = {
  id: string
  value: string
}

const indexedDBStorage = new IndexedDBStorage<BasicObject>(
  'exampleObjectType',
  10000,
) // 10 seconds expiration time

export const Example3Page: React.FC = () => {
  const retryOptions = {
    count: 3,
    retryDelay: 500,
  }
  const cacheOptions = {
    cacheKey: '1234',
  }

  const fetchData = async (): Promise<string> => {
    // Simulate an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Data loaded after 2 seconds!')
      }, 2000)
    })
  }

  const beforeLoad = async (cacheKey: string): Promise<BasicObject | null> => {
    try {
      return await indexedDBStorage.get(cacheKey)
    } catch (error) {
      console.error('Error fetching from IndexedDB:', error)
      return null
    }
  }

  const onLoaded = async (data: BasicObject) => {
    try {
      await indexedDBStorage.set(data)
    } catch (error) {
      console.error('Error saving to IndexedDB:', error)
    }
  }

  const handleClearCache = async () => {
    try {
      await indexedDBStorage.remove(cacheOptions.cacheKey)
      alert('Cache cleared!')
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  const { AsyncComponent } = useAsyncState<BasicObject>(
    async (resolve) => {
      const data = await fetchData()
      resolve({ id: cacheOptions.cacheKey, value: data })
    },
    [],
    {
      retry: retryOptions,
      cache: cacheOptions,
      onLoaded,
      onLoading: async (cachingOptions: { cacheKey?: string }) => {
        if (cachingOptions.cacheKey) {
          return await beforeLoad(cachingOptions.cacheKey)
        }
        return null
      },
    },
  )

  return (
    <div>
      <AsyncComponent
        suspense={() => <div>Loading...</div>}
        error={(error) => <div>{error.message}</div>}
        success={(data) => (
          <div>
            <h1>Example 3</h1>
            <p>{data.value.toString()}</p>
            <button onClick={handleClearCache}>Clear Cache</button>
          </div>
        )}
      />
    </div>
  )
}

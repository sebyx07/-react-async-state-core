# IndexedDBStorage

This class provides a wrapper around the IndexedDB API for easy storage and retrieval of objects with automatic cleanup of expired values.

## Class Signature

<pre>export class IndexedDBStorage <t>{ ... }</t> </pre>


### Example
```tsx
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
```

### Constructor

<pre>constructor(
    private objectType: string,
    private expirationTime: number,
)
</pre>

Creates an instance of the storage for a specific object type with a given expiration time.

*   **objectType:** The name/type of object being stored.
*   **expirationTime:** Duration in milliseconds after which an object should be considered expired and be auto-cleaned.

### Methods

#### async set(value: T): Promise<void>

Saves an object to the storage. The object must have an 'id' property which acts as the unique identifier.

#### async ensureInitialized(): Promise<void>

Ensures the database is initialized and ready for operations.

#### async get(id: string): Promise<T | undefined>

Retrieves an object from storage by its 'id'. Returns undefined if not found or if the object is expired.

#### async remove(id: string): Promise<void>

Removes an object from storage by its 'id'.

#### async clear(): Promise<void>

Clears all objects of the defined objectType from storage.

#### stopAutoCleaning(): void

Stops the automatic cleanup of expired values.

### Private Methods

These methods are used internally by the class and are not meant to be called externally:

*   **init():** Initializes the database.
*   **getStore(mode: IDBTransactionMode):** Gets the object store for operations.
*   **getCount():** Returns the count of objects in storage.
*   **removeOldest():** Removes the oldest object from storage.
*   **startAutoCleaning():** Starts the automatic cleanup of expired values.

### Properties

*   **db:** The active IDBDatabase instance.
*   **DB_NAME:** The name of the database, defaulted to '@ras'.
*   **DB_VERSION:** The version of the database, defaulted to 1.
*   **cleaningInterval:** The interval ID for automatic cleanup.
*   **objectType:** The type of object being stored.
*   **expirationTime:** Duration in milliseconds for object expiration.

### Usage

To utilize this storage class, simply create an instance, passing in the object type and expiration time. Then, you can use its methods for various storage operations.

## Contributing

If you wish to contribute to this class, please submit a pull request or open an issue for discussion.

## License

This code is released under the [Your License Here].
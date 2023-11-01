# @react-async-state

A simple and efficient asynchronous state management library for React. Easily handle loading, error, and success states for your async operations.

## Installation

```bash
npm install @react-async-state/core
```

## Quick start

JS example
```js
import React from 'react';
import { useAsyncState } from '@react-async-state/core';

export function MyComponent() {
  const { AsyncComponent } = useAsyncState(resolve => {
    setTimeout(() => {
      resolve('Data loaded!');
    }, 500);
  }, []);

  return (
    <div>
      <AsyncComponent
        suspense={() => <div>Loading...</div>}
        error={error => <div>{error.message}</div>}
        success={data => <div>{data}</div>}
      />
    </div>
  );
}
```

Typescript example
```tsx
import React from 'react'
import { useAsyncState } from '@react-async-state/core'

export const MyComponent: React.FC = () => {
  const { AsyncComponent } = useAsyncState(
    (resolve) => {
      setTimeout(() => {
        resolve('Data loaded!')
      }, 500)
    },
    []
  )

  return (
    <div>
      <AsyncComponent
        suspense={() => <div>Loading...</div>}
        error={(error) => <div>{error.message}</div>}
        success={(data) => <div>{data.toString()}</div>}
      />
    </div>
  )
}
```

## Features

- Declarative API: Handle async operations with ease using a declarative API.
- Built-in Suspense: Use the built-in suspense feature to show loading indicators while your async operation is in progress.
- Error Handling: Easily handle and display errors from your async operations.


## Advanced Usage

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

### Other storage options

Check out:

[In memory storage](docs/in-memory.md)

[Indexdb storage](docs/index-db.md)


## API

`useAsyncState`
The useAsyncState hook is the core of the library, allowing you to handle asynchronous operations with ease.

Usage:

```tsx
const { AsyncComponent } = useAsyncState(asyncOperation, dependencies, options)
```

- `asyncOperation`: The async function you want to execute. It receives resolve and reject callbacks.
- `dependencies`: An array of dependencies for your async function, similar to React's useEffect hook.
- `options`: Optional. An object with optional configurations.
- Options:
  - `onSuccess(data: T)`: A callback that is executed when the async operation is successful.
  - `onError(error: Error)`: A callback that is executed when the async operation encounters an error.
  - `onLoaded(data: T)`: A callback that is executed when the operation has successfully completed.
  - `onLoading()`: A callback that is executed when the operation is in progress.
  - `onRetry(remainingRetries: number)`: A callback that is executed when the user clicks the retry button in the error component.

### AsyncComponent

A component returned from useAsyncState that takes care of rendering based on the state of your async operation.

Props:
- suspense(): A render prop function that returns JSX to display while the async operation is in progress.
- error(error): A render prop function that returns JSX to display when the async operation encounters an error.
- success(data): A render prop function that returns JSX to display when the async operation is successful.

Contributing
If you have suggestions for how @react-async-state could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

License
MIT © 2023 @react-async-state

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
    const cachedData = fetchFromLocalStorage(cacheKey || '')
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
          (resolve) => {
            setTimeout(() => {
              resolve('Data loaded after 2 seconds!')
            }, 2000)
          },
          [],
          {
            retry: retryOptions,
            cache: cacheOptions,
            onLoaded,
            onLoading: (cachingOptions: { cacheKey?: string }) => {
              const cachedData = fetchFromLocalStorage(cachingOptions.cacheKey || '')
              return cachedData ? JSON.parse(cachedData) : null
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
                              <h1>Example 1</h1>
                              <p>{data.toString()}</p>
                              <button onClick={handleClearCache}>Clear Cache</button>
                            </div>
                    )}
            />
          </div>
  )
}

```

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

import React from 'react'
import { useAsyncState } from '@react-async-state/core'

export const Example1Page: React.FC = () => {
  const { AsyncComponent } = useAsyncState((resolve) => {
    setTimeout(() => {
      // Uncomment the line below to simulate an error
      // throw new Error("Failed to load data");
      resolve('Data loaded after 500ms!')
    }, 500)
  }, [])

  return (
    <div>
      <AsyncComponent
        suspense={() => <div>Loading...</div>}
        error={(error) => <div>{error.message}</div>}
        success={(data) => (
          <div>
            <h1>Example 1</h1>
            <p>{data.toString()}</p>
          </div>
        )}
      />
    </div>
  )
}

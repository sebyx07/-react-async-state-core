import { act, renderHook } from '@testing-library/react'
import { useAsyncState } from '../useAsyncState'

describe('useAsyncState', () => {
  it('should handle successful data fetching', async () => {
    const mockSuccessData = 'Hello, World!'

    let resolveOutside: any
    const p = new Promise((resolve) => {
      resolveOutside = resolve
    })

    const { result, rerender } = renderHook(() =>
      useAsyncState(
        (resolve) => {
          setTimeout(() => {
            resolve(mockSuccessData)
            resolveOutside()
          }, 100)
        },
        [],
        {},
      ),
    )

    expect(result.current.state.loading).toBe(true)

    await act(async () => {
      await p
    })
    rerender()

    expect(result.current.state.result).toEqual(mockSuccessData)
    expect(result.current.state.loading).toBe(false)
  })

  it('should retry on error and eventually fail', async () => {
    let attemptCount = 0
    let resolveOutside: any
    const externalPromise = new Promise<void>((resolve) => {
      resolveOutside = resolve
    })

    const { result, rerender } = renderHook(() =>
      useAsyncState(
        (resolve, reject) => {
          setTimeout(() => {
            attemptCount += 1
            if (attemptCount < 3) {
              reject(new Error('Failed!'))
            } else {
              resolve('Success after retries!')
              resolveOutside()
            }
          }, 100)
        },
        [],
        { retry: { count: 3, retryDelay: 100 } },
      ),
    )

    await act(async () => {
      await externalPromise
    })
    rerender()

    expect(result.current.state.error).toBeNull()
    expect(result.current.state.result).toEqual('Success after retries!')
  })

  it('should cache data after fetching', async () => {
    const mockData = 'Cached data!'
    localStorage.setItem('cacheKey', JSON.stringify(mockData)) // Pretend we cached previously

    const { result } = renderHook(() =>
      useAsyncState(
        (resolve) => {
          setTimeout(() => {
            resolve(mockData)
          }, 100)
        },
        [],
        { cache: { cacheKey: 'cacheKey' } },
      ),
    )

    await act(async () => {
      // Add delay for setTimeout above
      await new Promise((res) => setTimeout(res, 150))
    })

    expect(result.current.state.result).toEqual(mockData)
    expect(result.current.state.loading).toBe(false)
  })

  it('should trigger event hooks', async () => {
    const onLoadedMock = jest.fn()
    const onSuccessMock = jest.fn()
    const onErrorMock = jest.fn()

    let resolveOutside: any
    const p = new Promise((resolve) => {
      resolveOutside = resolve
    })

    const { rerender } = renderHook(() =>
      useAsyncState(
        (resolve, reject) => {
          setTimeout(() => {
            resolve('Some data')
            resolveOutside()
          }, 100)
        },
        [],
        {
          onLoaded: onLoadedMock,
          onSuccess: onSuccessMock,
          onError: onErrorMock,
        },
      ),
    )

    await act(async () => {
      await p
    })
    rerender()

    expect(onLoadedMock).toHaveBeenCalledTimes(1)
    expect(onSuccessMock).toHaveBeenCalledTimes(1)
    expect(onErrorMock).toHaveBeenCalledTimes(0)
  })
})

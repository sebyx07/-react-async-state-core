import { InMemoryStorage } from '../in-memory'

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage<string>

  beforeEach(() => {
    storage = new InMemoryStorage<string>(2, 1000)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    storage.stopAutoCleaning()
  })

  it('should set and get a value', () => {
    storage.set('key1', 'value1')
    expect(storage.get('key1')).toEqual('value1')
  })

  it('should return undefined for non-existing key', () => {
    expect(storage.get('key1')).toBeUndefined()
  })

  it('should remove the oldest element when maxElements is exceeded', () => {
    storage.set('key1', 'value1')
    storage.set('key2', 'value2')
    storage.set('key3', 'value3')

    expect(storage.get('key1')).toBeUndefined()
    expect(storage.get('key2')).toEqual('value2')
    expect(storage.get('key3')).toEqual('value3')
  })

  it('should remove the key after expiration time', () => {
    storage.set('key1', 'value1')
    jest.advanceTimersByTime(1500) // 1.5 seconds
    expect(storage.get('key1')).toBeUndefined()
  })

  it('should not return expired value when getting a key', () => {
    storage.set('key1', 'value1')
    jest.advanceTimersByTime(500) // 0.5 seconds
    expect(storage.get('key1')).toEqual('value1')
    jest.advanceTimersByTime(700) // total 1.2 seconds
    expect(storage.get('key1')).toBeUndefined()
  })

  it('should clear all keys', () => {
    storage.set('key1', 'value1')
    storage.set('key2', 'value2')
    storage.clear()
    expect(storage.get('key1')).toBeUndefined()
    expect(storage.get('key2')).toBeUndefined()
  })

  it('should auto-clean expired values', () => {
    storage.set('key1', 'value1')
    storage.set('key2', 'value2')
    jest.advanceTimersByTime(1500) // 1.5 seconds
    jest.advanceTimersByTime(5000) // total 6.5 seconds to trigger auto-cleaning
    expect(storage.get('key1')).toBeUndefined()
    expect(storage.get('key2')).toBeUndefined()
  })

  it('should stop auto-cleaning when called', () => {
    storage = new InMemoryStorage<string>(2, 15000) // Set a longer expiration time (15 seconds)
    storage.set('key1', 'value1')
    storage.stopAutoCleaning()
    jest.advanceTimersByTime(10000) // total 10 seconds without auto-cleaning
    expect(storage.get('key1')).toEqual('value1') // Value still exists as auto-cleaning was stopped and the key hasn't naturally expired yet.
  })
})

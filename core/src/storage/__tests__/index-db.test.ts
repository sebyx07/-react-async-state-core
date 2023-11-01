import indexedDB from 'fake-indexeddb'
import { IndexedDBStorage } from '../index-db'
global.indexedDB = indexedDB

type User = {
  id: string
  name: string
}

if (typeof structuredClone === 'undefined') {
  // @ts-ignore
  global.structuredClone = (value) => value
}

describe('IndexedDBStorage', () => {
  let storage: IndexedDBStorage<User>

  beforeEach(async () => {
    jest.useFakeTimers()
    storage = new IndexedDBStorage<User>('User', 60000)
    await storage.ensureInitialized() // Make sure the database is initialized
  })

  afterEach(async () => {
    await storage.clear()
    storage.stopAutoCleaning()
  })

  it('should set and get a value', async () => {
    const user = { id: '1', name: 'John Doe' }
    await storage.set(user)
    const retrievedUser = await storage.get('1')
    expect(retrievedUser.id).toEqual(user.id)
  })

  it('should remove a value', async () => {
    const user = { id: '2', name: 'Jane Doe' }
    await storage.set(user)
    await storage.remove('2')
    const retrievedUser = await storage.get('2')
    expect(retrievedUser).toBeUndefined()
  })

  it('should clear all values', async () => {
    const users = [
      { id: '3', name: 'John Smith' },
      { id: '4', name: 'Jane Smith' },
    ]
    for (let user of users) {
      await storage.set(user)
    }
    await storage.clear()
    const retrievedUser1 = await storage.get('3')
    const retrievedUser2 = await storage.get('4')
    expect(retrievedUser1).toBeUndefined()
    expect(retrievedUser2).toBeUndefined()
  })

  it('should not retrieve expired values', async () => {
    const user = { id: '5', name: 'Expired User' }
    await storage.set(user)

    jest.advanceTimersByTime(70000) // mock 70 seconds passing, our expiration is 60 seconds

    const retrievedUser = await storage.get('5')
    expect(retrievedUser).toBeUndefined()
  })

  it('should automatically clean expired values', async () => {
    const user = { id: '6', name: 'Soon-to-Expire User' }
    await storage.set(user)

    jest.advanceTimersByTime(70000) // mock 70 seconds passing, our expiration is 60 seconds

    const retrievedUser = await storage.get('6') // our auto-cleaning should have removed this
    expect(retrievedUser).toBeUndefined()
  })
})

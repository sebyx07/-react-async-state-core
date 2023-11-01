export class IndexedDBStorage<T> {
  private db: IDBDatabase | null = null
  private readonly DB_NAME = '@ras'
  private readonly DB_VERSION = 1
  private cleaningInterval: number | null = null

  constructor(
    private objectType: string,
    private expirationTime: number,
  ) {
    this.init()
    this.startAutoCleaning()
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(this.DB_NAME)

      openRequest.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        if (!this.db.objectStoreNames.contains(this.objectType)) {
          this.db.createObjectStore(this.objectType, { keyPath: 'id' }) // Using 'id' as the primary key
        }
      }

      openRequest.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      openRequest.onerror = () => {
        reject(openRequest.error)
      }
    })
  }

  private getStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) throw new Error('Database is not initialized.')
    const transaction = this.db.transaction(this.objectType, mode)
    return transaction.objectStore(this.objectType)
  }

  async set(value: T): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const store = this.getStore('readwrite')
      const request = store.put({ ...value, timestamp: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  public async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains(this.objectType)) {
            db.createObjectStore(this.objectType, { keyPath: 'id' })
          }
        }
        request.onsuccess = (event: Event) => {
          this.db = (event.target as IDBOpenDBRequest).result
          resolve()
        }
        request.onerror = (event) => {
          reject(new Error('Error opening the database.'))
        }
      })
    }
  }

  async get(id: string): Promise<T | undefined> {
    await this.ensureInitialized()
    return new Promise<T | undefined>((resolve, reject) => {
      const store = this.getStore('readonly')
      const request = store.get(id)

      request.onsuccess = () => {
        const data = request.result as (T & { timestamp: number }) | undefined
        if (!data) return resolve(undefined)

        const isExpired = Date.now() - data.timestamp > this.expirationTime
        if (isExpired) {
          this.remove(id)
          return resolve(undefined)
        }

        resolve(data)
      }

      request.onerror = () => reject(request.error)
    })
  }

  async remove(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const store = this.getStore('readwrite')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const store = this.getStore('readwrite')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async getCount(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const store = this.getStore('readonly')
      const request = store.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private async removeOldest(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const store = this.getStore('readonly')
      const request = store.openCursor()

      let oldestKey: string | null = null
      let oldestTimestamp: number = Infinity

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          const data = cursor.value as T & { timestamp: number }
          if (data.timestamp < oldestTimestamp) {
            oldestTimestamp = data.timestamp
            oldestKey = cursor.key as string
          }
          cursor.continue()
        } else {
          if (oldestKey) this.remove(oldestKey)
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  private startAutoCleaning(): void {
    if (this.cleaningInterval) {
      clearInterval(this.cleaningInterval)
    }

    this.cleaningInterval = window.setInterval(async () => {
      const store = this.getStore('readonly')
      const request = store.openCursor()

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          const data = cursor.value as T & { timestamp: number }
          const isExpired = Date.now() - data.timestamp > this.expirationTime
          if (isExpired) {
            this.remove(cursor.key as string)
          }
          cursor.continue()
        }
      }

      request.onerror = () => {
        console.error(request.error)
      }
    }, 5000) as any
  }

  stopAutoCleaning(): void {
    if (this.cleaningInterval) {
      clearInterval(this.cleaningInterval)
      this.cleaningInterval = null
    }
  }
}

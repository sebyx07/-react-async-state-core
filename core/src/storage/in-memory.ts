export class InMemoryStorage<T> {
  private storage: Map<string, { value: T; timestamp: number }> = new Map()
  private cleaningInterval: number | null = null

  constructor(
    private maxElements: number,
    private expirationTime: number,
  ) {
    this.startAutoCleaning()
  }

  set(key: string, value: T): void {
    if (this.storage.size >= this.maxElements) {
      this.removeOldest()
    }

    this.storage.set(key, { value, timestamp: Date.now() })
  }

  get(key: string): T | undefined {
    const data = this.storage.get(key)
    if (!data) return undefined

    const isExpired = Date.now() - data.timestamp > this.expirationTime
    if (isExpired) {
      this.storage.delete(key)
      return undefined
    }

    return data.value
  }

  remove(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }

  private removeOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp: number = Infinity

    for (const [key, data] of Array.from(this.storage.entries())) {
      if (data.timestamp < oldestTimestamp) {
        oldestTimestamp = data.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.storage.delete(oldestKey)
    }
  }

  private startAutoCleaning(): void {
    if (this.cleaningInterval) {
      clearInterval(this.cleaningInterval)
    }

    this.cleaningInterval = window.setInterval(() => {
      for (const [key, data] of Array.from(this.storage.entries())) {
        const isExpired = Date.now() - data.timestamp > this.expirationTime
        if (isExpired) {
          this.storage.delete(key)
        }
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

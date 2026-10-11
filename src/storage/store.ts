import { createStore as openDatabase, get, set } from 'idb-keyval'
import { parseUserData, type UserData } from './userData'

export const DB_NAME = 'first-pour'
export const STORE_NAME = 'keyval'
export const STORAGE_KEY = 'user-data'

/** Where a person's data lives. Account sync would be a second implementation of this. */
export interface UserDataStore {
  /** False when data lasts only for this browser session. */
  readonly persistent: boolean
  load(): Promise<UserData | null>
  save(data: UserData): Promise<void>
}

export function createMemoryStore(initial: UserData | null = null): UserDataStore {
  let current = initial
  return {
    persistent: false,
    load: async () => current,
    save: async (data) => {
      current = data
    },
  }
}


/** IndexedDB when it works; otherwise an in-memory store, as in some private browsing modes. */
export async function createStore(): Promise<UserDataStore> {
  try {
    if (typeof indexedDB === 'undefined') throw new Error('IndexedDB is unavailable')
    const database = openDatabase(DB_NAME, STORE_NAME)
    await get(STORAGE_KEY, database)
    return {
      persistent: true,
      async load() {
        const parsed = parseUserData(await get(STORAGE_KEY, database))
        return parsed.ok ? parsed.data : null
      },
      async save(data) {
        await set(STORAGE_KEY, data, database)
      },
    }
  } catch {
    return createMemoryStore()
  }
}

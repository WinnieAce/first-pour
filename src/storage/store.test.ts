import { IDBFactory } from 'fake-indexeddb'
import { createStore as openDatabase, set } from 'idb-keyval'
import { createMemoryStore, createStore, DB_NAME, STORAGE_KEY, STORE_NAME } from './store'
import type { UserData } from './userData'

const valid: UserData = {
  version: 1,
  ownedIngredientIds: ['gin'],
  favouriteDrinkIds: [],
  settings: { units: 'ml', ageConfirmed: true },
}

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory())
})
afterEach(() => {
  vi.unstubAllGlobals()
})

it('uses a persistent store when IndexedDB works', async () => {
  expect((await createStore()).persistent).toBe(true)
})

it('load returns null before any save', async () => {
  expect(await (await createStore()).load()).toBeNull()
})

it('round-trips saved data across store instances', async () => {
  await (await createStore()).save(valid)
  expect(await (await createStore()).load()).toEqual(valid)
})

it('load returns null when the stored value is corrupt', async () => {
  await set(STORAGE_KEY, 'garbage', openDatabase(DB_NAME, STORE_NAME))
  expect(await (await createStore()).load()).toBeNull()
})

it('falls back to a non-persistent store when indexedDB is missing', async () => {
  vi.stubGlobal('indexedDB', undefined)
  const store = await createStore()
  expect(store.persistent).toBe(false)
  await store.save(valid)
  expect(await store.load()).toEqual(valid)
})

it('falls back to a non-persistent store when opening IndexedDB throws', async () => {
  vi.stubGlobal('indexedDB', {
    open: () => {
      throw new Error('blocked')
    },
  })
  expect((await createStore()).persistent).toBe(false)
})

it('the memory store starts empty and keeps what is saved', async () => {
  const store = createMemoryStore()
  expect(await store.load()).toBeNull()
  await store.save(valid)
  expect(await store.load()).toEqual(valid)
})

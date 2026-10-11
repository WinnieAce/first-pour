import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useContent } from '../content/ContentContext'
import type { UserDataStore } from './store'
import { defaultUserData, pruneUnknownIds, type UserData } from './userData'

export type UserDataValue = {
  data: UserData
  /** False when changes last only for this browser session. */
  persistent: boolean
  toggleOwned(id: string): void
  toggleFavourite(id: string): void
  setUnits(units: 'ml' | 'oz'): void
  confirmAge(): void
  replaceAll(data: UserData): void
}

const UserDataContext = createContext<UserDataValue | null>(null)

const toggle = (ids: string[], id: string) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])

export function UserDataProvider({ store, children }: { store: UserDataStore; children: ReactNode }) {
  const { content, stapleIds } = useContent()
  const [data, setData] = useState<UserData | null>(null)
  const [persistent, setPersistent] = useState(store.persistent)
  const latest = useRef<UserData | null>(null)

  useEffect(() => {
    let cancelled = false
    const start = (loaded: UserData | null) => {
      if (cancelled) return
      latest.current = loaded ? pruneUnknownIds(loaded, content) : defaultUserData(stapleIds)
      setData(latest.current)
    }
    store.load().then(start, () => {
      setPersistent(false)
      start(null)
    })
    return () => {
      cancelled = true
    }
  }, [store, content, stapleIds])

  const update = useCallback(
    (change: (current: UserData) => UserData) => {
      if (!latest.current) return
      latest.current = change(latest.current)
      setData(latest.current)
      store.save(latest.current).catch(() => setPersistent(false))
    },
    [store],
  )

  const value = useMemo<UserDataValue | null>(
    () =>
      data && {
        data,
        persistent,
        toggleOwned: (id) => update((d) => ({ ...d, ownedIngredientIds: toggle(d.ownedIngredientIds, id) })),
        toggleFavourite: (id) => update((d) => ({ ...d, favouriteDrinkIds: toggle(d.favouriteDrinkIds, id) })),
        setUnits: (units) => update((d) => ({ ...d, settings: { ...d.settings, units } })),
        confirmAge: () => update((d) => ({ ...d, settings: { ...d.settings, ageConfirmed: true } })),
        replaceAll: (next) => update(() => pruneUnknownIds(next, content)),
      },
    [data, persistent, update, content],
  )

  // Nothing is shown until saved data has loaded, so the age gate never flashes for a returning visitor.
  if (!value) return null
  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
}

export function useUserData(): UserDataValue {
  const value = useContext(UserDataContext)
  if (!value) throw new Error('useUserData must be used inside UserDataProvider')
  return value
}

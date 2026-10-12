import { createContext, useContext } from 'react'
import type { Scheme, Theme } from '../theme/palettes'
import type { UserData } from './userData'

export type UserDataValue = {
  data: UserData
  /** False when changes last only for this browser session. */
  persistent: boolean
  toggleOwned(id: string): void
  toggleFavourite(id: string): void
  setUnits(units: 'ml' | 'oz'): void
  setTheme(theme: Theme): void
  setScheme(scheme: Scheme): void
  confirmAge(): void
  replaceAll(data: UserData): void
}

export const UserDataContext = createContext<UserDataValue | null>(null)

export function useUserData(): UserDataValue {
  const value = useContext(UserDataContext)
  if (!value) throw new Error('useUserData must be used inside UserDataProvider')
  return value
}

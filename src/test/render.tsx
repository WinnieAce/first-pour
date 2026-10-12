import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ContentContext, makeContentValue } from '../content/ContentContext'
import type { Content } from '../content/schema'
import { createMemoryStore, type UserDataStore } from '../storage/store'
import type { UserData } from '../storage/userData'
import { UserDataProvider } from '../storage/UserDataProvider'
import { fixtureContent } from './fixtures'

export const memoryStore = createMemoryStore

/** Saved data for someone who has already passed the age gate. */
export function confirmed(overrides: Partial<Omit<UserData, 'settings'>> & { units?: 'ml' | 'oz' } = {}): UserData {
  const { units = 'ml', ...rest } = overrides
  return {
    version: 1,
    ownedIngredientIds: ['ice', 'sugar'],
    favouriteDrinkIds: [],
    ...rest,
    settings: { units, ageConfirmed: true, theme: 'system', scheme: 'classic' },
  }
}

type Options = { data?: UserData; store?: UserDataStore; route?: string; content?: Content }

/** Renders inside the router and providers. A first-time visitor unless `data` or `store` is given. */
export function renderApp(ui: ReactElement, { data, store, route = '/', content = fixtureContent }: Options = {}) {
  const usedStore = store ?? createMemoryStore(data ?? null)
  const user = userEvent.setup()
  const view = render(
    <ContentContext.Provider value={makeContentValue(content)}>
      <UserDataProvider store={usedStore}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </UserDataProvider>
    </ContentContext.Provider>,
  )
  return { ...view, user, store: usedStore }
}

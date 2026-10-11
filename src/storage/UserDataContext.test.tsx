import { screen, waitFor } from '@testing-library/react'
import { confirmed, memoryStore, renderApp } from '../test/render'
import type { UserDataStore } from './store'
import { useUserData } from './UserDataContext'

function Probe() {
  const { data, persistent, toggleOwned, toggleFavourite, setUnits, replaceAll } = useUserData()
  return (
    <div>
      <output data-testid="owned">{data.ownedIngredientIds.join(',')}</output>
      <output data-testid="favourites">{data.favouriteDrinkIds.join(',')}</output>
      <output data-testid="units">{data.settings.units}</output>
      <output data-testid="persistent">{String(persistent)}</output>
      <button onClick={() => toggleOwned('gin')}>gin</button>
      <button onClick={() => toggleFavourite('daiquiri')}>fav</button>
      <button onClick={() => setUnits('oz')}>oz</button>
      <button onClick={() => replaceAll(confirmed({ ownedIngredientIds: ['rye'] }))}>replace</button>
    </div>
  )
}

it('a first visit starts with the staples owned', async () => {
  renderApp(<Probe />)
  expect(await screen.findByTestId('owned')).toHaveTextContent('ice,sugar')
})

it('toggleOwned adds then removes, and persists', async () => {
  const { user, store } = renderApp(<Probe />, { data: confirmed() })
  await user.click(await screen.findByRole('button', { name: 'gin' }))
  expect(screen.getByTestId('owned')).toHaveTextContent('ice,sugar,gin')
  expect((await store.load())!.ownedIngredientIds).toEqual(['ice', 'sugar', 'gin'])
  await user.click(screen.getByRole('button', { name: 'gin' }))
  expect(screen.getByTestId('owned')).toHaveTextContent(/^ice,sugar$/)
  expect((await store.load())!.ownedIngredientIds).toEqual(['ice', 'sugar'])
})

it('toggleFavourite adds then removes, and persists', async () => {
  const { user, store } = renderApp(<Probe />, { data: confirmed() })
  await user.click(await screen.findByRole('button', { name: 'fav' }))
  expect((await store.load())!.favouriteDrinkIds).toEqual(['daiquiri'])
  await user.click(screen.getByRole('button', { name: 'fav' }))
  expect((await store.load())!.favouriteDrinkIds).toEqual([])
})

it('setUnits persists', async () => {
  const { user, store } = renderApp(<Probe />, { data: confirmed() })
  await user.click(await screen.findByRole('button', { name: 'oz' }))
  expect(screen.getByTestId('units')).toHaveTextContent('oz')
  expect((await store.load())!.settings.units).toBe('oz')
})

it('replaceAll swaps everything and persists', async () => {
  const { user, store } = renderApp(<Probe />, { data: confirmed() })
  await user.click(await screen.findByRole('button', { name: 'replace' }))
  expect(screen.getByTestId('owned')).toHaveTextContent(/^rye$/)
  expect((await store.load())!.ownedIngredientIds).toEqual(['rye'])
})

it('drops saved ids that are no longer in the content', async () => {
  renderApp(<Probe />, { data: confirmed({ ownedIngredientIds: ['gin', 'discontinued'], favouriteDrinkIds: ['gone'] }) })
  expect(await screen.findByTestId('owned')).toHaveTextContent(/^gin$/)
  expect(screen.getByTestId('favourites')).toHaveTextContent(/^$/)
})

it('keeps working and warns when saving fails', async () => {
  const store: UserDataStore = {
    persistent: true,
    load: async () => confirmed(),
    save: async () => {
      throw new Error('quota exceeded')
    },
  }
  const { user } = renderApp(<Probe />, { store })
  expect(await screen.findByTestId('persistent')).toHaveTextContent('true')
  await user.click(screen.getByRole('button', { name: 'gin' }))
  expect(screen.getByTestId('owned')).toHaveTextContent('ice,sugar,gin')
  await waitFor(() => expect(screen.getByTestId('persistent')).toHaveTextContent('false'))
})

it('starts fresh when loading fails', async () => {
  const store: UserDataStore = {
    ...memoryStore(),
    load: async () => {
      throw new Error('corrupt')
    },
  }
  renderApp(<Probe />, { store })
  expect(await screen.findByTestId('owned')).toHaveTextContent('ice,sugar')
  expect(screen.getByTestId('persistent')).toHaveTextContent('false')
})

describe('asking the browser to keep saved data', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'storage')
  })

  it('asks once, on the first change, not on load', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    Object.defineProperty(navigator, 'storage', { value: { persist }, configurable: true })
    const { user } = renderApp(<Probe />, { data: confirmed() })
    await screen.findByTestId('owned')
    expect(persist).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'gin' }))
    await user.click(screen.getByRole('button', { name: 'fav' }))
    expect(persist).toHaveBeenCalledTimes(1)
  })

  it('carries on when the browser refuses or lacks the feature', async () => {
    Object.defineProperty(navigator, 'storage', { value: { persist: () => Promise.reject(new Error('no')) }, configurable: true })
    const { user } = renderApp(<Probe />, { data: confirmed() })
    await user.click(await screen.findByRole('button', { name: 'gin' }))
    expect(screen.getByTestId('owned')).toHaveTextContent('ice,sugar,gin')
  })
})

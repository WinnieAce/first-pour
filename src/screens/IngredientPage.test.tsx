import { screen, within } from '@testing-library/react'
import App from '../App'
import { confirmed, renderApp } from '../test/render'

const open = async (id: string, data = confirmed()) => {
  const view = renderApp(<App />, { data, route: `/ingredients/${id}` })
  await screen.findByRole('heading', { level: 1 })
  return view
}

it('shows the name, description and strength', async () => {
  await open('bourbon')
  expect(screen.getByRole('heading', { level: 1, name: 'Bourbon' })).toBeInTheDocument()
  expect(screen.getByText(/sweet and oaky/i)).toBeInTheDocument()
  expect(screen.getByText(/40% alcohol/i)).toBeInTheDocument()
})

it('shows pairings with reasons, as links', async () => {
  await open('bourbon')
  const pairings = screen.getByRole('list', { name: 'Goes well with' })
  expect(within(pairings).getByRole('link', { name: 'Lemon juice' })).toHaveAttribute('href', '/ingredients/lemon-juice')
  expect(within(pairings).getByText(/lemon brightens the oak/i)).toBeInTheDocument()
})

it('shows substitutes as links', async () => {
  await open('bourbon')
  const swaps = screen.getByRole('list', { name: 'You can swap it for' })
  expect(within(swaps).getByRole('link', { name: 'Rye whiskey' })).toHaveAttribute('href', '/ingredients/rye')
})

it('leaves out the pairing and substitute sections when there are none', async () => {
  await open('ice')
  expect(screen.queryByRole('list', { name: 'Goes well with' })).not.toBeInTheDocument()
  expect(screen.queryByRole('list', { name: 'You can swap it for' })).not.toBeInTheDocument()
})

it('lists every drink that uses it', async () => {
  await open('bourbon')
  const drinks = within(screen.getByRole('list', { name: 'Drinks that use it' })).getAllByRole('heading')
  expect(drinks.map((d) => d.textContent)).toEqual(['Old Fashioned', 'Whiskey Sour'])
})

it('says so when no drink uses it', async () => {
  await open('gin')
  expect(screen.getByText(/no drinks in the library use this yet/i)).toBeInTheDocument()
})

it('the bar control adds and removes it', async () => {
  const { user, store } = await open('bourbon')
  const button = screen.getByRole('button', { name: /my bar/i })
  expect(button).toHaveAttribute('aria-pressed', 'false')
  await user.click(button)
  expect(button).toHaveAttribute('aria-pressed', 'true')
  expect((await store.load())!.ownedIngredientIds).toContain('bourbon')
  await user.click(button)
  expect((await store.load())!.ownedIngredientIds).not.toContain('bourbon')
})

it('an unknown ingredient id shows not-found', async () => {
  await open('nope')
  expect(screen.getByRole('heading', { name: /couldn't find that ingredient/i })).toBeInTheDocument()
})

import { screen, within } from '@testing-library/react'
import App from '../App'
import { confirmed, renderApp } from '../test/render'

const open = async (ownedIngredientIds: string[] = ['ice', 'sugar']) => {
  const view = renderApp(<App />, { data: confirmed({ ownedIngredientIds }), route: '/bar' })
  await screen.findByRole('heading', { level: 1, name: 'My bar' })
  return view
}
const boxes = (group: string) =>
  within(screen.getByRole('group', { name: group }))
    .getAllByRole('checkbox')
    .map((c) => c.getAttribute('aria-label') ?? (c as HTMLInputElement).labels?.[0]?.textContent)
const items = (list: string) =>
  within(screen.getByRole('list', { name: list }))
    .getAllByRole('listitem')
    .map((li) => li.textContent)

it('shows common bottles in a quick-pick section first', async () => {
  await open()
  expect(screen.getAllByRole('group').filter((g) => g.tagName === 'FIELDSET')[0]).toBe(screen.getByRole('group', { name: 'Common bottles' }))
  expect(boxes('Common bottles')).toEqual(['Bourbon', 'Gin', 'White rum'])
})

it('groups the remaining ingredients by category', async () => {
  await open()
  expect(boxes('Spirits')).toEqual(['Rye whiskey'])
  expect(boxes('Fresh ingredients')).toEqual(['Egg white', 'Lemon juice', 'Lime juice'])
  expect(boxes('Kitchen staples')).toEqual(['Ice', 'Sugar'])
})

it('staples start ticked and can be unticked', async () => {
  const { user, store } = await open()
  const ice = screen.getByRole('checkbox', { name: 'Ice' })
  expect(ice).toBeChecked()
  await user.click(ice)
  expect(ice).not.toBeChecked()
  expect((await store.load())!.ownedIngredientIds).toEqual(['sugar'])
})

it('with only staples, explains what to do first and shows no results', async () => {
  await open()
  expect(screen.getByText(/tick the bottles you have/i)).toBeInTheDocument()
  expect(screen.queryByRole('list', { name: 'Can make now' })).not.toBeInTheDocument()
})

it('ticking updates "Can make now" immediately', async () => {
  const { user } = await open()
  for (const name of ['White rum', 'Lime juice', 'Simple syrup']) {
    await user.click(screen.getByRole('checkbox', { name }))
  }
  await user.click(screen.getByRole('button', { name: /what i can make/i }))
  expect(within(screen.getByRole('list', { name: 'Can make now' })).getByRole('link', { name: /Daiquiri/ })).toHaveAttribute(
    'href',
    '/drinks/daiquiri',
  )
})

it('"One ingredient short" names the missing ingredient', async () => {
  await open(['white-rum', 'lime-juice', 'simple-syrup'])
  expect(items('One ingredient short')).toEqual(['Lime Soda needs Soda water'])
})

it('"Best next purchase" lists ingredients with how many drinks each unlocks', async () => {
  await open(['lime-juice', 'simple-syrup', 'lemon-juice'])
  expect(items('Best next purchase')).toEqual([
    'Bourbon unlocks 1 drink',
    'Soda water unlocks 1 drink',
    'White rum unlocks 1 drink',
    'Rye whiskey unlocks 1 drink',
  ])
})

it('uses the plural when a purchase unlocks several drinks', async () => {
  await open(['lemon-juice', 'simple-syrup', 'angostura-bitters', 'lime-juice'])
  expect(items('Best next purchase')[0]).toBe('Bourbon unlocks 2 drinks')
})

it('says so when nothing can be made yet', async () => {
  await open(['gin'])
  expect(screen.getByText(/nothing yet/i)).toBeInTheDocument()
})

it('each ingredient links to its page', async () => {
  await open()
  expect(screen.getByRole('link', { name: 'About Bourbon' })).toHaveAttribute('href', '/ingredients/bourbon')
})

it('opens on the bottle list for a new bar and on the results once there are bottles', async () => {
  const first = await open()
  expect(screen.getByRole('button', { name: /my bottles/i })).toHaveAttribute('aria-pressed', 'true')
  first.unmount()
  await open(['white-rum'])
  expect(screen.getByRole('button', { name: /what i can make/i })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.queryByRole('group', { name: 'Common bottles' })).not.toBeInTheDocument()
})

it('ticking a bottle does not insert anything above the list, and the count updates on the button', async () => {
  const { user } = await open()
  const before = screen.getByRole('heading', { level: 1 }).parentElement!.querySelectorAll('section').length
  for (const name of ['White rum', 'Lime juice', 'Simple syrup']) {
    await user.click(screen.getByRole('checkbox', { name }))
  }
  expect(screen.getByRole('heading', { level: 1 }).parentElement!.querySelectorAll('section').length).toBe(before)
  expect(screen.getByRole('button', { name: /what i can make/i })).toHaveTextContent('What I can make (1)')
  expect(screen.getByRole('group', { name: 'Common bottles' })).toBeInTheDocument()
})

it('can switch back to the bottle list', async () => {
  const { user } = await open(['white-rum'])
  await user.click(screen.getByRole('button', { name: /my bottles/i }))
  expect(screen.getByRole('checkbox', { name: 'White rum' })).toBeChecked()
})

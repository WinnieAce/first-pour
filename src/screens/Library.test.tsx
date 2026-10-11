import { screen, within } from '@testing-library/react'
import App from '../App'
import { confirmed, renderApp } from '../test/render'

const drinkNames = () =>
  within(screen.getByRole('list', { name: 'Drinks' }))
    .getAllByRole('heading')
    .map((h) => h.textContent)

const open = async (data = confirmed(), route = '/') => {
  const view = renderApp(<App />, { data, route })
  await screen.findByRole('list', { name: 'Drinks' })
  return view
}

it('lists every drink by name', async () => {
  await open()
  expect(drinkNames()).toEqual(['Daiquiri', 'Lime Soda', 'Old Fashioned', 'Whiskey Sour'])
})

it('each drink links to its page', async () => {
  await open()
  expect(screen.getByRole('link', { name: /Daiquiri/ })).toHaveAttribute('href', '/drinks/daiquiri')
})

it('typing in search narrows the list', async () => {
  const { user } = await open()
  await user.type(screen.getByLabelText(/search/i), 'bourbon')
  expect(drinkNames()).toEqual(['Old Fashioned', 'Whiskey Sour'])
})

it('filters by family', async () => {
  const { user } = await open()
  await user.selectOptions(screen.getByLabelText('Family'), 'Sours')
  expect(drinkNames()).toEqual(['Daiquiri', 'Whiskey Sour'])
})

it('filters by base spirit, offering only spirits that are the base of a drink', async () => {
  const { user } = await open()
  const select = screen.getByLabelText('Base spirit')
  expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['Any', 'Bourbon', 'White rum'])
  await user.selectOptions(select, 'Bourbon')
  expect(drinkNames()).toEqual(['Old Fashioned', 'Whiskey Sour'])
})

it('filters by flavour and difficulty together', async () => {
  const { user } = await open()
  await user.selectOptions(screen.getByLabelText('Flavour'), 'Sour')
  await user.selectOptions(screen.getByLabelText('Difficulty'), 'Easy')
  expect(drinkNames()).toEqual(['Daiquiri', 'Lime Soda'])
})

it('"Only drinks I can make" uses the bar', async () => {
  const { user } = await open(confirmed({ ownedIngredientIds: ['white-rum', 'lime-juice', 'simple-syrup'] }))
  await user.click(screen.getByLabelText(/only drinks i can make/i))
  expect(drinkNames()).toEqual(['Daiquiri'])
})

it('marks drinks the user can make', async () => {
  await open(confirmed({ ownedIngredientIds: ['white-rum', 'lime-juice', 'simple-syrup'] }))
  expect(within(screen.getByRole('link', { name: /Daiquiri/ })).getByText(/you can make this/i)).toBeInTheDocument()
  expect(within(screen.getByRole('link', { name: /Old Fashioned/ })).queryByText(/you can make this/i)).not.toBeInTheDocument()
})

it('shows a helpful message and a clear-filters button when nothing matches', async () => {
  const { user } = await open()
  await user.type(screen.getByLabelText(/search/i), 'zzz')
  expect(screen.getByText(/no drinks match/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /clear filters/i }))
  expect(drinkNames()).toHaveLength(4)
  expect(screen.getByLabelText(/search/i)).toHaveValue('')
})

it('reads filters from the address', async () => {
  await open(confirmed(), '/?q=daiq&family=sour')
  expect(drinkNames()).toEqual(['Daiquiri'])
  expect(screen.getByLabelText(/search/i)).toHaveValue('daiq')
})

it('ignores unknown filter values in the address', async () => {
  await open(confirmed(), '/?family=nonsense&difficulty=impossible')
  expect(drinkNames()).toHaveLength(4)
})

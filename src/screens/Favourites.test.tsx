import { screen, within } from '@testing-library/react'
import App from '../App'
import { confirmed, renderApp } from '../test/render'

const open = async (favouriteDrinkIds: string[]) => {
  renderApp(<App />, { data: confirmed({ favouriteDrinkIds }), route: '/favourites' })
  await screen.findByRole('heading', { level: 1, name: 'Favourites' })
}

it('lists favourited drinks by name', async () => {
  await open(['whiskey-sour', 'daiquiri'])
  const names = within(screen.getByRole('list', { name: 'Favourites' })).getAllByRole('heading')
  expect(names.map((h) => h.textContent)).toEqual(['Daiquiri', 'Whiskey Sour'])
  expect(screen.getByRole('link', { name: /Daiquiri/ })).toHaveAttribute('href', '/drinks/daiquiri')
})

it('explains how to add favourites when there are none', async () => {
  await open([])
  expect(screen.getByText(/no favourites yet/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /browse the drinks/i })).toHaveAttribute('href', '/')
})

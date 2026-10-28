import { screen, within } from '@testing-library/react'
import App from '../App'
import { confirmed, renderApp } from '../test/render'

const open = async (route: string, heading: string) => {
  const view = renderApp(<App />, { data: confirmed(), route })
  await screen.findByRole('heading', { level: 1, name: heading })
  return view
}

it('has no Back button on the main screens', async () => {
  await open('/', 'Drinks')
  expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
})

it('Back returns from a drink to the list it was opened from, filters included', async () => {
  const { user } = await open('/?q=daiq', 'Drinks')
  await user.click(within(screen.getByRole('list', { name: 'Drinks' })).getByRole('link', { name: /Daiquiri/ }))
  await screen.findByRole('heading', { level: 1, name: 'Daiquiri' })
  await user.click(screen.getByRole('button', { name: /back/i }))
  await screen.findByRole('heading', { level: 1, name: 'Drinks' })
  expect(screen.getByLabelText(/search/i)).toHaveValue('daiq')
})

it('Back goes to the drinks list when the page was opened directly', async () => {
  const { user } = await open('/drinks/daiquiri', 'Daiquiri')
  await user.click(screen.getByRole('button', { name: /back/i }))
  expect(await screen.findByRole('heading', { level: 1, name: 'Drinks' })).toBeInTheDocument()
})

it('shows Back on ingredient pages too', async () => {
  await open('/ingredients/gin', 'Gin')
  expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
})

it('marks the current section with a single highlight that slides between tabs', async () => {
  await open('/favourites', 'Favourites')
  const nav = screen.getByRole('navigation', { name: 'Main' })
  const pills = nav.querySelectorAll('.nav-pill')
  expect(pills).toHaveLength(1)
  // The highlight sits under the third tab, and only ever moves sideways within the nav.
  expect(nav.style.getPropertyValue('--active')).toBe('2')
  expect(pills[0]).not.toHaveAttribute('data-hidden', 'true')
  expect(screen.getByRole('link', { name: 'Favourites' })).toHaveAttribute('aria-current', 'page')
})

it('hides the highlight on pages that are not one of the main sections', async () => {
  await open('/drinks/daiquiri', 'Daiquiri')
  expect(document.querySelector('.nav-pill')).toHaveAttribute('data-hidden', 'true')
})

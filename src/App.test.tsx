import { screen } from '@testing-library/react'
import App from './App'
import { confirmed, renderApp } from './test/render'

it('shows the app name in the header', async () => {
  renderApp(<App />, { data: confirmed() })
  expect(await screen.findByRole('link', { name: 'First Pour' })).toHaveAttribute('href', '/')
})

it('has navigation to the four main sections', async () => {
  renderApp(<App />, { data: confirmed() })
  const nav = await screen.findByRole('navigation')
  for (const [name, href] of [['Drinks', '/'], ['My bar', '/bar'], ['Favourites', '/favourites'], ['Settings', '/settings']]) {
    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    expect(nav).toContainElement(screen.getByRole('link', { name }))
  }
})

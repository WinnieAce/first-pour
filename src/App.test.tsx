import { screen, waitFor } from '@testing-library/react'
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

describe('moving between screens', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  })

  it('names the screen in the page title on first load without moving focus', async () => {
    renderApp(<App />, { data: confirmed() })
    await screen.findByRole('heading', { level: 1, name: 'Drinks' })
    await waitFor(() => expect(document.title).toBe('Drinks · First Pour'))
    expect(document.activeElement).toBe(document.body)
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('opening a drink scrolls to the top, focuses its heading and updates the title', async () => {
    const { user } = renderApp(<App />, { data: confirmed() })
    await user.click((await screen.findAllByRole('link', { name: /Daiquiri/ }))[0])
    const heading = await screen.findByRole('heading', { level: 1, name: 'Daiquiri' })
    await waitFor(() => expect(document.title).toBe('Daiquiri · First Pour'))
    expect(heading).toHaveFocus()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('changing a filter does not move focus or scroll', async () => {
    const { user } = renderApp(<App />, { data: confirmed() })
    const search = await screen.findByLabelText(/search/i)
    await user.type(search, 'daiq')
    expect(search).toHaveFocus()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})

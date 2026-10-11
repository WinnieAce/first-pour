import { screen } from '@testing-library/react'
import App from '../App'
import { confirmed, memoryStore, renderApp } from '../test/render'

it('shows the age gate on first visit and hides drink content', async () => {
  renderApp(<App />)
  expect(await screen.findByRole('heading', { name: /legal drinking age/i })).toBeInTheDocument()
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  expect(screen.getByText(/drink responsibly/i)).toBeInTheDocument()
})

it('confirming saves the choice and shows the app', async () => {
  const store = memoryStore()
  const { user } = renderApp(<App />, { store })
  await user.click(await screen.findByRole('button', { name: /yes, i am/i }))
  expect(screen.getByRole('navigation')).toBeInTheDocument()
  expect((await store.load())!.settings.ageConfirmed).toBe(true)
})

it('declining shows a message and no content, and is not saved', async () => {
  const store = memoryStore()
  const { user } = renderApp(<App />, { store })
  await user.click(await screen.findByRole('button', { name: /^no$/i }))
  expect(screen.getByText(/come back when/i)).toBeInTheDocument()
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /yes, i am/i })).not.toBeInTheDocument()
  expect((await store.load())?.settings.ageConfirmed ?? false).toBe(false)
})

it('does not show the gate once confirmed', async () => {
  renderApp(<App />, { data: confirmed() })
  expect(await screen.findByRole('navigation')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /legal drinking age/i })).not.toBeInTheDocument()
})

it('the terms page is readable without confirming', async () => {
  renderApp(<App />, { route: '/terms' })
  expect(await screen.findByRole('heading', { name: /terms and privacy/i })).toBeInTheDocument()
  expect(screen.getByText(/no personal data/i)).toBeInTheDocument()
})

it('the age gate links to the terms page', async () => {
  const { user } = renderApp(<App />)
  await user.click(await screen.findByRole('link', { name: /terms and privacy/i }))
  expect(screen.getByRole('heading', { name: /terms and privacy/i })).toBeInTheDocument()
})

it('shows the not-saved notice when the store is not persistent', async () => {
  renderApp(<App />, { data: confirmed() })
  expect(await screen.findByText(/won't be saved/i)).toBeInTheDocument()
})

it('shows no not-saved notice when the store is persistent', async () => {
  const store = { ...memoryStore(confirmed()), persistent: true }
  renderApp(<App />, { store })
  await screen.findByRole('navigation')
  expect(screen.queryByText(/won't be saved/i)).not.toBeInTheDocument()
})

it('unknown addresses show not-found with a link to the library', async () => {
  renderApp(<App />, { data: confirmed(), route: '/no/such/page' })
  expect(await screen.findByRole('heading', { name: /couldn't find/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /all drinks/i })).toHaveAttribute('href', '/')
})

import { screen } from '@testing-library/react'
import axe from 'axe-core'
import App from './App'
import { confirmed, renderApp } from './test/render'

// Automated accessibility rules on every screen. Colour contrast cannot be measured in this
// test environment; the palette is checked separately (see README).
const owned = confirmed({ ownedIngredientIds: ['white-rum', 'lime-juice', 'sugar'], favouriteDrinkIds: ['daiquiri'] })

const violations = async () => {
  const results = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } })
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)
}

it.each([
  ['library', '/'],
  ['drink page', '/drinks/whiskey-sour'],
  ['making mode', '/drinks/whiskey-sour/make'],
  ['ingredient page', '/ingredients/bourbon'],
  ['my bar, results', '/bar'],
  ['favourites', '/favourites'],
  ['settings', '/settings'],
  ['terms', '/terms'],
  ['not found', '/nowhere'],
])('%s has no accessibility violations', async (_name, route) => {
  renderApp(<App />, { data: owned, route })
  await screen.findByRole('heading', { level: 1 })
  expect(await violations()).toEqual([])
})

it('my bar, bottle list has no accessibility violations', async () => {
  const { user } = renderApp(<App />, { data: owned, route: '/bar' })
  await user.click(await screen.findByRole('button', { name: /my bottles/i }))
  expect(await violations()).toEqual([])
})

it('the age gate has no accessibility violations', async () => {
  renderApp(<App />)
  await screen.findByRole('heading', { level: 1 })
  expect(await violations()).toEqual([])
})

it('the checker itself catches a known problem', async () => {
  document.body.innerHTML = '<main><h1>Test</h1><img src="x.png" /></main>'
  expect((await violations()).join()).toContain('image-alt')
})

import { screen, within } from '@testing-library/react'
import App from '../App'
import { confirmed, renderApp } from '../test/render'

const open = async (id = 'daiquiri', data = confirmed()) => {
  const view = renderApp(<App />, { data, route: `/drinks/${id}/make` })
  await screen.findByRole('heading', { level: 1 })
  return view
}
const next = () => screen.getByRole('button', { name: /^(start|next|done)$/i })
const back = () => screen.getByRole('button', { name: /^back$/i })
const rows = () =>
  within(screen.getByRole('list', { name: 'Ingredients' }))
    .getAllByRole('listitem')
    .map((li) => li.textContent)

it('starts with a gather screen listing all ingredients, glass and tools', async () => {
  await open()
  expect(screen.getByRole('heading', { level: 1, name: 'Daiquiri' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /gather everything/i })).toBeInTheDocument()
  expect(rows()).toEqual(['60 mlWhite rum', '25 mlLime juice', '15 mlSimple syrup'])
  expect(screen.getByText(/coupe/i)).toBeInTheDocument()
  const tool = within(screen.getByRole('list', { name: 'Tools' })).getByRole('listitem')
  expect(tool).toHaveTextContent(/shaker/i)
  expect(tool).toHaveTextContent(/jam jar/i)
})

it('marks optional ingredients on the gather screen', async () => {
  await open('whiskey-sour')
  expect(rows()).toContain('1Egg white (optional)')
})

it('hides the main navigation', async () => {
  await open()
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
})

it('shows one step at a time with its position', async () => {
  const { user } = await open()
  await user.click(next())
  expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  expect(screen.getByText('Add the rum, lime juice and syrup to a shaker with ice.')).toBeInTheDocument()
  expect(screen.queryByText('Shake hard for about 12 seconds.')).not.toBeInTheDocument()
})

it('each step shows its ingredients with measures', async () => {
  const { user } = await open()
  await user.click(next())
  expect(rows()).toEqual(['60 mlWhite rum', '25 mlLime juice', '15 mlSimple syrup'])
  await user.click(next())
  expect(screen.queryByRole('list', { name: 'Ingredients' })).not.toBeInTheDocument()
})

it('back is disabled on the first screen and returns to the previous one after that', async () => {
  const { user } = await open()
  expect(back()).toBeDisabled()
  await user.click(next())
  await user.click(next())
  expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
  await user.click(back())
  expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
})

it('the forward button reads Start, then Next, then Done', async () => {
  const { user } = await open()
  expect(next()).toHaveTextContent('Start')
  await user.click(next())
  expect(next()).toHaveTextContent('Next')
  await user.click(next())
  await user.click(next())
  expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
  expect(next()).toHaveTextContent('Done')
})

it('Done returns to the drink page', async () => {
  const { user } = await open()
  for (let i = 0; i < 4; i++) await user.click(next())
  expect(screen.getByRole('link', { name: /start making/i })).toBeInTheDocument()
})

it('changing servings scales measures', async () => {
  const { user } = await open()
  const more = screen.getByRole('button', { name: /more servings/i })
  for (let i = 0; i < 3; i++) await user.click(more)
  expect(screen.getByText('4 servings')).toBeInTheDocument()
  expect(rows()).toEqual(['240 mlWhite rum', '100 mlLime juice', '60 mlSimple syrup'])
})

it('servings cannot go below 1 or above 8', async () => {
  const { user } = await open()
  expect(screen.getByText('1 serving')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /fewer servings/i })).toBeDisabled()
  const more = screen.getByRole('button', { name: /more servings/i })
  for (let i = 0; i < 7; i++) await user.click(more)
  expect(screen.getByText('8 servings')).toBeInTheDocument()
  expect(more).toBeDisabled()
})

it('servings carry across steps', async () => {
  const { user } = await open()
  await user.click(screen.getByRole('button', { name: /more servings/i }))
  await user.click(next())
  expect(rows()[0]).toBe('120 mlWhite rum')
})

it('the units switch changes measures and saves the setting', async () => {
  const { user, store } = await open()
  const oz = screen.getByRole('button', { name: 'oz' })
  expect(oz).toHaveAttribute('aria-pressed', 'false')
  await user.click(oz)
  expect(oz).toHaveAttribute('aria-pressed', 'true')
  expect(rows()).toEqual(['2 ozWhite rum', '¾ ozLime juice', '½ ozSimple syrup'])
  expect((await store.load())!.settings.units).toBe('oz')
})

it('a step with a technique shows what to do, why, and the no-tool alternative', async () => {
  const { user } = await open()
  await user.click(next())
  expect(screen.queryByRole('note')).not.toBeInTheDocument()
  await user.click(next())
  const note = screen.getByRole('note')
  expect(note).toHaveTextContent(/until the outside feels very cold/i)
  expect(note).toHaveTextContent(/why:/i)
  expect(note).toHaveTextContent(/jam jar/i)
})

it('links back to the drink page', async () => {
  await open()
  expect(screen.getByRole('link', { name: /back to daiquiri/i })).toHaveAttribute('href', '/drinks/daiquiri')
})

it('an unknown drink id shows not-found', async () => {
  await open('nope')
  expect(screen.getByRole('heading', { name: /couldn't find that drink/i })).toBeInTheDocument()
})

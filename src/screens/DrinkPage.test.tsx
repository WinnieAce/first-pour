import { screen, within } from '@testing-library/react'
import App from '../App'
import { fixtureContent } from '../test/fixtures'
import { confirmed, renderApp } from '../test/render'

const open = async (id: string, data = confirmed()) => {
  const view = renderApp(<App />, { data, route: `/drinks/${id}` })
  await screen.findByRole('heading', { level: 1 })
  return view
}
const row = (name: string) => screen.getByRole('link', { name }).closest('li')!

it('shows the drink name', async () => {
  await open('daiquiri')
  expect(screen.getByRole('heading', { level: 1, name: 'Daiquiri' })).toBeInTheDocument()
})

it('shows ingredients with measures in millilitres', async () => {
  await open('daiquiri')
  expect(within(row('White rum')).getByText('60 ml')).toBeInTheDocument()
  expect(within(row('Lime juice')).getByText('25 ml')).toBeInTheDocument()
})

it('shows measures in ounces when that is the setting', async () => {
  await open('daiquiri', confirmed({ units: 'oz' }))
  expect(within(row('White rum')).getByText('2 oz')).toBeInTheDocument()
  expect(within(row('Simple syrup')).getByText('½ oz')).toBeInTheDocument()
})

it('marks owned and missing ingredients', async () => {
  await open('daiquiri', confirmed({ ownedIngredientIds: ['white-rum'] }))
  expect(within(row('White rum')).getByText(/in your bar/i)).toBeInTheDocument()
  expect(within(row('Lime juice')).getByText(/not in your bar/i)).toBeInTheDocument()
})

it('says when an owned substitute covers an ingredient', async () => {
  await open('whiskey-sour', confirmed({ ownedIngredientIds: ['rye'] }))
  expect(within(row('Bourbon')).getByText(/use your rye whiskey/i)).toBeInTheDocument()
})

it('lists substitutes for an ingredient', async () => {
  await open('whiskey-sour')
  expect(within(row('Bourbon')).getByText(/or rye whiskey/i)).toBeInTheDocument()
})

it('labels optional ingredients and shows their note', async () => {
  await open('whiskey-sour')
  expect(within(row('Egg white')).getByText(/optional/i)).toBeInTheDocument()
  expect(within(row('Egg white')).getByText(/for a foamy top/i)).toBeInTheDocument()
})

it('shows the steps in order', async () => {
  await open('daiquiri')
  const steps = within(screen.getByRole('list', { name: 'Steps' })).getAllByRole('listitem')
  expect(steps.map((s) => s.textContent)).toEqual([
    'Add the rum, lime juice and syrup to a shaker with ice.',
    'Shake hard for about 12 seconds.',
    'Strain into a chilled glass.',
  ])
})

it('shows the glass and tools with a household alternative', async () => {
  await open('daiquiri')
  expect(screen.getByText(/coupe/i)).toBeInTheDocument()
  const tool = within(screen.getByRole('list', { name: 'Tools' })).getByRole('listitem')
  expect(tool).toHaveTextContent(/shaker/i)
  expect(tool).toHaveTextContent(/jam jar/i)
})

it('shows why it works, the family description, and links to other family members', async () => {
  await open('daiquiri')
  expect(screen.getByText(/rum is the strong part/i)).toBeInTheDocument()
  expect(screen.getByText(/strong, sour and sweet balance each other/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Whiskey Sour' })).toHaveAttribute('href', '/drinks/whiskey-sour')
  expect(screen.queryByRole('link', { name: 'Old Fashioned' })).not.toBeInTheDocument()
})

it('shows strength and standard drinks labelled approximate', async () => {
  await open('daiquiri')
  expect(screen.getByText('19%')).toBeInTheDocument()
  expect(screen.getByText('1.9')).toBeInTheDocument()
  expect(screen.getByText('18.9 g')).toBeInTheDocument()
  expect(screen.getByText(/approximate/i)).toHaveTextContent(/varies by country/i)
})

it('shows allergens when there are any', async () => {
  await open('whiskey-sour')
  expect(screen.getByText(/contains: egg/i)).toBeInTheDocument()
})

it('shows no allergen line when there are none', async () => {
  await open('daiquiri')
  expect(screen.queryByText(/contains:/i)).not.toBeInTheDocument()
})

it('favourite button toggles and persists', async () => {
  const { user, store } = await open('daiquiri')
  const button = screen.getByRole('button', { name: /favourite/i })
  expect(button).toHaveAttribute('aria-pressed', 'false')
  await user.click(button)
  expect(button).toHaveAttribute('aria-pressed', 'true')
  expect((await store.load())!.favouriteDrinkIds).toEqual(['daiquiri'])
  await user.click(button)
  expect((await store.load())!.favouriteDrinkIds).toEqual([])
})

it('links to making mode', async () => {
  await open('daiquiri')
  expect(screen.getByRole('link', { name: /start making/i })).toHaveAttribute('href', '/drinks/daiquiri/make')
})

it('shows the responsible-drinking notice', async () => {
  await open('daiquiri')
  expect(screen.getByText(/drink responsibly/i)).toBeInTheDocument()
})

it('a no-alcohol drink is labelled as such', async () => {
  await open('lime-soda')
  expect(screen.getByText('No alcohol')).toBeInTheDocument()
})

it('an unknown drink id shows not-found', async () => {
  await open('nope')
  expect(screen.getByRole('heading', { name: /couldn't find that drink/i })).toBeInTheDocument()
})

it('does not call a drink alcohol-free when it has a few dashes of bitters', async () => {
  const content = structuredClone(fixtureContent)
  content.drinks.push({
    ...content.drinks.find((d) => d.id === 'lime-soda')!,
    id: 'bitters-soda',
    name: 'Bitters and Soda',
    ingredients: [
      { ingredientId: 'soda-water', amount: 150, unit: 'ml', optional: false },
      { ingredientId: 'angostura-bitters', amount: 4, unit: 'dash', optional: false },
    ],
  })
  renderApp(<App />, { data: confirmed(), route: '/drinks/bitters-soda', content })
  await screen.findByRole('heading', { level: 1, name: 'Bitters and Soda' })
  expect(screen.queryByText('No alcohol')).not.toBeInTheDocument()
  expect(screen.getByText('Under 1%')).toBeInTheDocument()
})

it('draws the proportions of the measured ingredients as a pour bar', async () => {
  renderApp(<App />, { data: confirmed(), route: '/drinks/daiquiri' })
  const bar = await screen.findByRole('img', { name: /proportions/i })
  expect(bar).toHaveAccessibleName('Proportions by volume: White rum 60, Lime juice 25, Simple syrup 15')
  expect(bar.children).toHaveLength(3)
})

it('fills the big glass with the colour of the drink', async () => {
  renderApp(<App />, { data: confirmed(), route: '/drinks/daiquiri' })
  await screen.findByRole('heading', { level: 1, name: 'Daiquiri' })
  expect(document.querySelector('.drink-hero .liquid')).toHaveAttribute('fill', '#e6e2b8')
})

it('dresses the big glass the way the drink is served', async () => {
  renderApp(<App />, { data: confirmed(), route: '/drinks/lime-soda' })
  await screen.findByRole('heading', { level: 1, name: 'Lime Soda' })
  const hero = document.querySelector('.drink-hero')!
  expect(hero.querySelectorAll('.ice')).toHaveLength(2)
  expect(hero.querySelector('.straw')).toBeInTheDocument()
  expect(hero.querySelectorAll('.bubble').length).toBeGreaterThan(0)
  expect(hero.querySelectorAll('.wave')).toHaveLength(2)
})

it('leaves ice and a straw out of a drink served without them', async () => {
  renderApp(<App />, { data: confirmed(), route: '/drinks/daiquiri' })
  await screen.findByRole('heading', { level: 1, name: 'Daiquiri' })
  const hero = document.querySelector('.drink-hero')!
  expect(hero.querySelector('.ice')).not.toBeInTheDocument()
  expect(hero.querySelector('.straw')).not.toBeInTheDocument()
})

it('pops the star when the drink is added to favourites, and only then', async () => {
  const { user } = renderApp(<App />, { data: confirmed(), route: '/drinks/daiquiri' })
  const button = await screen.findByRole('button', { name: /add to favourites/i })
  expect(button.querySelector('.icon.pop')).not.toBeInTheDocument()
  await user.click(button)
  expect(screen.getByRole('button', { name: /in your favourites/i }).querySelector('.icon.pop')).toBeInTheDocument()
})

it('does not pop the star for a drink that was already a favourite', async () => {
  renderApp(<App />, { data: confirmed({ favouriteDrinkIds: ['daiquiri'] }), route: '/drinks/daiquiri' })
  const button = await screen.findByRole('button', { name: /in your favourites/i })
  expect(button.querySelector('.icon.pop')).not.toBeInTheDocument()
})

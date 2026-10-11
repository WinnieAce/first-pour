import type { Content, Drink, Ingredient } from '../content/schema'
import { fixtureContent, fixtureDrink, fixtureIngredientById } from '../test/fixtures'
import { isAvailable, matchBar, missingIngredientIds } from './matching'

const ids = (drinks: Drink[]) => drinks.map((d) => d.id)
const short = (r: ReturnType<typeof matchBar>) => r.oneShort.map((o) => [o.drink.id, o.missingId])

it('finds makeable drinks', () => {
  const r = matchBar(fixtureContent, new Set(['white-rum', 'lime-juice', 'simple-syrup']))
  expect(ids(r.makeable)).toEqual(['daiquiri'])
  expect(short(r)).toEqual([['lime-soda', 'soda-water']])
})

it('counts an owned substitute as available', () => {
  const r = matchBar(fixtureContent, new Set(['rye', 'lemon-juice', 'simple-syrup']))
  expect(ids(r.makeable)).toEqual(['whiskey-sour'])
  expect(short(r)).toEqual([['old-fashioned', 'angostura-bitters']])
})

it('ignores optional ingredients', () => {
  const owned = new Set(['bourbon', 'lemon-juice', 'simple-syrup'])
  expect(missingIngredientIds(fixtureDrink('whiskey-sour'), owned, fixtureIngredientById)).toEqual([])
})

it('lists every missing required ingredient', () => {
  expect(missingIngredientIds(fixtureDrink('old-fashioned'), new Set(['simple-syrup']), fixtureIngredientById)).toEqual([
    'bourbon',
    'angostura-bitters',
  ])
})

it('ranks next purchases by unlocks, then usage, then name', () => {
  const r = matchBar(fixtureContent, new Set(['lime-juice', 'simple-syrup', 'lemon-juice']))
  expect(r.nextPurchases).toEqual([
    { ingredientId: 'bourbon', unlocks: 1 },
    { ingredientId: 'soda-water', unlocks: 1 },
    { ingredientId: 'white-rum', unlocks: 1 },
    { ingredientId: 'rye', unlocks: 1 },
  ])
})

it('ranks a purchase that unlocks more drinks first', () => {
  const r = matchBar(fixtureContent, new Set(['lemon-juice', 'simple-syrup', 'angostura-bitters', 'lime-juice']))
  expect(r.nextPurchases[0]).toEqual({ ingredientId: 'bourbon', unlocks: 2 })
})

it('omits purchases that unlock nothing', () => {
  const r = matchBar(fixtureContent, new Set(['lime-juice', 'simple-syrup', 'lemon-juice']))
  expect(r.nextPurchases.map((p) => p.ingredientId)).not.toContain('gin')
})

it('does not follow substitute chains', () => {
  const ingredient = (id: string, substitutes: string[]): Ingredient => ({
    id, name: id, category: 'spirit', description: 'x', abv: 40, pairsWith: [], substitutes, allergens: [], common: false,
  })
  const a = ingredient('a', ['b'])
  const chain: Content = {
    ingredients: [a, ingredient('b', ['c']), ingredient('c', [])],
    drinks: [{ ...fixtureDrink('daiquiri'), id: 'needs-a', ingredients: [{ ingredientId: 'a', amount: 60, unit: 'ml', optional: false }] }],
  }
  expect(isAvailable(a, new Set(['b']))).toBe(true)
  expect(isAvailable(a, new Set(['c']))).toBe(false)
  expect(matchBar(chain, new Set(['c'])).makeable).toEqual([])
})

it('returns empty groups for an empty bar', () => {
  const r = matchBar(fixtureContent, new Set())
  expect(r.makeable).toEqual([])
  expect(r.oneShort).toEqual([])
})

it('returns empty groups for empty content', () => {
  expect(matchBar({ ingredients: [], drinks: [] }, new Set(['gin']))).toEqual({ makeable: [], oneShort: [], nextPurchases: [] })
})

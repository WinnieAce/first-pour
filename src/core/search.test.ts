import type { Drink } from '../content/schema'
import { fixtureContent } from '../test/fixtures'
import { EMPTY_FILTERS, filterDrinks, normalise, type DrinkFilters } from './search'

const ids = (drinks: Drink[]) => drinks.map((d) => d.id)
const run = (filters: Partial<DrinkFilters>, makeable: string[] = []) =>
  ids(filterDrinks(fixtureContent, { ...EMPTY_FILTERS, ...filters }, new Set(makeable)))

it('empty filters return every drink by name', () => {
  expect(run({})).toEqual(['daiquiri', 'lime-soda', 'old-fashioned', 'whiskey-sour'])
})

it.each(['daiq', '  DAIQUIRI ', 'Daïquiri'])('matches the drink name loosely: "%s"', (query) => {
  expect(run({ query })).toEqual(['daiquiri'])
})

it('a query of only spaces returns everything', () => {
  expect(run({ query: '   ' })).toHaveLength(4)
})

it('matches ingredient names', () => {
  expect(run({ query: 'bourbon' })).toEqual(['old-fashioned', 'whiskey-sour'])
})

it('combines filters with AND', () => {
  expect(run({ family: 'sour', baseIngredientId: 'bourbon' })).toEqual(['whiskey-sour'])
})

it('filters by flavour', () => {
  expect(run({ flavour: 'bitter' })).toEqual(['old-fashioned'])
})

it('filters by difficulty', () => {
  expect(run({ difficulty: 'medium' })).toEqual(['whiskey-sour'])
})

it('makeableOnly keeps only ids in makeableIds', () => {
  expect(run({ makeableOnly: true }, ['lime-soda', 'daiquiri'])).toEqual(['daiquiri', 'lime-soda'])
})

it('returns [] when nothing matches', () => {
  expect(run({ query: 'zzz' })).toEqual([])
})

it('normalise strips accents, case and extra spaces', () => {
  expect(normalise('  PIÑA   Colada ')).toBe('pina colada')
})

it.each([
  ['Bee’s Knees', 'bees knees'],
  ["Bee's Knees", 'bees knees'],
  ['No-Alcohol Mule', 'no alcohol mule'],
  ['Lemon, Lime and Bitters', 'lemon lime and bitters'],
  ['gin & tonic', 'gin and tonic'],
  ['old-fashioned', 'old fashioned'],
])('normalise ignores punctuation: %s', (input, out) => {
  expect(normalise(input)).toBe(out)
})

it('matches a hyphenated query against a name written with a space', () => {
  expect(run({ query: 'old-fashioned' })).toEqual(['old-fashioned'])
})

it('matches words in an ingredient description, so brand and style names find drinks', () => {
  expect(run({ query: 'vanilla' })).toEqual(['old-fashioned', 'whiskey-sour'])
})

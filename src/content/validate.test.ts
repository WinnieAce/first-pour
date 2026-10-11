import { fixtureContent } from '../test/fixtures'
import drinks from './drinks.json'
import ingredients from './ingredients.json'
import type { Content } from './schema'
import { validateContent } from './validate'

const clone = (): Content => structuredClone(fixtureContent)

it('accepts the fixture content', () => {
  expect(validateContent(fixtureContent).ok).toBe(true)
})

it('reports a duplicate id', () => {
  const raw = clone()
  raw.drinks.push(raw.drinks[0])
  const r = validateContent(raw)
  expect(r.ok).toBe(false)
  if (!r.ok) expect(r.errors.join()).toContain('daiquiri')
})

it.each<[string, (c: Content) => void]>([
  ['drink ingredient', (c) => { c.drinks[0].ingredients[0].ingredientId = 'nope' }],
  ['substitute', (c) => { c.ingredients[0].substitutes = ['nope'] }],
  ['pairing', (c) => { c.ingredients[0].pairsWith = [{ ingredientId: 'nope', reason: 'x' }] }],
  ['base', (c) => { c.drinks[0].baseIngredientId = 'nope' }],
  ['step ingredient', (c) => { c.drinks[0].steps[0].ingredientIds = ['nope'] }],
])('reports a dangling %s reference', (_name, mutate) => {
  const raw = clone()
  mutate(raw)
  const r = validateContent(raw)
  expect(r.ok).toBe(false)
  if (!r.ok) expect(r.errors.join()).toContain('nope')
})

it('reports every problem, not just the first', () => {
  const raw = clone()
  raw.drinks[0].baseIngredientId = 'nope-one'
  raw.ingredients[0].substitutes = ['nope-two']
  const r = validateContent(raw)
  if (r.ok) throw new Error('expected failure')
  expect(r.errors.join()).toContain('nope-one')
  expect(r.errors.join()).toContain('nope-two')
})

it('reports a malformed record', () => {
  expect(validateContent({ ingredients: [{ id: 'x' }], drinks: [] }).ok).toBe(false)
})

it('rejects a negative amount', () => {
  const raw = clone()
  raw.drinks[0].ingredients[0].amount = -1
  expect(validateContent(raw).ok).toBe(false)
})

it('rejects an abv above 100', () => {
  const raw = clone()
  raw.ingredients[0].abv = 101
  expect(validateContent(raw).ok).toBe(false)
})

it('rejects an id with capitals or spaces', () => {
  const raw = clone()
  raw.ingredients[0].id = 'White Rum'
  expect(validateContent(raw).ok).toBe(false)
})

it('the shipped content is valid', () => {
  const r = validateContent({ ingredients, drinks })
  expect(r).toMatchObject({ ok: true })
})

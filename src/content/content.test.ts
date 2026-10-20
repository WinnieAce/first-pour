import { EMPTY_FILTERS, filterDrinks } from '../core/search'
import { calculateStrength } from '../core/strength'
import { content, ingredientById } from './index'

// Guards on the shipped library, so later edits keep to the launch targets in the design spec.

it('has at least 40 drinks', () => {
  expect(content.drinks.length).toBeGreaterThanOrEqual(40)
})

it('has at least 5 low- or no-alcohol drinks', () => {
  const light = content.drinks.filter((d) => calculateStrength(d, ingredientById).abvPercent <= 1)
  expect(light.length).toBeGreaterThanOrEqual(5)
})

it('every drink mentions each of its ingredients in a step', () => {
  const missing = content.drinks.flatMap((d) => {
    const inSteps = new Set(d.steps.flatMap((s) => s.ingredientIds))
    return d.ingredients.filter((i) => !inSteps.has(i.ingredientId)).map((i) => `${d.id}: ${i.ingredientId}`)
  })
  expect(missing).toEqual([])
})

it('every step ingredient belongs to its drink', () => {
  const stray = content.drinks.flatMap((d) => {
    const own = new Set(d.ingredients.map((i) => i.ingredientId))
    return d.steps.flatMap((s) => s.ingredientIds.filter((id) => !own.has(id)).map((id) => `${d.id}: ${id}`))
  })
  expect(stray).toEqual([])
})

it("every drink's base is one of its ingredients", () => {
  const wrong = content.drinks.filter(
    (d) => d.baseIngredientId !== null && !d.ingredients.some((i) => i.ingredientId === d.baseIngredientId),
  )
  expect(wrong.map((d) => d.id)).toEqual([])
})

it('every bottle and mixer has at least two pairings', () => {
  const thin = content.ingredients.filter((i) => i.category !== 'staple' && i.pairsWith.length < 2)
  expect(thin.map((i) => i.id)).toEqual([])
})

it('offers a short quick-pick list of common bottles', () => {
  const common = content.ingredients.filter((i) => i.common).length
  expect(common).toBeGreaterThanOrEqual(8)
  expect(common).toBeLessThanOrEqual(15)
})

it('no ingredient lists itself as a substitute or pairing', () => {
  const selfReferring = content.ingredients.filter(
    (i) => i.substitutes.includes(i.id) || i.pairsWith.some((p) => p.ingredientId === i.id),
  )
  expect(selfReferring.map((i) => i.id)).toEqual([])
})

describe('searching the shipped library the way a beginner types', () => {
  const find = (query: string) => filterDrinks(content, { ...EMPTY_FILTERS, query }, new Set()).map((d) => d.id)

  it.each([
    ['lemon lime and bitters', 'lemon-lime-and-bitters'],
    ['no alcohol', 'no-alcohol-mule'],
    ['bee’s knees', 'bees-knees'],
    ['gin & tonic', 'gin-and-tonic'],
    ['old-fashioned', 'old-fashioned'],
    ['prosecco', 'aperol-spritz'],
    ['cointreau', 'margarita'],
    ['whiskey', 'old-fashioned'],
    ['whiskey', 'boulevardier'],
    ['singapore sling', 'singapore-sling'],
    ['milo', 'milo-nightcap'],
    ['kopi', 'iced-kopi-cocktail'],
    ['calamansi', 'calamansi-sparkler'],
    ['palm sugar', 'gula-melaka-old-fashioned'],
    ['caipirinha', 'caipirinha'],
    ['bloody mary', 'bloody-mary'],
    ['horses neck', 'horses-neck'],
    ['long island', 'long-island-iced-tea'],
    ['tommys margarita', 'tommys-margarita'],
    ['cachaca', 'caipirinha'],
  ])('"%s" finds %s', (query, id) => {
    expect(find(query)).toContain(id)
  })
})

it('a substitute is never much stronger or weaker than what it replaces, so strength figures stay honest', () => {
  const mismatched = content.ingredients.flatMap((i) =>
    i.substitutes.filter((s) => Math.abs(ingredientById.get(s)!.abv - i.abv) > 10).map((s) => `${i.id} -> ${s}`),
  )
  expect(mismatched).toEqual([])
})

it('every drink with raw egg white carries a caution in its ingredient note', () => {
  const missing = content.drinks.filter((d) =>
    d.ingredients.some((i) => i.ingredientId === 'egg-white' && !/raw/i.test(i.note ?? '')),
  )
  expect(missing.map((d) => d.id)).toEqual([])
})

it('has a Singapore collection with the Singapore Sling', () => {
  const local = content.drinks.filter((d) => d.collection === 'singapore')
  expect(local.length).toBeGreaterThanOrEqual(5)
  expect(local.map((d) => d.id)).toContain('singapore-sling')
})

it('includes the common IBA classics a beginner is likely to have heard of', () => {
  const ids = content.drinks.map((d) => d.id)
  for (const classic of ['caipirinha', 'mint-julep', 'bloody-mary', 'black-russian', 'tequila-sunrise', 'pisco-sour', 'long-island-iced-tea'])
    expect(ids).toContain(classic)
})

it('no longer lists Bandung', () => {
  expect(content.drinks.map((d) => d.id)).not.toContain('bandung')
})

it('flags dairy on every drink made with milk, condensed milk or evaporated milk', () => {
  const milky = new Set(['milk', 'condensed-milk', 'evaporated-milk', 'milo'])
  const unflagged = content.drinks.filter(
    (d) =>
      d.ingredients.some((i) => milky.has(i.ingredientId)) &&
      !d.ingredients.some((i) => ingredientById.get(i.ingredientId)!.allergens.includes('dairy')),
  )
  expect(unflagged.map((d) => d.id)).toEqual([])
})

it('gives every drink and ingredient a colour for its glass and pour bar', () => {
  const plain = [...content.drinks, ...content.ingredients].filter((x) => !/^#[0-9a-f]{6}$/.test(x.colour))
  expect(plain.map((x) => x.id)).toEqual([])
})

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

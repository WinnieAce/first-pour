import type { Drink } from '../content/schema'
import { fixtureDrink as drink, fixtureIngredientById as byId } from '../test/fixtures'
import { calculateStrength, containsAlcohol } from './strength'

it('daiquiri (shaken)', () => {
  expect(calculateStrength(drink('daiquiri'), byId)).toEqual({ abvPercent: 19, alcoholGrams: 18.9, standardDrinks: 1.9 })
})

it('old fashioned (stirred, dashes ignored)', () => {
  // 24 ml alcohol / (65 ml × 1.2) = 30.77%
  expect(calculateStrength(drink('old-fashioned'), byId)).toEqual({ abvPercent: 31, alcoholGrams: 18.9, standardDrinks: 1.9 })
})

it('no-alcohol drink is zero', () => {
  expect(calculateStrength(drink('lime-soda'), byId)).toEqual({ abvPercent: 0, alcoholGrams: 0, standardDrinks: 0 })
})

it('a drink with no ml ingredients is zero, not NaN', () => {
  const pieces: Drink = { ...drink('daiquiri'), ingredients: [{ ingredientId: 'egg-white', amount: 2, unit: 'piece', optional: false }] }
  expect(calculateStrength(pieces, byId)).toEqual({ abvPercent: 0, alcoholGrams: 0, standardDrinks: 0 })
})

it('excludes optional ingredients from strength', () => {
  const base = drink('daiquiri')
  const withFloat: Drink = { ...base, ingredients: [...base.ingredients, { ingredientId: 'gin', amount: 30, unit: 'ml', optional: true }] }
  expect(calculateStrength(withFloat, byId)).toEqual(calculateStrength(base, byId))
})

it('built drinks dilute by 10%', () => {
  const built: Drink = { ...drink('daiquiri'), method: 'built', ingredients: [{ ingredientId: 'gin', amount: 50, unit: 'ml', optional: false }, { ingredientId: 'soda-water', amount: 150, unit: 'ml', optional: false }] }
  // 20 ml alcohol / (200 ml × 1.1) = 9.09%
  expect(calculateStrength(built, byId).abvPercent).toBe(9)
})

describe('containsAlcohol', () => {
  it('is false when no ingredient has alcohol', () => {
    expect(containsAlcohol(drink('lime-soda'), byId)).toBe(false)
  })

  it('is true for a few dashes of bitters, which the strength figure ignores', () => {
    const bittersSoda: Drink = {
      ...drink('lime-soda'),
      ingredients: [
        { ingredientId: 'soda-water', amount: 150, unit: 'ml', optional: false },
        { ingredientId: 'angostura-bitters', amount: 4, unit: 'dash', optional: false },
      ],
    }
    expect(calculateStrength(bittersSoda, byId).abvPercent).toBe(0)
    expect(containsAlcohol(bittersSoda, byId)).toBe(true)
  })

  it('is true when only an optional ingredient has alcohol', () => {
    const base = drink('lime-soda')
    const withFloat: Drink = { ...base, ingredients: [...base.ingredients, { ingredientId: 'gin', amount: 10, unit: 'ml', optional: true }] }
    expect(containsAlcohol(withFloat, byId)).toBe(true)
  })
})

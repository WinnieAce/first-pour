import type { Drink, Ingredient } from '../content/schema'
import { fixtureDrink as drink, fixtureIngredientById as byId } from '../test/fixtures'
import { drinkAllergens } from './allergens'

it('includes allergens from optional ingredients', () => {
  expect(drinkAllergens(drink('whiskey-sour'), byId)).toEqual(['egg'])
})

it('returns allergens once each, in fixed order', () => {
  const orgeat: Ingredient = { ...byId.get('simple-syrup')!, id: 'orgeat', allergens: ['nuts'] }
  const custard: Ingredient = { ...byId.get('simple-syrup')!, id: 'custard', allergens: ['dairy', 'egg'] }
  const map = new Map([...byId, ['orgeat', orgeat], ['custard', custard]])
  const base = drink('whiskey-sour')
  const mixed: Drink = {
    ...base,
    ingredients: [
      { ingredientId: 'orgeat', amount: 15, unit: 'ml', optional: false },
      { ingredientId: 'custard', amount: 15, unit: 'ml', optional: false },
      ...base.ingredients,
    ],
  }
  expect(drinkAllergens(mixed, map)).toEqual(['egg', 'dairy', 'nuts'])
})

it('returns an empty list when there are none', () => {
  expect(drinkAllergens(drink('daiquiri'), byId)).toEqual([])
})

import { ALLERGENS, type Allergen, type Drink, type Ingredient } from '../content/schema'

export const ALLERGEN_ORDER: readonly Allergen[] = ALLERGENS

export function drinkAllergens(drink: Drink, byId: ReadonlyMap<string, Ingredient>): Allergen[] {
  const found = new Set(drink.ingredients.flatMap((i) => byId.get(i.ingredientId)?.allergens ?? []))
  return ALLERGEN_ORDER.filter((a) => found.has(a))
}

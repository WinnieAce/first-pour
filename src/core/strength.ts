import type { Drink, Ingredient, Method } from '../content/schema'

export type Strength = { abvPercent: number; alcoholGrams: number; standardDrinks: number }

const DILUTION: Record<Method, number> = { shaken: 0.25, blended: 0.25, stirred: 0.2, built: 0.1 }
const ALCOHOL_GRAMS_PER_ML = 0.789
const GRAMS_PER_STANDARD_DRINK = 10

const oneDecimal = (n: number) => Math.round(n * 10) / 10

export function calculateStrength(drink: Drink, byId: ReadonlyMap<string, Ingredient>): Strength {
  let volume = 0
  let alcohol = 0
  for (const item of drink.ingredients) {
    if (item.unit !== 'ml' || item.optional) continue
    volume += item.amount
    alcohol += (item.amount * (byId.get(item.ingredientId)?.abv ?? 0)) / 100
  }

  const finalVolume = volume * (1 + DILUTION[drink.method])
  const grams = alcohol * ALCOHOL_GRAMS_PER_ML
  return {
    abvPercent: finalVolume === 0 ? 0 : Math.round((alcohol / finalVolume) * 100),
    alcoholGrams: oneDecimal(grams),
    standardDrinks: oneDecimal(grams / GRAMS_PER_STANDARD_DRINK),
  }
}

/** True if any ingredient has alcohol, including dashes and optional extras that the strength figure leaves out. */
export function containsAlcohol(drink: Drink, byId: ReadonlyMap<string, Ingredient>): boolean {
  return drink.ingredients.some((i) => (byId.get(i.ingredientId)?.abv ?? 0) > 0)
}

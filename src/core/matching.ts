import type { Content, Drink, Ingredient } from '../content/schema'

export type BarResults = {
  makeable: Drink[]
  oneShort: { drink: Drink; missingId: string }[]
  nextPurchases: { ingredientId: string; unlocks: number }[]
}

/** Owned, or one of its listed substitutes is owned. Substitutes of substitutes do not count. */
export function isAvailable(ingredient: Ingredient, owned: ReadonlySet<string>): boolean {
  return owned.has(ingredient.id) || ingredient.substitutes.some((s) => owned.has(s))
}

export function missingIngredientIds(
  drink: Drink,
  owned: ReadonlySet<string>,
  byId: ReadonlyMap<string, Ingredient>,
): string[] {
  return drink.ingredients
    .filter((i) => !i.optional)
    .filter((i) => {
      const ingredient = byId.get(i.ingredientId)
      return !ingredient || !isAvailable(ingredient, owned)
    })
    .map((i) => i.ingredientId)
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)

export function matchBar(content: Content, owned: ReadonlySet<string>): BarResults {
  const byId = new Map(content.ingredients.map((i) => [i.id, i]))
  const drinks = [...content.drinks].sort(byName)
  const makeableWith = (bar: ReadonlySet<string>) =>
    drinks.filter((d) => missingIngredientIds(d, bar, byId).length === 0)

  const makeable = makeableWith(owned)
  const oneShort = drinks.flatMap((drink) => {
    const missing = missingIngredientIds(drink, owned, byId)
    return missing.length === 1 ? [{ drink, missingId: missing[0] }] : []
  })

  const usage = (id: string) => content.drinks.filter((d) => d.ingredients.some((i) => i.ingredientId === id)).length
  const nextPurchases = content.ingredients
    .filter((i) => !owned.has(i.id))
    .map((i) => ({ ingredient: i, unlocks: makeableWith(new Set([...owned, i.id])).length - makeable.length }))
    .filter((p) => p.unlocks > 0)
    .sort((a, b) => b.unlocks - a.unlocks || usage(b.ingredient.id) - usage(a.ingredient.id) || byName(a.ingredient, b.ingredient))
    .map((p) => ({ ingredientId: p.ingredient.id, unlocks: p.unlocks }))

  return { makeable, oneShort, nextPurchases }
}

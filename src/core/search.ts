import type { Content, Difficulty, Drink, FamilyId, Flavour } from '../content/schema'

export type DrinkFilters = {
  query: string
  baseIngredientId?: string
  family?: FamilyId
  flavour?: Flavour
  difficulty?: Difficulty
  makeableOnly: boolean
}

export const EMPTY_FILTERS: DrinkFilters = { query: '', makeableOnly: false }

/** Lowercase, without accents, outer spaces or repeated inner spaces. */
export function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function filterDrinks(content: Content, filters: DrinkFilters, makeableIds: ReadonlySet<string>): Drink[] {
  const query = normalise(filters.query)
  const names = new Map(content.ingredients.map((i) => [i.id, normalise(i.name)]))
  const matchesQuery = (drink: Drink) =>
    query === '' ||
    normalise(drink.name).includes(query) ||
    drink.ingredients.some((i) => names.get(i.ingredientId)?.includes(query))

  return content.drinks
    .filter(
      (d) =>
        matchesQuery(d) &&
        (!filters.baseIngredientId || d.baseIngredientId === filters.baseIngredientId) &&
        (!filters.family || d.family === filters.family) &&
        (!filters.flavour || d.flavour.includes(filters.flavour)) &&
        (!filters.difficulty || d.difficulty === filters.difficulty) &&
        (!filters.makeableOnly || makeableIds.has(d.id)),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
}

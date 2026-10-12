import type { Collection, Content, Difficulty, Drink, FamilyId, Flavour } from '../content/schema'
import { containsAlcohol } from './strength'

export type DrinkFilters = {
  query: string
  baseIngredientId?: string
  family?: FamilyId
  flavour?: Flavour
  difficulty?: Difficulty
  collection?: Collection
  alcoholFree?: boolean
  makeableOnly: boolean
}

export const EMPTY_FILTERS: DrinkFilters = { query: '', makeableOnly: false }

/** Lowercase, without accents or punctuation, with single spaces. "Bee’s Knees" and "bees knees" match. */
export function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/['’‘`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function filterDrinks(content: Content, filters: DrinkFilters, makeableIds: ReadonlySet<string>): Drink[] {
  const query = normalise(filters.query)
  // Descriptions are searched too, so brand and style names ("prosecco", "whiskey") find drinks.
  const names = new Map(content.ingredients.map((i) => [i.id, normalise(`${i.name} ${i.description}`)]))
  const byId = new Map(content.ingredients.map((i) => [i.id, i]))
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
        (!filters.collection || d.collection === filters.collection) &&
        (!filters.alcoholFree || !containsAlcohol(d, byId)) &&
        (!filters.makeableOnly || makeableIds.has(d.id)),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
}

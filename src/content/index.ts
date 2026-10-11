import rawDrinks from './drinks.json'
import rawIngredients from './ingredients.json'
import type { Content, Drink, Ingredient } from './schema'
import { validateContent } from './validate'

const result = validateContent({ ingredients: rawIngredients, drinks: rawDrinks })
if (!result.ok) throw new Error(`Invalid content:\n${result.errors.join('\n')}`)

export const content: Content = result.content
export const ingredientById: ReadonlyMap<string, Ingredient> = new Map(content.ingredients.map((i) => [i.id, i]))
export const drinkById: ReadonlyMap<string, Drink> = new Map(content.drinks.map((d) => [d.id, d]))
export const stapleIds: string[] = content.ingredients.filter((i) => i.category === 'staple').map((i) => i.id)

import { createContext, useContext } from 'react'
import { content as shippedContent } from './index'
import type { Content, Drink, Ingredient } from './schema'

export type ContentValue = {
  content: Content
  ingredientById: ReadonlyMap<string, Ingredient>
  drinkById: ReadonlyMap<string, Drink>
  stapleIds: string[]
}

export function makeContentValue(content: Content): ContentValue {
  return {
    content,
    ingredientById: new Map(content.ingredients.map((i) => [i.id, i])),
    drinkById: new Map(content.drinks.map((d) => [d.id, d])),
    stapleIds: content.ingredients.filter((i) => i.category === 'staple').map((i) => i.id),
  }
}

/** The drinks and ingredients in use. Defaults to the shipped content; tests supply a small set. */
export const ContentContext = createContext<ContentValue>(makeContentValue(shippedContent))

export const useContent = () => useContext(ContentContext)

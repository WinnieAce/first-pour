import type { Drink, GlassId } from '../content/schema'

/** What is drawn in and around a glass besides the drink itself. Worked out from the recipe. */
export type GlassExtras = {
  ice: boolean
  straw: boolean
  bubbles: boolean
  citrus: 'orange' | 'lime' | 'lemon' | null
  steam: boolean
}

const ICED_GLASSES: readonly GlassId[] = ['rocks', 'highball', 'mug', 'wine']
const TALL_GLASSES: readonly GlassId[] = ['highball', 'mug']
const FIZZY = new Set([
  'soda-water',
  'tonic-water',
  'ginger-beer',
  'ginger-ale',
  'cola',
  'lemon-lime-soda',
  'grapefruit-soda',
  'sparkling-wine',
])

/** True for a step that puts ice in the serving glass, not in a shaker, mixing glass or blender. */
const servesOnIce = (text: string) => /\bice\b/i.test(text) && !/shaker|mixing glass|blender|no ice/i.test(text)

export function glassExtras(drink: Drink): GlassExtras {
  const has = (id: string) => drink.ingredients.some((i) => i.ingredientId === id)
  const steam = drink.steps.some((s) => /\bhot\b/i.test(s.text)) && has('coffee')
  const ice = !steam && ICED_GLASSES.includes(drink.glass) && drink.steps.some((s) => servesOnIce(s.text))
  const tall = TALL_GLASSES.includes(drink.glass)

  let citrus: GlassExtras['citrus'] = null
  if (has('orange')) citrus = 'orange'
  else if (has('lemon')) citrus = 'lemon'
  else if (has('lime')) citrus = 'lime'
  else if (tall && ice && (has('lime-juice') || has('calamansi-juice'))) citrus = 'lime'
  else if (tall && ice && has('lemon-juice')) citrus = 'lemon'

  return {
    ice,
    straw: ice && drink.glass === 'highball',
    bubbles: drink.ingredients.some((i) => FIZZY.has(i.ingredientId)),
    citrus,
    steam,
  }
}

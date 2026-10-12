import type { GlassId, IngredientCategory } from '../content/schema'

export const GLASS_NAMES: Record<GlassId, string> = {
  rocks: 'Short tumbler',
  highball: 'Tall glass',
  coupe: 'Coupe',
  martini: 'Martini glass',
  wine: 'Wine glass',
  flute: 'Flute',
  mug: 'Mug',
}

export const CATEGORY_NAMES: Record<IngredientCategory, string> = {
  spirit: 'Spirits',
  liqueur: 'Liqueurs',
  'wine-or-fortified': 'Wine and fortified wine',
  bitters: 'Bitters',
  mixer: 'Mixers',
  fresh: 'Fresh ingredients',
  staple: 'Kitchen staples',
}

/** "stirred-and-strong" → "Stirred and strong" */
export function titleCase(id: string): string {
  const words = id.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** A greeting for the top of the drinks screen, by the hour on the person's own clock. */
export function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning.'
  if (hour >= 12 && hour < 18) return 'Good afternoon.'
  return 'Good evening.'
}

import { FAMILY_IDS, type Content, type Drink } from '../content/schema'

const DAY_MS = 24 * 60 * 60 * 1000

/** Which calendar day `date` falls on, counted in the person's own time zone, so a day starts at their midnight. */
export function dayNumber(date: Date): number {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60 * 1000) / DAY_MS)
}

/**
 * The "good first drinks" for a given day: one easy drink from each family. Each day moves every
 * family on to its next easy drink, so the shelf changes daily but stays the same all day and is the
 * same on every phone. Families start at different points so they don't all change in step.
 */
export function dailyStarters(content: Content, date: Date): Drink[] {
  const day = dayNumber(date)
  return FAMILY_IDS.flatMap((family, n) => {
    const easy = content.drinks
      .filter((d) => d.family === family && d.difficulty === 'easy')
      .sort((a, b) => a.id.localeCompare(b.id))
    return easy.length > 0 ? [easy[(day + n * 3) % easy.length]] : []
  })
}

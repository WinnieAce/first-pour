import { content } from '../content'
import { FAMILY_IDS } from '../content/schema'
import { dailyStarters, dayNumber } from './dailyShelf'

const on = (iso: string) => dailyStarters(content, new Date(iso))

it('offers one easy drink from each family', () => {
  const picks = on('2026-10-21T12:00:00')
  expect(picks.map((d) => d.family)).toEqual(FAMILY_IDS.filter((f) => content.drinks.some((d) => d.family === f && d.difficulty === 'easy')))
  expect(picks.every((d) => d.difficulty === 'easy')).toBe(true)
})

it('keeps the same drinks all day, whatever the time', () => {
  const morning = on('2026-10-21T00:05:00').map((d) => d.id)
  const night = on('2026-10-21T23:55:00').map((d) => d.id)
  expect(night).toEqual(morning)
})

it('changes the drinks from one day to the next', () => {
  expect(on('2026-10-22T12:00:00').map((d) => d.id)).not.toEqual(on('2026-10-21T12:00:00').map((d) => d.id))
})

it('works through the easy drinks of a family over the days, rather than repeating one', () => {
  const sours = new Set<string>()
  for (let day = 1; day <= 7; day++) sours.add(on(`2026-11-0${day}T12:00:00`).find((d) => d.family === 'sour')!.id)
  expect(sours.size).toBeGreaterThan(3)
})

it('starts a new day at local midnight', () => {
  expect(dayNumber(new Date('2026-10-21T23:59:00'))).toBe(dayNumber(new Date('2026-10-21T00:00:00')))
  expect(dayNumber(new Date('2026-10-22T00:00:00'))).toBe(dayNumber(new Date('2026-10-21T00:00:00')) + 1)
})

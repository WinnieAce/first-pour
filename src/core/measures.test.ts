import type { Unit } from '../content/schema'
import { clampServings, formatMeasure, scaleAmount, type DisplayUnits } from './measures'

it.each<[number, Unit, DisplayUnits, string]>([
  [45, 'ml', 'ml', '45 ml'],
  [22.5, 'ml', 'ml', '22.5 ml'],
  [7.5, 'ml', 'ml', '7.5 ml'],
  [33, 'ml', 'ml', '35 ml'],
  [1, 'ml', 'ml', '2.5 ml'],
  [480, 'ml', 'ml', '480 ml'],
  [30, 'ml', 'oz', '1 oz'],
  [45, 'ml', 'oz', '1½ oz'],
  [22.5, 'ml', 'oz', '¾ oz'],
  [5, 'ml', 'oz', '¼ oz'],
  [60, 'ml', 'oz', '2 oz'],
  [97.5, 'ml', 'oz', '3¼ oz'],
  [1, 'dash', 'oz', '1 dash'],
  [2, 'dash', 'ml', '2 dashes'],
  [1, 'barspoon', 'ml', '1 barspoon'],
  [3, 'barspoon', 'oz', '3 barspoons'],
  [1, 'piece', 'ml', '1'],
  [4, 'piece', 'oz', '4'],
])('formats %s %s in %s as %s', (amount, unit, display, out) => {
  expect(formatMeasure(amount, unit, display)).toBe(out)
})

it('scales', () => {
  expect(scaleAmount(22.5, 4)).toBe(90)
})

it.each([
  [0, 1],
  [9, 8],
  [2.6, 3],
  [NaN, 1],
  [-3, 1],
])('clamps servings %s to %s', (n, out) => {
  expect(clampServings(n)).toBe(out)
})

import { greeting } from './labels'

it.each([
  [0, 'Good evening.'],
  [5, 'Good morning.'],
  [11, 'Good morning.'],
  [12, 'Good afternoon.'],
  [17, 'Good afternoon.'],
  [18, 'Good evening.'],
  [23, 'Good evening.'],
])('at hour %i says "%s"', (hour, expected) => {
  expect(greeting(hour)).toBe(expected)
})

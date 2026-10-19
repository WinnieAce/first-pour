import { LOOP_SECONDS, restLoops } from './loopRest'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('lets looping animations play for a few seconds, then rests them', () => {
  const el = document.createElement('div')
  restLoops(el)
  expect(el).not.toHaveClass('resting')
  vi.advanceTimersByTime(LOOP_SECONDS * 1000 - 100)
  expect(el).not.toHaveClass('resting')
  vi.advanceTimersByTime(200)
  expect(el).toHaveClass('resting')
})

it('stays within the five seconds after which moving content needs a way to stop it', () => {
  expect(LOOP_SECONDS).toBeLessThanOrEqual(5)
})

it('wakes them again for another few seconds when touched', () => {
  const el = document.createElement('div')
  restLoops(el)
  vi.advanceTimersByTime(LOOP_SECONDS * 1000 + 100)
  el.dispatchEvent(new Event('pointerdown'))
  expect(el).not.toHaveClass('resting')
  vi.advanceTimersByTime(LOOP_SECONDS * 1000 + 100)
  expect(el).toHaveClass('resting')
})

it('stops cleanly when the element goes away', () => {
  const el = document.createElement('div')
  const stop = restLoops(el)
  stop()
  vi.advanceTimersByTime(LOOP_SECONDS * 1000 + 100)
  expect(el).not.toHaveClass('resting')
})

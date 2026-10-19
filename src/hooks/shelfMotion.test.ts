import { MAX_TILT, shelfMotion, springStep, tiltFor, type Swing } from './shelfMotion'

const shelf = () => document.createElement('ul')
const scrollTo = (el: HTMLElement, x: number) => {
  el.scrollLeft = x
  el.dispatchEvent(new Event('scroll'))
}
const tilt = (el: HTMLElement) => el.style.getPropertyValue('--tilt')

/** Runs the spring for `seconds` at `hz` frames a second towards `target`, recording every frame. */
const simulate = (start: Swing, target: number, seconds: number, hz = 60) => {
  const frames: Swing[] = []
  let state = start
  for (let i = 0; i < Math.round(seconds * hz); i++) frames.push((state = springStep(state, target, 1 / hz)))
  return frames
}

afterEach(() => vi.unstubAllGlobals())

it('leans one way swiping left and the other way swiping right, by swipe speed', () => {
  expect(tiltFor(800)).toBeGreaterThan(0)
  expect(tiltFor(-800)).toBeLessThan(0)
  expect(tiltFor(0)).toBe(0)
  expect(tiltFor(1600)).toBeGreaterThan(tiltFor(400))
})

it('never leans past the limit, which stays short of the 24 degrees that felt too harsh', () => {
  expect(tiltFor(100_000)).toBe(MAX_TILT)
  expect(tiltFor(-100_000)).toBe(-MAX_TILT)
  expect(MAX_TILT).toBeLessThan(24)
})

it('settles upright with only a slight swing past it', () => {
  const frames = simulate({ tilt: MAX_TILT, velocity: 0 }, 0, 2)
  const lowest = Math.min(...frames.map((f) => f.tilt))
  expect(lowest).toBeLessThan(0)
  expect(lowest).toBeGreaterThan(-MAX_TILT * 0.1)
  expect(Math.abs(frames.at(-1)!.tilt)).toBeLessThan(0.05)
})

it('moves at the same speed on a 120 Hz screen as on a 60 Hz one', () => {
  const at60 = simulate({ tilt: MAX_TILT, velocity: 0 }, 0, 0.15, 60).at(-1)!.tilt
  const at120 = simulate({ tilt: MAX_TILT, velocity: 0 }, 0, 0.15, 120).at(-1)!.tilt
  expect(Math.abs(at60 - at120)).toBeLessThan(0.6)
})

it('chases a moving target rather than jumping to it', () => {
  const frames = simulate({ tilt: 0, velocity: 0 }, 10, 0.6)
  expect(frames[0].tilt).toBeLessThan(5)
  expect(frames.at(-1)!.tilt).toBeCloseTo(10, 0)
})

it('carries its speed into the settle instead of starting from a standstill', () => {
  const next = springStep({ tilt: 5, velocity: 100 }, 0, 1 / 60)
  expect(next.tilt).toBeGreaterThan(5)
})

it('tips the glasses on the shelf as soon as it is swiped sideways', () => {
  const el = shelf()
  shelfMotion(el)
  scrollTo(el, 40)
  expect(parseFloat(tilt(el))).toBeGreaterThan(0)
})

it('ignores the page scrolling up and down', () => {
  const el = shelf()
  shelfMotion(el)
  window.dispatchEvent(new Event('scroll'))
  expect(tilt(el)).toBe('')
})

it('stops when the shelf goes away', () => {
  const el = shelf()
  const stop = shelfMotion(el)
  stop()
  scrollTo(el, 40)
  expect(tilt(el)).toBe('')
})

it('leaves the glasses still for anyone who has asked for less motion', () => {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))
  const el = shelf()
  shelfMotion(el)
  scrollTo(el, 40)
  expect(tilt(el)).toBe('')
})

it('wakes the resting glasses when the shelf is swiped', () => {
  vi.useFakeTimers()
  const el = shelf()
  shelfMotion(el)
  vi.advanceTimersByTime(6000)
  expect(el).toHaveClass('resting')
  scrollTo(el, 40)
  expect(el).not.toHaveClass('resting')
  vi.useRealTimers()
})

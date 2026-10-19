import { MAX_TILT, shelfMotion, springStep, tiltFor } from './shelfMotion'

const shelf = () => document.createElement('ul')
const scrollTo = (el: HTMLElement, x: number) => {
  el.scrollLeft = x
  el.dispatchEvent(new Event('scroll'))
}
const tilt = (el: HTMLElement) => el.style.getPropertyValue('--tilt')

afterEach(() => vi.unstubAllGlobals())

it('leans one way swiping left and the other way swiping right', () => {
  expect(tiltFor(10)).toBeGreaterThan(0)
  expect(tiltFor(-10)).toBeLessThan(0)
  expect(tiltFor(0)).toBe(0)
})

it('leans further the faster the swipe, but only ever gently', () => {
  expect(tiltFor(20)).toBeGreaterThan(tiltFor(5))
  expect(tiltFor(5000)).toBe(MAX_TILT)
  expect(tiltFor(-5000)).toBe(-MAX_TILT)
  expect(MAX_TILT).toBeLessThan(24) // 24 was tried and felt too harsh
})

it('tips the glasses on the shelf when it is swiped sideways', () => {
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
  expect(document.documentElement.style.getPropertyValue('--tilt')).toBe('')
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

it('swings a little past upright as it settles, like liquid finding its level, then comes to rest', () => {
  let state = { tilt: MAX_TILT, velocity: 0 }
  let lowest = state.tilt
  for (let frame = 0; frame < 90; frame++) {
    state = springStep(state)
    lowest = Math.min(lowest, state.tilt)
  }
  expect(lowest).toBeLessThan(0) // it does swing past upright
  expect(lowest).toBeGreaterThan(-MAX_TILT * 0.15) // but only slightly
  expect(Math.abs(state.tilt)).toBeLessThan(0.05)
})

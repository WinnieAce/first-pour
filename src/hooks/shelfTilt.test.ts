import { MAX_TILT, shelfTilt, tiltFor } from './shelfTilt'

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
  shelfTilt(el)
  scrollTo(el, 40)
  expect(parseFloat(tilt(el))).toBeGreaterThan(0)
})

it('ignores the page scrolling up and down', () => {
  const el = shelf()
  shelfTilt(el)
  window.dispatchEvent(new Event('scroll'))
  expect(tilt(el)).toBe('')
  expect(document.documentElement.style.getPropertyValue('--tilt')).toBe('')
})

it('stops when the shelf goes away', () => {
  const el = shelf()
  const stop = shelfTilt(el)
  stop()
  scrollTo(el, 40)
  expect(tilt(el)).toBe('')
})

it('leaves the glasses still for anyone who has asked for less motion', () => {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))
  const el = shelf()
  shelfTilt(el)
  scrollTo(el, 40)
  expect(tilt(el)).toBe('')
})

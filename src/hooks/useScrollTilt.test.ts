import { renderHook } from '@testing-library/react'
import { MAX_TILT, tiltFor, useScrollTilt } from './useScrollTilt'

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  window.dispatchEvent(new Event('scroll'))
}
const tilt = () => document.documentElement.style.getPropertyValue('--tilt')

afterEach(() => {
  scrollTo(0)
  document.documentElement.style.removeProperty('--tilt')
  vi.unstubAllGlobals()
})

it('leans one way scrolling down and the other way scrolling up', () => {
  expect(tiltFor(10)).toBeGreaterThan(0)
  expect(tiltFor(-10)).toBeLessThan(0)
  expect(tiltFor(0)).toBe(0)
})

it('leans further the faster the scroll, but never past the limit', () => {
  expect(tiltFor(20)).toBeGreaterThan(tiltFor(5))
  expect(tiltFor(5000)).toBe(MAX_TILT)
  expect(tiltFor(-5000)).toBe(-MAX_TILT)
})

it('tips the glasses when the page scrolls', () => {
  renderHook(() => useScrollTilt())
  scrollTo(40)
  expect(parseFloat(tilt())).toBeGreaterThan(0)
})

it('stops listening when the screen goes away', () => {
  const { unmount } = renderHook(() => useScrollTilt())
  unmount()
  scrollTo(40)
  expect(tilt()).toBe('')
})

it('leaves the glasses still for anyone who has asked for less motion', () => {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))
  renderHook(() => useScrollTilt())
  scrollTo(40)
  expect(tilt()).toBe('')
})

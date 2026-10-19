import { projectSwipe, swipeDirection } from './swipe'

const WIDTH = 360

it('throws a fast flick further than where the finger let go', () => {
  expect(projectSwipe(0, -1000)).toBeLessThan(-50)
  expect(projectSwipe(0, 0)).toBe(0)
})

it('moves to the next step after a long enough drag to the left', () => {
  expect(swipeDirection(-150, 0, WIDTH)).toBe('next')
})

it('moves back after a long enough drag to the right', () => {
  expect(swipeDirection(150, 0, WIDTH)).toBe('back')
})

it('counts a short, quick flick as a swipe', () => {
  expect(swipeDirection(-30, -1200, WIDTH)).toBe('next')
})

it('stays put after a small, slow drag', () => {
  expect(swipeDirection(-30, -50, WIDTH)).toBeNull()
})

it('stays put when the finger drags one way and then flicks back the other', () => {
  expect(swipeDirection(-100, 1500, WIDTH)).toBeNull()
})

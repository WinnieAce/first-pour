/**
 * Where a swipe would come to rest if it kept going and slowed down naturally, the way a scrolled
 * list does. This is the projection Apple uses, with a fairly quick slow-down.
 */
export function projectSwipe(offset: number, velocity: number, decelerationRate = 0.99): number {
  return offset + ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/**
 * Whether a horizontal swipe should move to the next step, back a step, or stay. Decided from where
 * the swipe was heading, not only where the finger let go, so a quick flick is enough and a drag
 * that is flicked back the other way cancels.
 */
export function swipeDirection(offset: number, velocity: number, width: number): 'next' | 'back' | null {
  const landing = projectSwipe(offset, velocity)
  const threshold = width * 0.25
  if (landing < -threshold) return 'next'
  if (landing > threshold) return 'back'
  return null
}

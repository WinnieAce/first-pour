/** The furthest a glass leans, in degrees. A clear lean without looking like a spill. */
export const MAX_TILT = 14

/** How far the glasses lean for a sideways scroll of `delta` pixels: further for a faster swipe, up to a limit. */
export function tiltFor(delta: number): number {
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, delta * 0.5))
}

export type Swing = { tilt: number; velocity: number }

// A gently damped spring, one step per frame. Tuned like liquid: unhurried, swinging about 8% past
// upright before coming to rest in roughly half a second.
const STIFFNESS = 0.06
const DAMPING = 0.3

export function springStep({ tilt, velocity }: Swing): Swing {
  const nextVelocity = velocity - STIFFNESS * tilt - DAMPING * velocity
  return { tilt: tilt + nextVelocity, velocity: nextVelocity }
}

/**
 * Brings the shelf to life. Swiping it sideways tips its glasses in the direction of the swipe,
 * published on the row as `--tilt`; when the swipe stops they swing back past upright and settle.
 * Tiles scrolled out of view are marked `asleep`, so their animations pause. Use it as the row's
 * `ref`; the function it returns stops it. Nothing tips for anyone who has asked for less motion.
 */
export function shelfMotion(row: HTMLElement | null): () => void {
  if (!row) return () => {}

  // Pausing tiles that cannot be seen saves the battery, and keeps fewer things moving at once.
  let observer: IntersectionObserver | undefined
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('asleep', !e.isIntersecting)),
      { root: row, threshold: 0.2 },
    )
    for (const tile of row.children) observer.observe(tile)
  }
  const stopWatching = () => observer?.disconnect()

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return stopWatching

  let last = row.scrollLeft
  let swing: Swing = { tilt: 0, velocity: 0 }
  let frame = 0
  const publish = () => row.style.setProperty('--tilt', `${swing.tilt.toFixed(2)}deg`)

  const settle = () => {
    swing = springStep(swing)
    if (Math.abs(swing.tilt) < 0.05 && Math.abs(swing.velocity) < 0.05) swing = { tilt: 0, velocity: 0 }
    publish()
    frame = swing.tilt === 0 ? 0 : requestAnimationFrame(settle)
  }

  const onScroll = () => {
    const delta = row.scrollLeft - last
    last = row.scrollLeft
    // While the finger moves, the glasses follow it; the spring takes over from wherever they are.
    swing = { tilt: tiltFor(delta), velocity: 0 }
    publish()
    if (!frame && swing.tilt !== 0) frame = requestAnimationFrame(settle)
  }

  row.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    row.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(frame)
    row.style.removeProperty('--tilt')
    stopWatching()
  }
}

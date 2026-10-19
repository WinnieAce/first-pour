import { restLoops } from './loopRest'

/** The furthest a glass leans, in degrees. A clear lean without looking like a spill. */
export const MAX_TILT = 14

/** How far the glasses lean for a sideways swipe moving at `velocity` pixels a second. */
export function tiltFor(velocity: number): number {
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, velocity * 0.007))
}

export type Swing = { tilt: number; velocity: number }

// The spring, described the way Apple does: `RESPONSE` is roughly how long it takes to get there,
// in seconds, and `DAMPING` below 1 lets it swing slightly past. The swing is earned: it only ever
// follows a swipe, which carries momentum. Converted here to stiffness and friction per second.
const RESPONSE = 0.45
const DAMPING = 0.75
const STIFFNESS = (2 * Math.PI / RESPONSE) ** 2
const FRICTION = 2 * DAMPING * (2 * Math.PI / RESPONSE)

/**
 * Advances the spring by `dt` seconds towards `target`. Timed in seconds rather than frames, so it
 * moves at the same speed on a 60 Hz phone and a 120 Hz one.
 */
export function springStep({ tilt, velocity }: Swing, target: number, dt: number): Swing {
  const nextVelocity = velocity + (-STIFFNESS * (tilt - target) - FRICTION * velocity) * dt
  return { tilt: tilt + nextVelocity * dt, velocity: nextVelocity }
}

/** After this long without a scroll event, the swipe is over and the glasses head back upright. */
const SWIPE_ENDED_MS = 90

/**
 * Brings the shelf to life. While it is swiped sideways its glasses lean with the speed of the
 * swipe, published on the row as `--tilt`; the lean chases the swipe on a spring and carries its
 * speed into the settle, so there is no seam between swiping and settling. Tiles scrolled out of
 * view are marked `asleep`, and the looping animations rest a few seconds after the last swipe.
 * Use it as the row's `ref`; the function it returns stops it.
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
  const stopResting = restLoops(row, ['scroll', 'pointerdown'])
  const stopWatching = () => {
    observer?.disconnect()
    stopResting()
  }

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return stopWatching

  let lastX = row.scrollLeft
  let lastScroll = performance.now()
  let lastFrame = lastScroll
  let target = 0
  let swing: Swing = { tilt: 0, velocity: 0 }
  let frame = 0

  const publish = () => row.style.setProperty('--tilt', `${swing.tilt.toFixed(2)}deg`)
  const advance = (now: number) => {
    const dt = Math.min((now - lastFrame) / 1000, 1 / 30) // a dropped frame must not fling the glasses
    lastFrame = now
    if (now - lastScroll > SWIPE_ENDED_MS) target = 0
    swing = springStep(swing, target, Math.max(dt, 1 / 240))
    publish()
  }
  const tick = (now: number) => {
    advance(now)
    const atRest = target === 0 && Math.abs(swing.tilt) < 0.05 && Math.abs(swing.velocity) < 0.5
    if (atRest) {
      swing = { tilt: 0, velocity: 0 }
      publish()
      frame = 0
    } else {
      frame = requestAnimationFrame(tick)
    }
  }

  const onScroll = () => {
    const now = performance.now()
    // The first event of a new swipe has no useful time gap before it, so it counts as one frame.
    const gap = now - lastScroll > SWIPE_ENDED_MS ? 16 : Math.max(now - lastScroll, 4)
    target = tiltFor(((row.scrollLeft - lastX) / gap) * 1000)
    lastX = row.scrollLeft
    lastScroll = now
    // Respond on the event itself rather than waiting for the next frame.
    advance(now + 16)
    if (!frame) frame = requestAnimationFrame(tick)
  }

  row.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    row.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(frame)
    row.style.removeProperty('--tilt')
    stopWatching()
  }
}

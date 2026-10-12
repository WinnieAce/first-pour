/** The furthest a glass leans, in degrees. A clear lean without looking like a spill. */
export const MAX_TILT = 14

/** How far the glasses lean for a sideways scroll of `delta` pixels: further for a faster swipe, up to a limit. */
export function tiltFor(delta: number): number {
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, delta * 0.5))
}

/**
 * Tips the glasses inside a sideways-scrolling row in the direction of the swipe, then lets them
 * settle upright. The angle is published on the row as `--tilt` for the stylesheet. Use it as the
 * row's `ref`; the function it returns stops it. Does nothing for anyone who has asked for less motion.
 */
export function shelfTilt(row: HTMLElement | null): () => void {
  if (!row || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {}

  let last = row.scrollLeft
  let tilt = 0
  let frame = 0

  const settle = () => {
    tilt *= 0.86
    if (Math.abs(tilt) < 0.2) tilt = 0
    row.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`)
    frame = tilt === 0 ? 0 : requestAnimationFrame(settle)
  }

  const onScroll = () => {
    const delta = row.scrollLeft - last
    last = row.scrollLeft
    tilt = tiltFor(delta)
    row.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`)
    if (!frame && tilt !== 0) frame = requestAnimationFrame(settle)
  }

  row.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    row.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(frame)
    row.style.removeProperty('--tilt')
  }
}

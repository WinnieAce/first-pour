import { useEffect } from 'react'

/** The furthest a glass leans, in degrees. */
export const MAX_TILT = 24

/** How far the glasses lean for a scroll of `delta` pixels: further for a faster scroll, up to a limit. */
export function tiltFor(delta: number): number {
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, delta * 0.9))
}

/**
 * Tips every glass in the direction of a scroll, then lets it settle upright. The angle is
 * published as `--tilt` for the stylesheet. Does nothing for anyone who has asked for less motion.
 */
export function useScrollTilt(): void {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    let last = window.scrollY
    let tilt = 0
    let frame = 0

    const settle = () => {
      tilt *= 0.86
      if (Math.abs(tilt) < 0.2) tilt = 0
      root.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`)
      frame = tilt === 0 ? 0 : requestAnimationFrame(settle)
    }

    const onScroll = () => {
      const delta = window.scrollY - last
      last = window.scrollY
      tilt = tiltFor(delta)
      root.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`)
      if (!frame && tilt !== 0) frame = requestAnimationFrame(settle)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      root.style.removeProperty('--tilt')
    }
  }, [])
}

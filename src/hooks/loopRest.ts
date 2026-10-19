/**
 * How long looping animations play before resting. Moving content that runs longer than five
 * seconds needs a way to stop it (WCAG 2.2.2), so the glasses settle well within that.
 */
export const LOOP_SECONDS = 5

/**
 * Lets the looping animations inside `el` (rippling drinks, bobbing ice, rising bubbles) play for a
 * few seconds, then marks it `resting` so the stylesheet pauses them. A touch, or any of
 * `wakeOn`, plays them again. Use it as an element's `ref`; the function it returns stops it.
 */
export function restLoops(el: HTMLElement | null, wakeOn: readonly string[] = ['pointerdown']): () => void {
  if (!el) return () => {}
  let timer = 0
  const wake = () => {
    el.classList.remove('resting')
    window.clearTimeout(timer)
    timer = window.setTimeout(() => el.classList.add('resting'), LOOP_SECONDS * 1000)
  }
  wake()
  for (const event of wakeOn) el.addEventListener(event, wake, { passive: true })
  return () => {
    window.clearTimeout(timer)
    for (const event of wakeOn) el.removeEventListener(event, wake)
    el.classList.remove('resting')
  }
}

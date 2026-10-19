// Moving between a list and a drink page with the browser's View Transitions: the tapped glass
// glides and grows into the big glass on the drink page, and glides back to the same spot on the
// way out. The big glass is always named `drink-glass` in the stylesheet; the matching small glass
// is named here, one at a time, because a name may only appear once on a page.

const NAME = 'drink-glass'

let settle: (() => void) | null = null
let lastGlass: string | null = null

const glasses = () => document.querySelectorAll<SVGElement>('svg.glass[data-glass]')

function nameOnly(glass: SVGElement | null) {
  for (const g of glasses()) g.style.viewTransitionName = ''
  if (glass) glass.style.viewTransitionName = NAME
}

/** Remembers the glass inside a tapped link and names it, so it is the one that glides. */
export function rememberGlass(link: Element) {
  const glass = link.querySelector<SVGElement>('svg.glass[data-glass]')
  lastGlass = glass?.dataset.glass ?? null
  nameOnly(glass)
}

/**
 * Called once a new screen has rendered. Names the glass the person left from, if this screen has
 * it, then lets the waiting transition run.
 */
export function routeRendered() {
  if (lastGlass) {
    const home = [...glasses()].find((g) => g.dataset.glass === lastGlass) ?? null
    if (home) nameOnly(home)
  }
  settle?.()
  settle = null
}

/**
 * Runs a navigation inside a view transition where the browser supports one. The old screen stays
 * on display until `routeRendered` reports the new one is ready. Anyone who has asked for less
 * motion gets an ordinary, instant change of screen.
 */
export function withViewTransition(go: () => void) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) {
    go()
    return
  }
  document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        settle = resolve
        go()
        // Never leave the screen frozen if the new one is slow or the navigation went nowhere.
        window.setTimeout(() => {
          if (settle === resolve) routeRendered()
        }, 600)
      }),
  )
}

import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { APP_NAME } from '../config'
import { routeRendered } from '../hooks/viewTransition'

/**
 * Makes moving between screens behave like loading a page: the title names the screen,
 * the view starts at the top, and focus moves to the heading so screen readers announce it.
 */
export function RouteChange() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const firstRender = useRef(true)
  // Read through a ref so that a filter change, which alters the navigation type but not the
  // screen, does not count as moving to a new screen.
  const latestType = useRef(navigationType)
  useLayoutEffect(() => {
    latestType.current = navigationType
  })

  // Before paint, so a view transition captures the new screen already scrolled and focused.
  useLayoutEffect(() => {
    const heading = document.querySelector('h1')
    const name = heading?.textContent?.trim()
    document.title = name && name !== APP_NAME ? `${name} · ${APP_NAME}` : APP_NAME

    if (firstRender.current) {
      firstRender.current = false
      return
    }
    // Going back should return to where the person was, so only new screens start at the top.
    if (latestType.current !== 'POP') window.scrollTo(0, 0)
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
    routeRendered()
  }, [pathname])

  return null
}

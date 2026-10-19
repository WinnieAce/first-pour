import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { rememberGlass, withViewTransition } from '../hooks/viewTransition'

/**
 * A link to a drink page whose glass glides into the big glass on that page. Opening it in a new
 * tab, or any click with a modifier key, behaves like an ordinary link.
 */
export function GlassLink({
  to,
  className,
  style,
  children,
}: {
  to: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const navigate = useNavigate()
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    event.preventDefault()
    rememberGlass(event.currentTarget)
    withViewTransition(() => navigate(to))
  }
  return (
    <Link to={to} className={className} style={style} onClick={onClick}>
      {children}
    </Link>
  )
}

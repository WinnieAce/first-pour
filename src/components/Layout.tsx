import type { CSSProperties } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { APP_NAME, FEEDBACK_URL } from '../config'
import { withViewTransition } from '../hooks/viewTransition'
import { useUserData } from '../storage/UserDataContext'
import { Icon } from './Icon'

const SECTIONS = [
  { to: '/', label: 'Drinks' },
  { to: '/bar', label: 'My bar' },
  { to: '/favourites', label: 'Favourites' },
  { to: '/settings', label: 'Settings' },
]

export function Layout() {
  const { persistent } = useUserData()
  const location = useLocation()
  const navigate = useNavigate()
  const isMainScreen = SECTIONS.some((s) => s.to === location.pathname)
  const active = SECTIONS.findIndex((s) => s.to === location.pathname)
  // An installed app has no browser back button. A page opened directly has nowhere to go back to,
  // so it returns to the drinks list instead.
  const goBack = () => withViewTransition(() => (location.key === 'default' ? navigate('/') : navigate(-1)))
  return (
    <div className="app">
      <header className="header">
        {!isMainScreen && (
          <button className="back" onClick={goBack}>
            <Icon name="back" />
            Back
          </button>
        )}
        <Link to="/" className="brand">
          {APP_NAME}
        </Link>
      </header>
      {!persistent && (
        <p className="notice" role="status">
          Changes won't be saved in this browser session. Private browsing or a full device can cause this.
        </p>
      )}
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <Link to="/terms">Terms and privacy</Link>
        {FEEDBACK_URL && (
          <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
            Send feedback
          </a>
        )}
      </footer>
      {/* One highlight behind the tabs, slid sideways to the current one with a CSS transition. It only
          ever moves within the nav, so scrolling the page between taps cannot throw it off course. */}
      <nav className="nav" aria-label="Main" style={{ '--active': Math.max(active, 0), '--count': SECTIONS.length } as CSSProperties}>
        <span className="nav-pill" data-hidden={active < 0} aria-hidden="true" />
        {SECTIONS.map((s) => (
          <NavLink key={s.to} to={s.to} end={s.to === '/'}>
            <span className="nav-label">{s.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

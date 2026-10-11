import { Link, NavLink, Outlet } from 'react-router-dom'
import { APP_NAME, FEEDBACK_URL } from '../config'
import { useUserData } from '../storage/UserDataContext'

const SECTIONS = [
  { to: '/', label: 'Drinks' },
  { to: '/bar', label: 'My bar' },
  { to: '/favourites', label: 'Favourites' },
  { to: '/settings', label: 'Settings' },
]

export function Layout() {
  const { persistent } = useUserData()
  return (
    <div className="app">
      <header className="header">
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
      <nav className="nav" aria-label="Main">
        {SECTIONS.map((s) => (
          <NavLink key={s.to} to={s.to} end={s.to === '/'}>
            {s.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

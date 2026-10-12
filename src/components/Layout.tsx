import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()
  const navigate = useNavigate()
  const isMainScreen = SECTIONS.some((s) => s.to === location.pathname)
  // An installed app has no browser back button. A page opened directly has nowhere to go back to,
  // so it returns to the drinks list instead.
  const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1))
  return (
    <div className="app">
      <header className="header">
        {!isMainScreen && (
          <button className="back" onClick={goBack}>
            ← Back
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

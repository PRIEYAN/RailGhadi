import { useCallback, useEffect, useState } from 'react'
import Landing from './screens/Landing'
import Auth from './screens/Auth'
import Booking from './screens/Booking'
import styles from './App.module.css'

const SESSION_KEY = 'railghadi_user'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function initialView() {
  try {
    const param = new URLSearchParams(window.location.search).get('view')
    if (param === 'auth' || param === 'app' || param === 'landing') return param
  } catch {
    /* noop */
  }
  return loadSession() ? 'app' : 'landing'
}

export default function App() {
  const [user, setUser] = useState(() => loadSession())
  const [view, setView] = useState(initialView)
  const [authMode, setAuthMode] = useState('signup')

  useEffect(() => {
    document.title =
      view === 'app' ? 'RailGhadi · Booking' : 'RailGhadi · Voice Train Booking'
  }, [view])

  const goAuth = useCallback((mode = 'signup') => {
    setAuthMode(mode)
    setView('auth')
  }, [])

  const handleAuthed = useCallback((profile) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile))
    } catch {
      /* storage may be unavailable (private mode) — proceed in-memory */
    }
    setUser(profile)
    setView('app')
  }, [])

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* noop */
    }
    setUser(null)
    setView('landing')
  }, [])

  return (
    <div className={styles.shell}>
      <div key={view} className={styles.view}>
        {view === 'landing' && (
          <Landing onLogin={() => goAuth('login')} onSignup={() => goAuth('signup')} />
        )}
        {view === 'auth' && (
          <Auth
            mode={authMode}
            onModeChange={setAuthMode}
            onAuthed={handleAuthed}
            onBack={() => setView('landing')}
          />
        )}
        {view === 'app' && <Booking user={user} onLogout={handleLogout} />}
      </div>
    </div>
  )
}

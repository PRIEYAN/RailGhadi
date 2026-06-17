import styles from './Header.module.css'

const STATUS_LABEL = {
  connecting: 'Connecting',
  ready: 'Ready',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
  complete: 'Booked',
  error: 'Offline',
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'GU'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

export default function Header({ status, handsFree, onToggleHandsFree, onReset, user, onLogout }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M7 4h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"
              stroke="white"
              strokeWidth="1.6"
            />
            <path d="M4 10h16" stroke="white" strokeWidth="1.6" />
            <circle cx="8.5" cy="13.5" r="1.1" fill="white" />
            <circle cx="15.5" cy="13.5" r="1.1" fill="white" />
            <path d="M8 17l-2 3M16 17l2 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div className={styles.titles}>
          <h1 className={styles.title}>
            Rail Ghadi
          </h1>
          <p className={styles.tagline}>Voice travel concierge</p>
        </div>
      </div>

      <div className={styles.actions}>
        <span className={`${styles.pill} ${styles[`pill--${status}`] || ''}`}>
          <span className={styles.dot} />
          {STATUS_LABEL[status] || status}
        </span>

        <button
          type="button"
          className={`${styles.toggle} ${handsFree ? styles.toggleOn : ''}`}
          onClick={onToggleHandsFree}
          aria-pressed={handsFree}
          title="Hands-free keeps the mic open between turns"
        >
          <span className={styles.toggleTrack}>
            <span className={styles.toggleThumb} />
          </span>
          <span className={styles.toggleLabel}>Hands-free</span>
        </button>

        <button type="button" className={styles.iconBtn} onClick={onReset} title="New booking">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M4 12a8 8 0 1 1 2.3 5.6M4 12V7m0 5h5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {user && (
          <div className={styles.user}>
            <span className={styles.avatar} aria-hidden="true">
              {initials(user.name || user.email)}
            </span>
            <span className={styles.userName}>{(user.name || user.email || '').split(' ')[0]}</span>
            <button
              type="button"
              className={styles.logout}
              onClick={onLogout}
              title="Log out"
              aria-label="Log out"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M14 5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

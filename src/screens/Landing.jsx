import BrandMark from '../components/BrandMark'
import styles from './Landing.module.css'

const NAV = ['Trains', 'Routes', 'Offers', 'Support']

export default function Landing({ onLogin, onSignup }) {
  return (
    <div className={styles.hero}>
      {/* Full-bleed background photo + legibility overlay */}
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      {/* ---- Nav ---- */}
      <header className={styles.nav}>
        <BrandMark tone="light" />
        <ul className={styles.navLinks}>
          {NAV.map((item) => (
            <li key={item}>
              <a href="#" onClick={(e) => e.preventDefault()}>
                {item}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.navAuth}>
          <button type="button" className={styles.login} onClick={onLogin}>
            Login
          </button>
          <button type="button" className={styles.register} onClick={onSignup}>
            Register
          </button>
        </div>
      </header>

      {/* ---- Hero copy ---- */}
      <main className={styles.content}>
        <p className={styles.eyebrow}>
          Safety <span className={styles.sep} /> Security <span className={styles.sep} /> Punctuality
        </p>
        <h1 className={styles.title}>
          Speak your<br />journey
        </h1>
        <p className={styles.sub}>
          Book any train across the network with nothing but your voice. Tell RailGhadi where
          you're headed and watch your ticket come to life — guided by an AI concierge, confirmed
          in seconds.
        </p>
      </main>

      {/* ---- Bottom dock: voice icon (left) + onboarding CTA ---- */}
      <div className={styles.dock}>
        <button
          type="button"
          className={styles.voice}
          onClick={onSignup}
          aria-label="Start a voice booking"
        >
          <span className={styles.voiceRing} />
          <span className={styles.voiceRing2} />
          <span className={styles.voiceCore}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
              <path
                d="M5 11a7 7 0 0 0 14 0M12 18v3"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className={styles.voiceLabel}>
            <b>Tap to speak</b>
            <i>Start hands-free</i>
          </span>
        </button>

        <div className={styles.onboard}>
          <div className={styles.onboardText}>
            <span className={styles.kicker}>New to RailGhadi?</span>
            <span className={styles.headline}>Your first voice booking takes under a minute.</span>
          </div>
          <button type="button" className={styles.start} onClick={onSignup}>
            Get started
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M5 12h13M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

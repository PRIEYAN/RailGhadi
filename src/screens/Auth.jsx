import { useEffect, useState } from 'react'
import BrandMark from '../components/BrandMark'
import styles from './Auth.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PERKS = [
  'Book your whole journey just by speaking',
  'Watch your ticket fill in, live, as you talk',
  'Instant PNR and e-ticket in seconds',
]

function deriveName(email) {
  const local = (email.split('@')[0] || 'Traveller').replace(/[._-]+/g, ' ')
  return local.replace(/\b\w/g, (c) => c.toUpperCase()).trim() || 'Traveller'
}

export default function Auth({ mode, onModeChange, onAuthed, onBack }) {
  const isSignup = mode === 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setErrors({})
  }, [mode])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (isSignup && form.name.trim().length < 2) next.name = 'Please enter your name'
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address'
    if (form.password.length < 6) next.password = 'At least 6 characters'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (submitting || !validate()) return
    setSubmitting(true)
    // Front-end only demo auth — simulate a brief network round-trip.
    setTimeout(() => {
      onAuthed({
        name: isSignup ? form.name.trim() : deriveName(form.email),
        email: form.email.trim(),
      })
    }, 550)
  }

  const quick = (provider) => {
    if (submitting) return
    setSubmitting(true)
    setTimeout(() => {
      onAuthed({ name: 'Guest Traveller', email: `guest@railghadi.app`, via: provider })
    }, 500)
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={onBack}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      <div className={styles.card}>
        {/* Left brand panel */}
        <aside className={styles.panel}>
          <div className={styles.panelGlow} aria-hidden="true" />
          <BrandMark tone="light" />
          <div className={styles.panelBody}>
            <h2 className={styles.panelTitle}>Your journey starts with a hello.</h2>
            <ul className={styles.perks}>
              {PERKS.map((p) => (
                <li key={p}>
                  <span className={styles.check} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none">
                      <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.panelFoot}>
            <span className={styles.stars}>★★★★★</span>
            “It booked my train before my coffee was ready.”
          </div>
        </aside>

        {/* Right form */}
        <div className={styles.formWrap}>
          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isSignup}
              className={`${styles.tab} ${isSignup ? styles.tabOn : ''}`}
              onClick={() => onModeChange('signup')}
            >
              Sign up
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isSignup}
              className={`${styles.tab} ${!isSignup ? styles.tabOn : ''}`}
              onClick={() => onModeChange('login')}
            >
              Log in
            </button>
            <span className={`${styles.tabGlider} ${isSignup ? '' : styles.tabGliderRight}`} />
          </div>

          <h1 className={styles.heading}>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className={styles.subheading}>
            {isSignup
              ? 'Set up RailGhadi in seconds and book by voice.'
              : 'Log in to pick up where you left off.'}
          </p>

          <div className={styles.social}>
            <button type="button" className={styles.socialBtn} onClick={() => quick('google')}>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.21-4.74 3.21-8.06Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.28-1.93-6.14-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M5.86 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.68-2.84Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.68 2.84C6.72 7.3 9.14 5.38 12 5.38Z" />
              </svg>
              Continue with Google
            </button>
            <button type="button" className={styles.socialBtn} onClick={() => quick('apple')} aria-label="Continue with Apple">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M16.36 12.78c.02 2.43 2.13 3.24 2.16 3.25-.02.06-.34 1.16-1.12 2.3-.67.98-1.37 1.95-2.47 1.97-1.08.02-1.43-.64-2.67-.64-1.24 0-1.62.62-2.64.66-1.06.04-1.87-1.06-2.55-2.04-1.39-2-2.45-5.65-1.02-8.12.71-1.22 1.97-2 3.35-2.02 1.04-.02 2.02.7 2.66.7.63 0 1.83-.86 3.09-.74.53.02 2 .21 2.95 1.6-.08.05-1.76 1.03-1.74 3.06M14.3 4.6c.56-.68.94-1.62.84-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.56-.85 2.48.9.07 1.82-.46 2.38-1.14" />
              </svg>
              Apple
            </button>
          </div>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <form className={styles.form} onSubmit={submit} noValidate>
            {isSignup && (
              <label className={styles.field}>
                <span className={styles.label}>Full name</span>
                <input
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Aria Sharma"
                  autoComplete="name"
                />
                {errors.name && <span className={styles.err}>{errors.name}</span>}
              </label>
            )}

            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span className={styles.err}>{errors.email}</span>}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Password</span>
              <span className={styles.pwWrap}>
                <input
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder={isSignup ? 'Create a password' : 'Your password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className={styles.pwToggle}
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? (
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
                      <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.9 5.2A9.5 9.5 0 0 1 12 5c5 0 9 4.5 9 7 0 1-1 2.6-2.6 4M6.1 6.2C3.8 7.6 2 10 2 12c0 1.4 2.6 5 7 6.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.7" />
                      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
                    </svg>
                  )}
                </button>
              </span>
              {errors.password && <span className={styles.err}>{errors.password}</span>}
            </label>

            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : (
                <>
                  {isSignup ? 'Create account' : 'Log in'}
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className={styles.terms}>
            By continuing you agree to RailGhadi’s Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

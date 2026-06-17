import Waveform from './Waveform'
import styles from './VoiceConsole.module.css'

const HINTS = {
  connecting: 'Warming up the line…',
  ready: 'Tap the mic and tell me your journey',
  listening: 'Listening — speak now',
  thinking: 'Finding the best route…',
  speaking: 'RailGhadi is speaking…',
  complete: 'All booked. Tap to start a new journey',
  error: 'Connection hiccup — tap to retry',
}

export default function VoiceConsole({
  status,
  started,
  listening,
  speaking,
  voiceSupported,
  onToggle,
}) {
  const micState = listening ? 'listening' : speaking ? 'speaking' : status

  return (
    <div className={styles.console}>
      <button
        type="button"
        className={`${styles.mic} ${styles[`mic--${micState}`] || ''} ${
          !started ? styles.micPulseHint : ''
        }`}
        onClick={onToggle}
        aria-label={listening ? 'Stop listening' : 'Start voice booking'}
        title={voiceSupported ? '' : 'Voice not supported here — type below instead'}
      >
        <span className={styles.ring} />
        <span className={styles.ring2} />
        <span className={styles.micInner}>
          {listening ? (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <rect x="7" y="7" width="10" height="10" rx="2.5" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
              <path
                d="M5 11a7 7 0 0 0 14 0M12 18v3"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </button>

      <div className={styles.meter}>
        <div className={styles.wave}>
          <Waveform active={listening} speaking={speaking} />
        </div>
        <p className={styles.hint}>
          {voiceSupported === false
            ? 'Voice input is unavailable in this browser — type below.'
            : HINTS[micState] || HINTS[status]}
        </p>
      </div>
    </div>
  )
}

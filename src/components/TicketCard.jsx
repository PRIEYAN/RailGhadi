import { REQUIRED_FIELDS, isComplete } from '../lib/parse'
import styles from './TicketCard.module.css'

// Derive a 3-letter station code from a free-text station name.
function code(name) {
  if (!name) return '•••'
  const letters = name.replace(/[^a-z]/gi, '')
  return (letters.slice(0, 3) || name.slice(0, 3)).toUpperCase()
}

// Deterministic faux-PNR so it doesn't flicker between renders.
function pnr(booking) {
  const seed = REQUIRED_FIELDS.map((f) => booking[f] || '').join('|')
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const a = letters[h % 24]
  const b = letters[(h >> 5) % 24]
  const num = (h % 900000) + 100000
  return `${a}${b}${num}`
}

// A small animated barcode strip derived from the PNR.
function barcode(seedStr) {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) h = (h * 33 + seedStr.charCodeAt(i)) >>> 0
  const bars = []
  for (let i = 0; i < 42; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    bars.push(1 + (h % 3))
  }
  return bars
}

function Field({ label, value, suffix = '' }) {
  const filled = value !== undefined && value !== '' && value !== null
  return (
    <div className={`${styles.field} ${filled ? styles.fieldFilled : ''}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>
        {filled ? (
          <>
            {value}
            {suffix}
          </>
        ) : (
          <span className={styles.placeholder}>—</span>
        )}
      </span>
    </div>
  )
}

export default function TicketCard({ booking, status }) {
  const done = isComplete(booking)
  const filledCount = REQUIRED_FIELDS.filter((f) => booking[f]).length
  const progress = Math.round((filledCount / REQUIRED_FIELDS.length) * 100)
  const ref = pnr(booking)

  return (
    <div className={`${styles.ticket} ${done ? styles.ticketDone : ''}`}>
      <div className={styles.glow} aria-hidden="true" />

      {/* Header strip */}
      <div className={styles.top}>
        <div className={styles.brandRow}>
          <span className={styles.brandMark}>🚄</span>
          <span className={styles.brandName}>RailGhadi Express</span>
        </div>
        <span className={`${styles.live} ${done ? styles.liveDone : ''}`}>
          {done ? 'Confirmed' : status === 'thinking' ? 'Updating' : 'Draft'}
        </span>
      </div>

      {/* Journey */}
      <div className={styles.journey}>
        <div className={styles.station}>
          <span className={styles.code}>{code(booking.from)}</span>
          <span className={styles.cityName}>{booking.from || 'Origin'}</span>
        </div>

        <div className={styles.route} aria-hidden="true">
          <span className={styles.routeDot} />
          <span className={styles.routeLine}>
            <span className={styles.train}>
              <svg viewBox="0 0 30 12" width="26" height="11" fill="#222222">
                <path d="M0 4h17V1l11 5-11 5V8H0z"/>
              </svg>
            </span>
          </span>
          <span className={styles.routeDot} />
        </div>

        <div className={`${styles.station} ${styles.stationRight}`}>
          <span className={styles.code}>{code(booking.to)}</span>
          <span className={styles.cityName}>{booking.to || 'Destination'}</span>
        </div>
      </div>

      {/* Details grid */}
      <div className={styles.grid}>
        <Field label="Passenger" value={booking.name} />
        <Field label="Travellers" value={booking.passengers} />
        <Field label="Date" value={booking.date} />
        <Field label="Departure" value={booking.time} />
        <Field label="Class" value={booking.class || (done ? 'Standard' : undefined)} />
        <Field label="PNR" value={done ? ref : undefined} />
      </div>

      {/* Progress */}
      {!done && (
        <div className={styles.progress}>
          <div className={styles.progressHead}>
            <span>Booking progress</span>
            <span>{filledCount}/{REQUIRED_FIELDS.length}</span>
          </div>
          <div className={styles.bar}>
            <div className={styles.barFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Perforation */}
      <div className={styles.perf} aria-hidden="true">
        <span className={styles.notchL} />
        <span className={styles.dashes} />
        <span className={styles.notchR} />
      </div>

      {/* Stub / barcode */}
      <div className={styles.stub}>
        {done ? (
          <>
            <div className={styles.barcode} aria-hidden="true">
              {barcode(ref).map((w, i) => (
                <span key={i} style={{ width: `${w}px` }} />
              ))}
            </div>
            <div className={styles.stamp}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              E-ticket ready · {ref}
            </div>
          </>
        ) : (
          <p className={styles.stubHint}>
            Your ticket fills in live as we talk. Tell me where you'd like to go.
          </p>
        )}
      </div>
    </div>
  )
}

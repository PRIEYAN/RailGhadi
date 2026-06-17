import { REQUIRED_FIELDS, isComplete } from '../lib/parse'
import { useRailGhadi } from '../hooks/useRailGhadi'
import Header from '../components/Header'
import Conversation from '../components/Conversation'
import VoiceConsole from '../components/VoiceConsole'
import Composer from '../components/Composer'
import styles from './Booking.module.css'

function stationCode(name) {
  if (!name) return '•••'
  const letters = name.replace(/[^a-z]/gi, '')
  return (letters.slice(0, 3) || name.slice(0, 3)).toUpperCase()
}

function makePNR(booking) {
  const seed = REQUIRED_FIELDS.map((f) => booking[f] || '').join('|')
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return `${letters[h % 24]}${letters[(h >> 5) % 24]}${(h % 900000) + 100000}`
}

function Field({ label, value }) {
  const filled = value !== undefined && value !== '' && value !== null
  return (
    <div className={`${styles.field} ${filled ? styles.fieldFilled : ''}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>
        {filled ? value : <span className={styles.placeholder}>—</span>}
      </span>
    </div>
  )
}

export default function Booking({ user, onLogout }) {
  const rg = useRailGhadi()
  const done = isComplete(rg.booking)
  const filledCount = REQUIRED_FIELDS.filter((f) => rg.booking[f]).length
  const progress = Math.round((filledCount / REQUIRED_FIELDS.length) * 100)
  const ref = makePNR(rg.booking)
  const showTrainDetails = Boolean(rg.booking.train)

  return (
    <div className={styles.screen}>
      <div className="aurora" aria-hidden="true">
        <div className="aurora__blob aurora__blob--1" />
        <div className="aurora__blob aurora__blob--2" />
        <div className="aurora__blob aurora__blob--3" />
        <div className="aurora__blob aurora__blob--4" />
      </div>
      <div className="aurora__grain" aria-hidden="true" />

      <main className={styles.app}>

        {/* ── LEFT: Journey display (AuctionAir item panel) ── */}
        <section className={styles.journeyPanel}>
          <Header
            status={rg.status}
            handsFree={rg.handsFree}
            onToggleHandsFree={() => rg.setHandsFree((v) => !v)}
            onReset={rg.reset}
            user={user}
            onLogout={onLogout}
          />

          {/* Title + status badge */}
          <div className={styles.titleRow}>
            <div>
              <h2 className={styles.journeyTitle}>RailGhadi Express</h2>
              {done && <p className={styles.journeyRef}>{ref}</p>}
            </div>
            <span className={`${styles.statusBadge} ${done ? styles.statusDone : ''}`}>
              {done ? 'Confirmed' : rg.status === 'thinking' ? 'Updating…' : 'Draft'}
            </span>
          </div>

          {/* Tags row */}
          <div className={styles.tagsRow}>
            <span className={styles.tag}>🚄 Train</span>
            <span className={styles.tag}>{rg.booking.class || 'Standard'}</span>
            {rg.booking.passengers && (
              <span className={styles.tag}>{rg.booking.passengers} Pax</span>
            )}
          </div>

          <div className={styles.hero}>
            {showTrainDetails ? (
              <div className={styles.routeViz}>
                <div className={styles.heroStation}>
                  <span className={styles.heroCode}>{stationCode(rg.booking.from)}</span>
                  <span className={styles.heroCity}>{rg.booking.from || 'Mumbai'}</span>
                </div>

                <div className={styles.heroTrack}>
                  <span className={styles.heroDot} />
                  <div className={styles.heroLine}>
                    <span className={styles.heroArrow}>
                      <svg viewBox="0 0 30 12" width="26" height="11" fill="#ffffff">
                        <path d="M0 4h17V1l11 5-11 5V8H0z" />
                      </svg>
                    </span>
                  </div>
                  <span className={styles.heroDot} />
                </div>

                <div className={`${styles.heroStation} ${styles.heroStationR}`}>
                  <span className={styles.heroCode}>{stationCode(rg.booking.to)}</span>
                  <span className={styles.heroCity}>{rg.booking.to || 'Pune'}</span>
                </div>
              </div>
            ) : (
              <div className={styles.heroBlank} aria-hidden="true" />
            )}
          </div>

          {/* Trait grid (3 × 2) */}
          <div className={styles.traitGrid}>
            <Field label="Passenger" value={rg.booking.name} />
            <Field label="Travellers" value={rg.booking.passengers} />
            <Field label="Class" value={rg.booking.class} />
            <Field label="Date" value={rg.booking.date} />
            <Field label="Departure" value={rg.booking.time} />
            <Field label="PNR" value={done ? ref : undefined} />
          </div>

          {/* Progress bar + contract footer */}
          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <span className={styles.footerLabel}>CONTRACT</span>
              <span className={styles.footerVal}>
                {done ? ref : `0x${ref.toLowerCase().slice(0, 4)}…${ref.toLowerCase().slice(-4)}`}
              </span>
            </div>
            <div className={styles.footerRight}>
              <span className={styles.footerLabel}>{filledCount}/{REQUIRED_FIELDS.length} fields</span>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* ── RIGHT: Action + Chat (AuctionAir bid + feed) ── */}
        <aside className={styles.chatPanel}>

          {/* Booking info block (like "CURRENT BID") */}
          <div className={styles.bookingBlock}>
            <div className={styles.blockTop}>
              <span className={styles.blockLabel}>DEPARTURE</span>
              <span className={styles.blockDate}>{rg.booking.date || '— — —'}</span>
            </div>
            <div className={styles.depTime}>
              {rg.booking.time || '--:--'}
            </div>
            <button className={styles.primaryBtn} disabled={!done}>
              Confirm Booking
            </button>
            <button className={styles.secondaryBtn} onClick={rg.reset}>
              Reset Journey
            </button>
          </div>

          {/* Live feed label */}
          <div className={styles.feedLabel}>Live Feed</div>

          {/* Conversation */}
          <Conversation messages={rg.messages} status={rg.status} interim={rg.interim} />

          {/* Voice + input dock */}
          <div className={styles.dock}>
            <VoiceConsole
              status={rg.status}
              started={rg.started}
              listening={rg.listening}
              speaking={rg.speaking}
              voiceSupported={rg.voiceSupported}
              onToggle={rg.toggleVoice}
            />
            <Composer disabled={rg.status === 'thinking'} onSubmit={rg.submitText} />
          </div>
        </aside>
      </main>
    </div>
  )
}

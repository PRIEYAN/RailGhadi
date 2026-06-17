import { useEffect, useRef } from 'react'
import styles from './Conversation.module.css'

function Avatar({ role }) {
  if (role === 'user') {
    return (
      <div className={`${styles.avatar} ${styles.avatarUser}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
          <path d="M5 19a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
    )
  }
  return (
    <div className={`${styles.avatar} ${styles.avatarBot}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
        <rect x="4.5" y="6.5" width="15" height="11" rx="3" stroke="white" strokeWidth="1.6" />
        <path d="M4.5 12h15" stroke="white" strokeWidth="1.6" />
        <path d="M8 17l-1.5 2.5M16 17l1.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function Conversation({ messages, status, interim, booking }) {
  const scrollRef = useRef(null)
  const endRef = useRef(null)
  const hasUser = Array.isArray(messages) && messages.some((m) => m.role === 'user')

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, status, interim])

  return (
    <div className={styles.wrap} ref={scrollRef}>
      <div className={styles.trainInfo}>
        {hasUser && booking && booking.train ? (
          <div className={styles.trainCard}>
            <div className={styles.trainRow}>
              <div className={styles.trainName}>{booking.train}</div>
              <div className={styles.trainAvail}>{booking.availability}</div>
            </div>
            <div className={styles.trainDetails}>
              <div>Capacity: <strong>{booking.capacity}</strong></div>
              <div>Seats available: <strong>{booking.seatsAvailable}</strong></div>
              <div>Departure: <strong>{booking.expectedDeparture}</strong></div>
              <div>Arrival: <strong>{booking.expectedArrival}</strong></div>
            </div>
          </div>
        ) : (
          <div className={styles.trainEmpty} />
        )}
      </div>
      <div className={styles.list}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.row} ${m.role === 'user' ? styles.rowUser : styles.rowBot}`}
          >
            {m.role !== 'user' && <Avatar role="assistant" />}
            <div
              className={[
                styles.bubble,
                m.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
                m.error ? styles.bubbleError : '',
                m.done ? styles.bubbleDone : '',
              ].join(' ')}
            >
              {m.text}
              {m.done && (
                <span className={styles.doneTag}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none">
                    <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Booking confirmed
                </span>
              )}
            </div>
            {m.role === 'user' && <Avatar role="user" />}
          </div>
        ))}

        {/* Live interim transcript while the user is speaking */}
        {interim && (
          <div className={`${styles.row} ${styles.rowUser}`}>
            <div className={`${styles.bubble} ${styles.bubbleUser} ${styles.bubbleInterim}`}>
              {interim}
            </div>
            <Avatar role="user" />
          </div>
        )}

        {/* Thinking indicator */}
        {status === 'thinking' && (
          <div className={`${styles.row} ${styles.rowBot}`}>
            <Avatar role="assistant" />
            <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typing}`}>
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  )
}

import styles from './BrandMark.module.css'

export default function BrandMark({ onClick, tone = 'dark' }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`${styles.brand} ${tone === 'light' ? styles.light : ''}`}
      onClick={onClick}
      aria-label="RailGhadi home"
    >
      <span className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
          <path
            d="M7 4h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"
            stroke="white"
            strokeWidth="1.7"
          />
          <path d="M4 10h16" stroke="white" strokeWidth="1.7" />
          <circle cx="8.5" cy="13.5" r="1.1" fill="white" />
          <circle cx="15.5" cy="13.5" r="1.1" fill="white" />
          <path d="M8 17l-2 3M16 17l2 3" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </span>
      <span className={styles.word}>
        Rail<span className={styles.accent}>Ghadi</span>
      </span>
    </Tag>
  )
}

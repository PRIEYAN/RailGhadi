import { useState } from 'react'
import styles from './Composer.module.css'

export default function Composer({ disabled, onSubmit }) {
  const [value, setValue] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const text = value.trim()
    if (!text || disabled) return
    onSubmit(text)
    setValue('')
  }

  return (
    <form className={styles.composer} onSubmit={submit}>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="…or type your journey — e.g. “Paris to Lyon for 2 on 18/06 at 09:30”"
        aria-label="Type your booking request"
        autoComplete="off"
      />
      <button
        type="submit"
        className={styles.send}
        disabled={disabled || !value.trim()}
        aria-label="Send"
      >
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
          <path
            d="M5 12h13M12 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  )
}

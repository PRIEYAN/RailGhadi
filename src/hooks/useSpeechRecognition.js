import { useCallback, useEffect, useRef, useState } from 'react'

const SR =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

/**
 * Wraps the Web Speech API SpeechRecognition.
 * A fresh instance is created per `start()` to avoid stale-state quirks.
 * The orchestrator decides whether to restart after `onFinal`.
 */
export function useSpeechRecognition({ lang = 'en-US', onFinal } = {}) {
  const supported = !!SR
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState(null)

  const recRef = useRef(null)
  const onFinalRef = useRef(onFinal)
  useEffect(() => {
    onFinalRef.current = onFinal
  }, [onFinal])

  const stop = useCallback(() => {
    setListening(false)
    setInterim('')
    const rec = recRef.current
    recRef.current = null
    if (rec) {
      try {
        rec.onresult = rec.onend = rec.onerror = null
        rec.stop()
      } catch {
        /* already stopped */
      }
    }
  }, [])

  const start = useCallback(() => {
    if (!supported) {
      setError('unsupported')
      return
    }
    // Tear down any previous instance first.
    if (recRef.current) {
      try {
        recRef.current.onend = null
        recRef.current.stop()
      } catch {
        /* noop */
      }
    }

    const rec = new SR()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1
    recRef.current = rec

    rec.onstart = () => {
      setError(null)
      setListening(true)
    }
    rec.onresult = (event) => {
      let interimText = ''
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalText += result[0].transcript
        else interimText += result[0].transcript
      }
      setInterim(interimText)
      if (finalText.trim()) {
        setInterim('')
        onFinalRef.current?.(finalText.trim())
      }
    }
    rec.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error)
      }
    }
    rec.onend = () => {
      setListening(false)
      setInterim('')
    }

    try {
      rec.start()
    } catch {
      /* start() can throw if called twice quickly; ignore */
    }
  }, [supported, lang])

  useEffect(() => () => stop(), [stop])

  return { supported, listening, interim, error, start, stop }
}

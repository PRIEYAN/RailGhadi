import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Wraps window.speechSynthesis with React-friendly state and a tidy
 * voice-selection heuristic. `unlock()` should be called from a user
 * gesture so browsers permit later programmatic speech.
 */
export function useSpeechSynthesis({ lang = 'en-US' } = {}) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
  const supported = !!synth
  const [speaking, setSpeaking] = useState(false)
  const voicesRef = useRef([])
  const unlockedRef = useRef(false)

  useEffect(() => {
    if (!synth) return
    const load = () => {
      voicesRef.current = synth.getVoices()
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
  }, [synth])

  const pickVoice = useCallback(
    (targetLang) => {
      const voices = voicesRef.current
      if (!voices.length) return null
      const base = targetLang.split('-')[0].toLowerCase()
      const sameLang = voices.filter((v) => v.lang?.toLowerCase().startsWith(base))
      const pool = sameLang.length ? sameLang : voices
      // Prefer richer, more natural voices when present.
      const preferred = pool.find((v) => /google|natural|samantha|aria|jenny|libby/i.test(v.name))
      return preferred || pool.find((v) => v.lang?.toLowerCase() === targetLang.toLowerCase()) || pool[0]
    },
    []
  )

  const speak = useCallback(
    (text, { onEnd, voiceLang = lang } = {}) => {
      if (!synth || !text) {
        onEnd?.()
        return
      }
      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      const voice = pickVoice(voiceLang)
      if (voice) utterance.voice = voice
      utterance.lang = voiceLang
      utterance.rate = 1.02
      utterance.pitch = 1.0
      utterance.volume = 1
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => {
        setSpeaking(false)
        onEnd?.()
      }
      utterance.onerror = () => {
        setSpeaking(false)
        onEnd?.()
      }
      synth.speak(utterance)
    },
    [synth, lang, pickVoice]
  )

  const cancel = useCallback(() => {
    if (!synth) return
    synth.cancel()
    setSpeaking(false)
  }, [synth])

  // Unlock audio on first user gesture (mobile Safari / Chrome autoplay).
  const unlock = useCallback(() => {
    if (!synth || unlockedRef.current) return
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    synth.speak(u)
    unlockedRef.current = true
  }, [synth])

  return { supported, speaking, speak, cancel, unlock }
}

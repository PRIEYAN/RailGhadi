import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchSystemPrompt } from '../lib/api'
import { isComplete } from '../lib/parse'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useSpeechSynthesis } from './useSpeechSynthesis'

const LANG = 'en-US'
const GREETING =
  'Welcome aboard RailGhadi, your voice travel concierge. Where would you like to journey today?'

let _id = 0
const uid = () => `m${++_id}`

/**
 * Central orchestrator: owns the transcript, the live booking, and the
 * status machine, and wires speech-in -> Gemini -> speech-out together.
 *
 * status: 'connecting' | 'ready' | 'listening' | 'thinking' | 'speaking'
 *       | 'complete' | 'error'
 */
export function useRailGhadi() {
  const [status, setStatus] = useState('connecting')
  const [messages, setMessages] = useState([])
  const [booking, setBooking] = useState({})
  const [started, setStarted] = useState(false)
  const [handsFree, setHandsFree] = useState(true)
  const [error, setError] = useState(null)

  const historyRef = useRef([]) // Gemini-format conversation history
  const handsFreeRef = useRef(handsFree)
  const completeRef = useRef(false)
  const bookingRef = useRef({}) // latest committed booking, for sync reads
  const voiceSupportedRef = useRef(false)
  const didInitRef = useRef(false)
  useEffect(() => {
    handsFreeRef.current = handsFree
  }, [handsFree])
  useEffect(() => {
    bookingRef.current = booking
  }, [booking])

  const synth = useSpeechSynthesis({ lang: LANG })
  const synthRef = useRef(synth)
  synthRef.current = synth

  const addMessage = useCallback((role, text, extra = {}) => {
    setMessages((prev) => [...prev, { id: uid(), role, text, ...extra }])
  }, [])

  // ---- send a user utterance through the backend -------------------------
  const recRef = useRef(null) // set after recognition hook is created
  const sendUserText = useCallback(
    async (raw) => {
      const text = (raw || '').trim()
      if (!text) return
      recRef.current?.stop()
      addMessage('user', text)
      historyRef.current.push({ role: 'user', parts: [{ text }] })
      setStatus('thinking')

      // Mocked response: generate fake availability and booking info locally.
      try {
        await new Promise((r) => setTimeout(r, 500)) // small thinking delay

        const mock = {
          train: 'RailGhadi Express 123',
          from: bookingRef.current.from || 'Mumbai Central',
          to: bookingRef.current.to || 'Pune Junction',
          name: bookingRef.current.name || 'A. Passenger',
          passengers: bookingRef.current.passengers || 1,
          class: bookingRef.current.class || 'AC 2 Tier',
          date: bookingRef.current.date || new Date().toISOString().slice(0, 10),
          time: bookingRef.current.time || '09:30',
          availability: 'Available',
          capacity: 200,
          seatsAvailable: 42,
          expectedDeparture: bookingRef.current.time || '09:30',
          expectedArrival: '12:45',
        }

        const merged = { ...bookingRef.current, ...mock }
        bookingRef.current = merged
        setBooking(merged)

        const spoken = `Found ${mock.train}: ${mock.availability}. Capacity ${mock.capacity}, seats available ${mock.seatsAvailable}. Departs at ${mock.expectedDeparture}, arrives ${mock.expectedArrival}.`
        addMessage('assistant', spoken)
        setStatus('speaking')

        synthRef.current.speak(spoken, {
          onEnd: () => {
            if (handsFreeRef.current && voiceSupportedRef.current && !completeRef.current) {
              setStatus('listening')
              recRef.current?.start()
            } else {
              setStatus('ready')
            }
          },
        })
      } catch (err) {
        const msg = 'Sorry — booking service is unavailable (mock).' 
        addMessage('assistant', msg, { error: true })
        setError(err.message || 'mock failure')
        setStatus('speaking')
        synthRef.current.speak(msg, { onEnd: () => setStatus('ready') })
      }
    },
    [addMessage]
  )

  // ---- speech recognition -----------------------------------------------
  const recognition = useSpeechRecognition({ lang: LANG, onFinal: sendUserText })
  recRef.current = recognition
  voiceSupportedRef.current = recognition.supported

  useEffect(() => {
    if (recognition.listening) setStatus('listening')
  }, [recognition.listening])

  // ---- load system prompt on mount --------------------------------------
  useEffect(() => {
    if (didInitRef.current) return // guard against StrictMode double-invoke
    didInitRef.current = true
    let active = true
    addMessage('assistant', GREETING, { greeting: true })
    fetchSystemPrompt()
      .then((prompt) => {
        if (!active) return
        historyRef.current.push({ role: 'user', parts: [{ text: `System: ${prompt}` }] })
        historyRef.current.push({ role: 'model', parts: [{ text: 'Understood.' }] })
      })
      .catch(() => {
        /* backend may still answer /process; proceed regardless */
      })
      .finally(() => active && setStatus('ready'))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- public controls ---------------------------------------------------
  const beginSession = useCallback(() => {
    setStarted(true)
    synthRef.current.unlock()
    setStatus('speaking')
    synthRef.current.speak(GREETING, {
      onEnd: () => {
        if (handsFreeRef.current && voiceSupportedRef.current) {
          setStatus('listening')
          recRef.current?.start()
        } else {
          setStatus('ready')
        }
      },
    })
  }, [])

  const stopEverything = useCallback(() => {
    recRef.current?.stop()
    synthRef.current.cancel()
    setStatus(completeRef.current ? 'complete' : 'ready')
  }, [])

  // The primary mic button handler — context-aware.
  const toggleVoice = useCallback(() => {
    if (!started) {
      beginSession()
      return
    }
    if (status === 'listening') {
      recRef.current?.stop()
      setStatus('ready')
    } else if (status === 'speaking' || status === 'thinking') {
      stopEverything()
    } else {
      synthRef.current.cancel()
      setStatus('listening')
      recRef.current?.start()
    }
  }, [started, status, beginSession, stopEverything])

  const submitText = useCallback(
    (text) => {
      if (!started) {
        setStarted(true)
        synthRef.current.unlock()
      }
      sendUserText(text)
    },
    [started, sendUserText]
  )

  const reset = useCallback(() => {
    recRef.current?.stop()
    synthRef.current.cancel()
    historyRef.current = historyRef.current.slice(0, 2) // keep system priming
    completeRef.current = false
    bookingRef.current = {}
    setBooking({})
    setMessages([{ id: uid(), role: 'assistant', text: GREETING, greeting: true }])
    setStatus('ready')
    setError(null)
  }, [])

  return {
    status,
    messages,
    booking,
    started,
    handsFree,
    setHandsFree,
    error,
    interim: recognition.interim,
    listening: recognition.listening,
    speaking: synth.speaking,
    voiceSupported: recognition.supported,
    toggleVoice,
    submitText,
    reset,
  }
}

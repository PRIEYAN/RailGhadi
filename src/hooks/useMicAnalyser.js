import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * When `active`, opens a mic stream and exposes a `getLevels(bins)` reader
 * that returns normalised frequency magnitudes (0..1) for a live waveform.
 * Degrades silently to an idle visual if mic access is denied. This runs an
 * independent getUserMedia stream from SpeechRecognition, purely for visuals.
 */
export function useMicAnalyser(active) {
  const [ready, setReady] = useState(false)
  const analyserRef = useRef(null)
  const dataRef = useRef(null)
  const ctxRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (!active) return
    let cancelled = false

    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        const Ctx = window.AudioContext || window.webkitAudioContext
        const ctx = new Ctx()
        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 128
        analyser.smoothingTimeConstant = 0.8
        source.connect(analyser)

        streamRef.current = stream
        ctxRef.current = ctx
        analyserRef.current = analyser
        dataRef.current = new Uint8Array(analyser.frequencyBinCount)
        setReady(true)
      } catch {
        /* mic blocked — waveform stays in idle mode */
      }
    }
    setup()

    return () => {
      cancelled = true
      setReady(false)
      analyserRef.current = null
      dataRef.current = null
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {})
        ctxRef.current = null
      }
    }
  }, [active])

  const getLevels = useCallback((bins = 28) => {
    const analyser = analyserRef.current
    const data = dataRef.current
    if (!analyser || !data) return null
    analyser.getByteFrequencyData(data)
    const usable = Math.floor(data.length * 0.7) // ignore the highest, noisy bins
    const out = new Array(bins)
    const step = usable / bins
    for (let i = 0; i < bins; i++) {
      let sum = 0
      let count = 0
      for (let j = Math.floor(i * step); j < Math.floor((i + 1) * step); j++) {
        sum += data[j]
        count++
      }
      out[i] = count ? sum / count / 255 : 0
    }
    return out
  }, [])

  return { ready, getLevels }
}

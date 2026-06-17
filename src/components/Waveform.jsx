import { useEffect, useRef } from 'react'
import { useMicAnalyser } from '../hooks/useMicAnalyser'

const BINS = 36

/**
 * A live audio bar visualiser.
 *  - `active` (listening): renders real mic frequency data.
 *  - `speaking`: renders a synthetic equalizer so the AI voice feels alive.
 *  - otherwise: a calm idle ripple.
 */
export default function Waveform({ active, speaking }) {
  const canvasRef = useRef(null)
  const { ready, getLevels } = useMicAnalyser(active)
  const stateRef = useRef({ active, speaking, ready })
  stateRef.current = { active, speaking, ready }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const smoothed = new Array(BINS).fill(0)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      const t = performance.now() / 1000
      const s = stateRef.current

      const live = s.active && s.ready ? getLevels(BINS) : null

      ctx.fillStyle = '#ffffff'

      const gap = 4
      const barW = Math.max(2, (width - gap * (BINS - 1)) / BINS)
      const mid = height / 2

      for (let i = 0; i < BINS; i++) {
        let target
        if (live) {
          target = Math.min(1, live[i] * 1.7)
        } else if (s.speaking) {
          // travelling sine wave for the speaking state
          target = 0.28 + 0.42 * Math.abs(Math.sin(t * 6 + i * 0.5)) * (0.6 + 0.4 * Math.sin(t * 2))
        } else {
          // gentle idle ripple
          target = 0.06 + 0.05 * Math.abs(Math.sin(t * 1.5 + i * 0.4))
        }
        // bell-shaped emphasis toward the centre
        const center = 1 - Math.abs(i - (BINS - 1) / 2) / ((BINS - 1) / 2)
        target *= 0.45 + 0.55 * center

        smoothed[i] += (target - smoothed[i]) * 0.28
        const h = Math.max(barW, smoothed[i] * (height - 6))
        const x = i * (barW + gap)
        const r = barW / 2
        const y = mid - h / 2

        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(x, y, barW, h, r)
        else ctx.rect(x, y, barW, h)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [getLevels])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

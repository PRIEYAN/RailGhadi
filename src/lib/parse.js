// Parses the AI response into a human-facing message + a structured
// booking object. The model is instructed to append a ```json``` block
// summarising everything collected so far; we strip it from the spoken
// text and normalise its keys into our canonical booking shape.

// Canonical booking fields used across the UI.
export const BOOKING_FIELDS = ['name', 'from', 'to', 'date', 'time', 'passengers', 'class']

// Required fields that constitute a "complete" booking.
export const REQUIRED_FIELDS = ['name', 'from', 'to', 'date', 'time', 'passengers']

// Map of accepted source keys (English + legacy French) -> canonical key.
const KEY_ALIASES = {
  name: 'name',
  nom: 'name',
  passenger: 'passengers',
  passengers: 'passengers',
  travellers: 'passengers',
  travelers: 'passengers',
  people: 'passengers',
  nombre_personnes: 'passengers',
  nombrepersonnes: 'passengers',
  from: 'from',
  origin: 'from',
  source: 'from',
  departure: 'from',
  depart: 'from',
  to: 'to',
  destination: 'to',
  arrival: 'to',
  arrivee: 'to',
  date: 'date',
  time: 'time',
  heure: 'time',
  class: 'class',
  classe: 'class',
  coach: 'class',
}

function normalise(raw) {
  const out = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [k, v] of Object.entries(raw)) {
    if (v === null || v === undefined || v === '') continue
    const canon = KEY_ALIASES[k.toLowerCase().replace(/\s+/g, '_')]
    if (!canon) continue
    if (canon === 'passengers') {
      const n = parseInt(String(v).replace(/\D/g, ''), 10)
      if (!Number.isNaN(n) && n > 0) out.passengers = n
    } else {
      const s = String(v).trim()
      if (s && !/^(unknown|n\/?a|null|tbd|\?+)$/i.test(s)) out[canon] = s
    }
  }
  return out
}

// Pull the first balanced JSON object out of a string starting at `start`.
function extractBalanced(text, start) {
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

export function parseAiResponse(text) {
  if (!text) return { message: '', booking: {} }

  let message = text
  let jsonStr = null

  // 1) fenced ```json ... ``` (or plain ``` ... ```) block
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) {
    jsonStr = fenced[1].trim()
    message = text.replace(fenced[0], '')
  } else {
    // 2) fall back to the last bare {...} object in the text
    const brace = text.lastIndexOf('{')
    if (brace !== -1) {
      const candidate = extractBalanced(text, brace)
      if (candidate) {
        jsonStr = candidate
        message = text.slice(0, brace) + text.slice(brace + candidate.length)
      }
    }
  }

  let booking = {}
  if (jsonStr) {
    try {
      booking = normalise(JSON.parse(jsonStr))
    } catch {
      booking = {}
    }
  }

  return { message: message.replace(/\s+\n/g, '\n').trim(), booking }
}

export function isComplete(booking) {
  return REQUIRED_FIELDS.every((f) => booking[f] !== undefined && booking[f] !== '')
}

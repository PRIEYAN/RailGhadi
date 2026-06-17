# RailGhadi — Frontend

A premium, voice-powered train-booking assistant built with **React + Vite**.
Light, airy glassmorphism UI with a live audio waveform, a conversational
transcript, and a boarding-pass ticket that fills in as you talk.

## Features

- 🎙️ **Voice booking** — speaks and listens via the Web Speech API
  (speech recognition + synthesis), with a real-time mic waveform.
- 💬 **Live transcript** — animated chat bubbles, typing indicator, and an
  interim "you're saying…" preview.
- 🎫 **Live ticket** — a glass boarding-pass that updates field-by-field and
  issues a confirmation + e-ticket once the booking is complete.
- ⌨️ **Type or talk** — a text composer is always available as a fallback.
- 🤝 **Hands-free mode** — keeps the mic open between turns for a natural,
  back-and-forth conversation.

## How it connects to the backend

The Express server (`../server.js`, port **5050**) exposes:

| Route             | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| `GET /system-prompt` | Primes the assistant with the current date + role |
| `POST /process`   | Forwards the conversation to Gemini and returns the reply |

The assistant ends each reply with a fenced `json` block describing the
booking so far; the frontend parses it into the live ticket
(see [`src/lib/parse.js`](src/lib/parse.js)).

## Develop

```bash
# 1. start the backend (from the project root) — needs GEMINI_API_KEY in .env
npm install
npm start

# 2. start the frontend (from this folder)
cd frontend
npm install
npm run dev        # http://localhost:5173
```

In dev, Vite proxies `/process` and `/system-prompt` to `http://localhost:5050`
(see [`vite.config.js`](vite.config.js)), so there is no CORS to configure.

## Production build

```bash
cd frontend
npm run build      # outputs to frontend/dist
```

`../server.js` automatically serves `frontend/dist` when it exists, so after a
build you can run `npm start` from the project root and open
`http://localhost:5050`.

## Notes

- Voice features need a Chromium-based browser (Chrome/Edge) for
  `webkitSpeechRecognition`. Where unavailable, the UI falls back to typing.
- The waveform requests its own microphone stream purely for visuals and
  degrades gracefully to an idle animation if permission is denied.

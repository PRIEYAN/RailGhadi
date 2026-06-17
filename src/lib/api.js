// Thin client for the Express backend (server.js).
// Routes are proxied by Vite in dev (see vite.config.js) and served
// same-origin in production.

export async function fetchSystemPrompt() {
  const res = await fetch('/system-prompt')
  if (!res.ok) throw new Error(`system-prompt ${res.status}`)
  const data = await res.json()
  return data.prompt
}

export async function processText(text, conversationHistory) {
  const res = await fetch('/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, conversationHistory }),
  })
  if (!res.ok) throw new Error(`process ${res.status}`)
  const data = await res.json()
  if (data.status === 'error') {
    throw new Error(data.message || 'Backend error')
  }
  return data
}

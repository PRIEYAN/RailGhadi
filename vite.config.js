import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Express backend (server.js) runs on port 5050 and exposes
// `/system-prompt` and `/process`. During development we proxy those
// API routes so the React app can call them same-origin (no CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/process': 'http://localhost:5050',
      '/system-prompt': 'http://localhost:5050',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})

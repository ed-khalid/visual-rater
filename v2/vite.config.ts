import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port 3001 so v2 can run alongside the v1 frontend on 3000.
// /api goes to the small lookup server (server/index.ts) on 3002.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: { '/api': 'http://127.0.0.1:3002' },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port 3001 so v2 can run alongside the v1 frontend on 3000.
export default defineConfig({
  plugins: [react()],
  server: { port: 3001 },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use 127.0.0.1 so the proxy always hits IPv4 (avoids localhost → ::1 mismatches on Windows).
const API_TARGET = process.env.VITE_DEV_API_TARGET ?? 'http://127.0.0.1:5000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
  // `vite preview` does not use server.proxy unless duplicated here — without it, /api hits the static server and fails.
  preview: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
})

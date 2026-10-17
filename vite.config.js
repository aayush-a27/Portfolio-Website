import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js (~640 kB) is split into its own lazily loaded chunk, fetched
    // only when the hero model or the 3D viewer mounts.
    chunkSizeWarningLimit: 700,
  },
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // The charting library makes the bundle larger than the default warning
        // limit (500 kB). This is fine for a demo dashboard.
        chunkSizeWarningLimit: 900,
    },
})
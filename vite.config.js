import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` must match the GitHub Pages project path (https://<user>.github.io/ez/)
// so built asset URLs resolve correctly.
export default defineConfig({
  base: '/ez/',
  plugins: [react()],
})

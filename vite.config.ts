import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages serves this repo from https://<user>.github.io/SportIT/, so
// production asset URLs need that subpath; the dev server stays at "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/SportIT/' : '/',
  plugins: [react(), tailwindcss()],
}))

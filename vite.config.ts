/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { swPlugin } from './pwa/swPlugin.ts'

// base relativa: funciona en GitHub Pages (/<repo>/) sin conocer el nombre.
export default defineConfig({
  base: './',
  plugins: [react(), swPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})

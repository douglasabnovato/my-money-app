/* Build com Vite (substitui o react-scripts 1.x, sem suporte) e testes com Vitest */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173 },
  test: { environment: 'jsdom' },
})
/* Fim de vite.config.js */

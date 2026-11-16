/* Teste de ponta a ponta no navegador: sobe a API em memória e o front do Vite, em portas próprias */
import { defineConfig, devices } from '@playwright/test'

const API_PORT = 3093
const WEB_PORT = 5193

export default defineConfig({
  testDir: 'e2e',
  testMatch: /.*\.e2e\.js$/,
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${WEB_PORT}`, trace: 'retain-on-failure', reducedMotion: 'reduce' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } }],
  webServer: [
    {
      command: 'node ../backend/src/server.js',
      url: `http://localhost:${API_PORT}/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        PORT: String(API_PORT),
        MONGODB_URI: 'memory',
        AUTH_SECRET: 'segredo-so-para-o-teste-e2e-local-0123456789',
        CORS_ORIGINS: `http://localhost:${WEB_PORT}`,
      },
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: { VITE_API_BASE: `http://localhost:${API_PORT}` },
    },
  ],
})
/* Fim de playwright.config.js */

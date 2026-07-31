import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const clientDir = fileURLToPath(new URL('.', import.meta.url))
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173'
const startClient = process.env.E2E_SKIP_WEB_SERVER !== 'true'

export default defineConfig({
  testDir: fileURLToPath(new URL('./e2e', import.meta.url)),
  globalSetup: fileURLToPath(new URL('./e2e/global-setup.ts', import.meta.url)),
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  webServer: startClient
    ? {
        command: 'pnpm dev --host 127.0.0.1',
        cwd: clientDir,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(process.env.E2E_ALL_BROWSERS === 'true'
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ]
      : []),
  ],
})

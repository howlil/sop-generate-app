import { execFileSync } from 'node:child_process'
import { request, type FullConfig } from '@playwright/test'

import { apiHealthURL } from './support/api'

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const api = await request.newContext()
  try {
    const response = await api.get(apiHealthURL).catch(() => null)
    if (response === null || response.status() >= 500) {
      throw new Error(
        `Backend E2E tidak tersedia di ${apiHealthURL}. Jalankan server test sebelum Playwright.`,
      )
    }
  } finally {
    await api.dispose()
  }

  if (process.env.E2E_SEED !== 'true') return

  execFileSync('pnpm', ['--dir', '../server', 'db:seed:e2e'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? 'test',
    },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

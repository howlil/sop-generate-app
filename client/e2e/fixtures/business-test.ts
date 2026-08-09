import {
  expect,
  test as base,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from '@playwright/test'

import { createAuthenticatedApiContext, apiBaseURL } from '../support/api'
import type { E2eUser } from './users'

const browserApiBaseURL =
  process.env.E2E_BROWSER_API_BASE_URL ?? apiBaseURL.replace('127.0.0.1', 'localhost')

export interface RoleSession {
  user: E2eUser
  context: BrowserContext
  page: Page
  /** Context API terpisah khusus pre/post-condition audit. */
  api: APIRequestContext
  runtimeErrors: string[]
}

export type RoleSessionFactory = (user: E2eUser) => Promise<RoleSession>

interface BusinessTestFixtures {
  roleSession: RoleSessionFactory
}

/**
 * Fixture khusus business-journey.
 *
 * Login dilakukan melalui API sebagai precondition autentikasi, bukan sebagai aksi bisnis
 * yang sedang diuji. Setiap role memperoleh BrowserContext sendiri supaya perpindahan aktor
 * tidak dilakukan dengan clearCookies/re-login pada context yang sama.
 */
export const test = base.extend<BusinessTestFixtures>({
  roleSession: async ({ browser }, use, testInfo) => {
    const sessions: RoleSession[] = []

    await use(async (user) => {
      const context = await browser.newContext()
      const login = await context.request.post(`${browserApiBaseURL}/auth/login`, {
        data: {
          email: user.email,
          password: user.password,
        },
      })
      await expect(login, `precondition login browser untuk ${user.role}`).toBeOK()

      const me = await context.request.get(`${browserApiBaseURL}/auth/me`)
      await expect(me, `browser session untuk ${user.role}`).toBeOK()

      const page = await context.newPage()
      const runtimeErrors: string[] = []
      page.on('pageerror', (error) => runtimeErrors.push(error.message))

      const api = await createAuthenticatedApiContext(user)
      const session: RoleSession = { user, context, page, api, runtimeErrors }
      sessions.push(session)
      return session
    })

    const runtimeErrors = sessions.flatMap((session) =>
      session.runtimeErrors.map((message) => `${session.user.role}: ${message}`),
    )

    await Promise.allSettled(
      sessions.flatMap((session) => [session.api.dispose(), session.context.close()]),
    )

    // Jangan menutupi error utama test dengan assertion teardown kedua.
    if (testInfo.status === testInfo.expectedStatus) {
      expect(runtimeErrors, 'business journey tidak boleh menghasilkan pageerror').toEqual([])
    }
  },
})

export { expect }

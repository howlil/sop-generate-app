import {
  expect,
  request as playwrightRequest,
  test as base,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from '@playwright/test'

import { createAuthenticatedApiContext, apiBaseURL } from '../support/api'
import type { E2eUser, RoleKey } from './users'

const browserApiBaseURL =
  process.env.E2E_BROWSER_API_BASE_URL ?? apiBaseURL.replace('127.0.0.1', 'localhost')

type BrowserStorageState = Awaited<ReturnType<APIRequestContext['storageState']>>

export interface RoleSession {
  user: E2eUser
  context: BrowserContext
  page: Page
  /** Shared worker API context khusus setup/post-condition audit. */
  api: APIRequestContext
  runtimeErrors: string[]
}

export type RoleSessionFactory = (user: E2eUser) => Promise<RoleSession>
export type RoleApiFactory = (user: E2eUser) => Promise<APIRequestContext>
type RoleStorageStateFactory = (user: E2eUser) => Promise<BrowserStorageState>

interface BusinessTestFixtures {
  roleSession: RoleSessionFactory
}

interface BusinessWorkerFixtures {
  roleApi: RoleApiFactory
  roleStorageState: RoleStorageStateFactory
}

/**
 * Fixture khusus business-journey.
 *
 * Auth state dibuat sekali per role per worker, lalu dipakai ulang untuk BrowserContext baru.
 * Ini menjaga isolasi antaraktor tanpa menembakkan login berulang sampai terkena rate limit.
 */
export const test = base.extend<BusinessTestFixtures, BusinessWorkerFixtures>({
  roleApi: [
    async ({}, use) => {
      const contexts = new Map<RoleKey, APIRequestContext>()

      await use(async (user) => {
        const existing = contexts.get(user.role)
        if (existing) return existing

        const context = await createAuthenticatedApiContext(user)
        contexts.set(user.role, context)
        return context
      })

      await Promise.allSettled([...contexts.values()].map((context) => context.dispose()))
    },
    { scope: 'worker' },
  ],

  roleStorageState: [
    async ({}, use) => {
      const states = new Map<RoleKey, BrowserStorageState>()

      await use(async (user) => {
        const existing = states.get(user.role)
        if (existing) return existing

        const authContext = await playwrightRequest.newContext({ baseURL: browserApiBaseURL })
        try {
          const login = await authContext.post(`${browserApiBaseURL}/auth/login`, {
            data: {
              email: user.email,
              password: user.password,
            },
          })
          if (!login.ok()) {
            const body = await login.text().catch(() => '')
            throw new Error(
              `Precondition browser auth ${user.role} gagal (${login.status()}): ${body}`,
            )
          }
          const state = await authContext.storageState()
          states.set(user.role, state)
          return state
        } finally {
          await authContext.dispose()
        }
      })
    },
    { scope: 'worker' },
  ],

  roleSession: async ({ browser, roleApi, roleStorageState }, use, testInfo) => {
    const sessions: RoleSession[] = []

    await use(async (user) => {
      const context = await browser.newContext({ storageState: await roleStorageState(user) })
      const page = await context.newPage()
      const runtimeErrors: string[] = []
      page.on('pageerror', (error) => runtimeErrors.push(error.message))

      const session: RoleSession = {
        user,
        context,
        page,
        api: await roleApi(user),
        runtimeErrors,
      }
      sessions.push(session)
      return session
    })

    const runtimeErrors = sessions.flatMap((session) =>
      session.runtimeErrors.map((message) => `${session.user.role}: ${message}`),
    )

    await Promise.allSettled(sessions.map((session) => session.context.close()))

    // Jangan menutupi error utama test dengan assertion teardown kedua.
    if (testInfo.status === testInfo.expectedStatus) {
      expect(runtimeErrors, 'business journey tidak boleh menghasilkan pageerror').toEqual([])
    }
  },
})

export { expect }

import { expect, test } from '@playwright/test'
import { allProtectedRoutes, allUsers, navByRole, protectedRouteMatrix } from './fixtures/users'
import { expectBackendAvailable } from './support/api'
import { expectRouteLoads, expectVisibleNavigation, loginViaUi } from './support/app'

const navLabelByRoute: Record<string, string> = {
  '/pj-evaluator/grafik-evaluasi': 'Grafik Evaluasi',
  '/pj-evaluator/opd': 'OPD',
  '/pj-evaluator/penyusun': 'Penyusun',
  '/pj-evaluator/evaluator': 'Evaluator',
  '/pj-evaluator/evaluasi': 'Evaluasi SOP',
  '/evaluator/evaluasi': 'Evaluasi SOP',
  '/kepala-opd/sop': 'Pantau SOP',
  '/kepala-opd/pengajuan': 'Pengajuan SOP',
  '/penyusun/sop': 'SOP',
  '/penyusun/pelaksana': 'Pelaksana SOP',
  '/penyusun/peraturan': 'Peraturan',
  '/penyusun/pj-penyusun/berita-acara': 'Berita Acara',
}

test.describe('Functional browser — otorisasi navigasi per role', () => {
  test.beforeEach(async ({ request }) => {
    await expectBackendAvailable(request)
  })

  for (const user of allUsers) {
    test(`menu utama sesuai kewenangan ${user.role}`, async ({ page }) => {
      await loginViaUi(page, user)
      await expectVisibleNavigation(page, navByRole[user.role])

      const allowed = new Set(navByRole[user.role])
      const allLabels = Object.values(navByRole).flat()
      for (const label of allLabels) {
        if (allowed.has(label)) continue
        await expect(page.getByRole('link', { name: label, exact: true })).toHaveCount(0)
      }
    })

    test(`route yang diizinkan untuk ${user.role} dapat dibuka`, async ({ page }) => {
      await loginViaUi(page, user)
      for (const route of protectedRouteMatrix[user.role]) {
        await test.step(`buka ${route}`, async () => {
          await expectRouteLoads(page, route)
        })
      }
    })

    test(`navigasi role lain tidak tersedia untuk ${user.role}`, async ({ page }) => {
      await loginViaUi(page, user)
      const forbiddenRoutes = allProtectedRoutes.filter(
        (route) => !protectedRouteMatrix[user.role].includes(route),
      )

      for (const route of forbiddenRoutes.slice(0, 3)) {
        await test.step(`tidak ada link ${route}`, async () => {
          const forbiddenLabel = navLabelByRoute[route]
          expect(forbiddenLabel).toBeTruthy()
          await expect(page.getByRole('link', { name: forbiddenLabel, exact: true })).toHaveCount(0)
        })
      }
    })
  }
})

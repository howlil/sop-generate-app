import { expect, test } from '@playwright/test'
import { allUsers, users } from './fixtures/users'
import { expectBackendAvailable } from './support/api'
import { expectMainContent, loginViaUi, logoutViaUi, waitForAppReady } from './support/app'

test.describe('Functional browser — autentikasi dan sesi pengguna', () => {
  test.beforeEach(async ({ request }) => {
    await expectBackendAvailable(request)
  })

  for (const user of allUsers) {
    test(`login berhasil dan redirect landing role ${user.role}`, async ({ page }) => {
      await loginViaUi(page, user)
      await expect(page.getByRole('button', { name: /profil/i })).toBeVisible()
      await expect(page.locator('body')).toContainText(user.roleLabel)
    })
  }

  test('login gagal menampilkan validasi kredensial', async ({ page }) => {
    await page.goto('/login')
    await waitForAppReady(page)
    const emailInput = page.getByLabel('Email')
    await emailInput.fill('bukan-email')
    await page
      .locator('input#password, input[name="password"], input[type="password"]')
      .first()
      .fill('pendek')
    await page.getByRole('button', { name: /^masuk$/i }).click()

    await expect(emailInput).toHaveJSProperty('validity.valid', false)
    await expect(page).toHaveURL(/\/login/)
  })

  test('login gagal untuk password salah', async ({ page }) => {
    await page.goto('/login')
    await waitForAppReady(page)
    await page.getByLabel('Email').fill(users.penyusun.email)
    await page
      .locator('input#password, input[name="password"], input[type="password"]')
      .first()
      .fill('PasswordSalah123')
    await page.getByRole('button', { name: /^masuk$/i }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText(/login gagal|tidak valid|email atau kata sandi/i)).toBeVisible()
  })

  test('akses route terlindungi tanpa login diarahkan ke login', async ({ page }) => {
    await page.goto('/penyusun/sop')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByLabel('Email')).toBeVisible()
  })

  test('logout menghapus sesi dan route terlindungi kembali meminta login', async ({ page }) => {
    await loginViaUi(page, users.penyusun)
    await logoutViaUi(page)
    await expectMainContent(page)

    await page.goto('/penyusun/sop')
    await expect(page).toHaveURL(/\/login/)
  })
})

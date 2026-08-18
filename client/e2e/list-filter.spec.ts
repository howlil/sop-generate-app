import { expect, test } from '@playwright/test'

import { users } from './fixtures/users'
import { createAuthenticatedApiContext, expectBackendAvailable } from './support/api'
import { expectMainContent, loginViaUi } from './support/app'
import { createDraftSopFixture, createReadySopFixture } from './support/e2e-flow'

test.describe('Functional pencarian dan filter daftar SOP', () => {
  test.beforeEach(async ({ request }) => {
    await expectBackendAvailable(request)
  })

  test('E2E-68: unified data surface menjaga pencarian saat filter status diubah dan dihapus', async ({ page }) => {
    const penyusun = await createAuthenticatedApiContext(users.penyusun)
    try {
      const draft = await createDraftSopFixture(penyusun, 'LIST-DRAFT')
      const ready = await createReadySopFixture(penyusun, 'LIST-READY')

      await loginViaUi(page, users.penyusun)
      await page.goto('/penyusun/sop')
      await expectMainContent(page)

      const searchInput = page.getByRole('textbox', {
        name: 'Cari judul atau nomor SOP...',
      })
      await searchInput.fill(draft.title)
      await expect(page.getByText(draft.title).first()).toBeVisible({ timeout: 15_000 })
      await expect(page.getByText(ready.title)).toHaveCount(0)

      await page.getByRole('button', { name: /^Filter/ }).click()
      await page.getByRole('combobox', { name: 'Status' }).selectOption('DRAFT')

      await expect(page.getByText('Status: Draft')).toBeVisible()
      await expect(searchInput).toHaveValue(draft.title)

      await page.getByRole('button', { name: 'Hapus filter Status: Draft' }).click()

      await expect(page.getByText('Status: Draft')).toHaveCount(0)
      await expect(searchInput).toHaveValue(draft.title)
      await expect(page.getByText(draft.title).first()).toBeVisible()
    } finally {
      await penyusun.dispose()
    }
  })
})

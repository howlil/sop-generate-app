import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/hooks/useAppRole', () => ({
  useAppRole: () => ({
    role: 'PJ_PENYUSUN',
    getRoleLabel: () => 'PJ Penyusun',
    getRoleNip: () => '',
    getRoleDisplayName: () => 'Pengguna Uji',
  }),
}))

vi.mock('@/api/auth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

import { HeaderBar } from '@/components/layout/HeaderBar'
import {
  PageHeaderProvider,
  SetPageHeader,
} from '@/components/layout/PageHeaderProvider'

describe('HeaderBar', () => {
  it('menampilkan breadcrumb sebagai identitas visual dan menjaga judul hanya untuk pembaca layar', async () => {
    render(
      <PageHeaderProvider>
        <HeaderBar />
        <SetPageHeader
          breadcrumb={[{ label: 'Penyusun' }, { label: 'Manajemen SOP' }]}
          title="Manajemen SOP"
          description="Deskripsi yang tidak boleh terlihat di header."
          actions={<button type="button">Buat SOP</button>}
        />
      </PageHeaderProvider>,
    )

    expect(await screen.findByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByText('Penyusun')).toBeInTheDocument()
    expect(screen.getByText('Manajemen SOP')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: 'Manajemen SOP' })).toHaveClass('sr-only')
    expect(screen.queryByText('Deskripsi yang tidak boleh terlihat di header.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Buat SOP' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Profil' })).not.toBeInTheDocument()
  })

  it('tidak membuat breadcrumb kosong dan tetap menyediakan judul semantik', async () => {
    render(
      <PageHeaderProvider>
        <HeaderBar />
        <SetPageHeader breadcrumb={[]} title="Ringkasan" />
      </PageHeaderProvider>,
    )

    const heading = await screen.findByRole('heading', { name: 'Ringkasan' })
    expect(heading).toHaveClass('sr-only')
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument()
  })
})

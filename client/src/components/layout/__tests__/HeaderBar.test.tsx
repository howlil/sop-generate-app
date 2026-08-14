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
  type SetPageHeaderProps,
} from '@/components/layout/PageHeaderProvider'

describe('HeaderBar', () => {
  it('menampilkan breadcrumb, judul, dan deskripsi halaman dalam hierarki yang sama', async () => {
    const headerProps = {
      breadcrumb: [{ label: 'PJ Penyusun' }, { label: 'Berita Acara' }],
      title: 'Berita Acara Evaluasi',
      description: 'Kelola berita acara hasil evaluasi SOP.',
    } as SetPageHeaderProps & { description: string }

    render(
      <PageHeaderProvider>
        <HeaderBar />
        <SetPageHeader {...headerProps} />
      </PageHeaderProvider>,
    )

    expect(await screen.findByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByText('PJ Penyusun')).toBeInTheDocument()
    expect(screen.getByText('Berita Acara')).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('heading', { name: 'Berita Acara Evaluasi' }),
    ).toHaveClass('text-ui-title')
    expect(screen.getByText('Kelola berita acara hasil evaluasi SOP.')).toHaveClass(
      'text-muted-foreground',
    )
  })

  it('tidak membuat breadcrumb kosong ketika breadcrumb tidak diberikan', async () => {
    render(
      <PageHeaderProvider>
        <HeaderBar />
        <SetPageHeader breadcrumb={[]} title="Ringkasan" />
      </PageHeaderProvider>,
    )

    expect(await screen.findByRole('heading', { name: 'Ringkasan' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument()
  })
})

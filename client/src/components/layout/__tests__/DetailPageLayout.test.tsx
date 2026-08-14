import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { PageHeaderProvider } from '@/components/layout/PageHeaderProvider'

describe('DetailPageLayout', () => {
  it('menaruh tombol kembali dan page action di konten lokal, bukan metadata header global', () => {
    render(
      <PageHeaderProvider>
        <DetailPageLayout
          breadcrumb={[{ label: 'SOP' }, { label: 'Detail' }]}
          title="Detail SOP"
          backTo="/sop"
          backSize="icon"
          actions={<button type="button">Aksi Dokumen</button>}
          main={<div>Dokumen</div>}
        />
      </PageHeaderProvider>,
    )

    expect(screen.getByTitle('Kembali')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aksi Dokumen' })).toBeInTheDocument()
    expect(screen.getByText('Dokumen')).toBeInTheDocument()
  })
})

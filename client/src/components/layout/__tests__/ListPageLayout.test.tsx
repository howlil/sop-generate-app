import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import {
  PageHeaderProvider,
  usePageHeaderContext,
} from '@/components/layout/PageHeaderProvider'

function HeaderProbe() {
  const context = usePageHeaderContext()
  return (
    <div>
      <span data-testid="header-description">
        {context?.headerContent?.description ?? ''}
      </span>
      <div data-testid="header-actions">{context?.headerContent?.actions}</div>
    </div>
  )
}

describe('ListPageLayout', () => {
  it('meneruskan metadata halaman sambil mempertahankan toolbar di konten halaman', async () => {
    render(
      <PageHeaderProvider>
        <HeaderProbe />
        <ListPageLayout
          breadcrumb={[{ label: 'SOP' }]}
          title="Manajemen SOP"
          description="Daftar SOP yang Anda kelola."
          actions={<button type="button">Buat SOP</button>}
          toolbar={<div data-testid="search-toolbar">Cari SOP</div>}
        >
          <div>Daftar</div>
        </ListPageLayout>
      </PageHeaderProvider>,
    )

    expect(await screen.findByText('Daftar SOP yang Anda kelola.')).toBeInTheDocument()
    expect(screen.getByTestId('header-actions')).toHaveTextContent('Buat SOP')
    expect(screen.getByTestId('search-toolbar')).toBeInTheDocument()
    expect(screen.getByText('Daftar')).toBeInTheDocument()
  })
})

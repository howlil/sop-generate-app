import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SOPListCard } from '../sop-list-card'

describe('SOPListCard', () => {
  it('uses a flat quiet compact selected state for workbench SOP rows', () => {
    const onSelect = vi.fn()

    render(
      <SOPListCard
        variant="compact"
        selectedId="sop-1"
        onSelect={onSelect}
        items={[
          {
            id: 'sop-1',
            nama: 'sop lama',
            nomor: '123456',
            statusDokumen: 'BERLAKU',
            statusDokumenLabel: 'Berlaku',
            hasilEvaluasi: 'SESUAI',
            hasilEvaluasiLabel: 'Sesuai',
          },
        ]}
      />,
    )

    const selectedRow = screen.getByRole('button', { name: /sop lama/i })

    expect(selectedRow).toHaveAttribute('aria-pressed', 'true')
    expect(selectedRow).toHaveClass('rounded-none')
    expect(selectedRow).toHaveClass('bg-surface-subtle')
    expect(selectedRow).not.toHaveClass('rounded-md')
    expect(selectedRow).not.toHaveClass('bg-primary-subtle')
    expect(selectedRow).not.toHaveClass('border-primary')
    expect(screen.queryByText('Dokumen')).not.toBeInTheDocument()
    expect(screen.queryByText('Penilaian')).not.toBeInTheDocument()
    expect(screen.getByText('Berlaku')).toHaveClass('rounded-sm')
    expect(screen.getByText('Sesuai')).toHaveClass('rounded-sm')
    expect(screen.getByText('Berlaku')).toHaveClass('text-success-foreground')
    expect(screen.getByText('Sesuai')).toHaveClass('text-success-foreground')
  })

  it('does not render pending process states as final green chips', () => {
    render(
      <SOPListCard
        selectedId="sop-1"
        items={[
          {
            id: 'sop-1',
            nama: 'sop barang',
            nomor: '1234',
            statusDokumen: 'DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI',
            statusDokumenLabel: 'Menunggu TTD PJ Evaluator',
          },
        ]}
      />,
    )

    const status = screen.getByText('Menunggu TTD PJ Evaluator')
    expect(status).toHaveClass('text-warning-foreground')
    expect(status).not.toHaveClass('text-success-foreground')
  })
})

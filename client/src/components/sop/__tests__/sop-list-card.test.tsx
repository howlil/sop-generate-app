import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SOPListCard } from '../sop-list-card'

describe('SOPListCard', () => {
  it('uses a quiet compact selected state for side-panel SOP cards', () => {
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

    const selectedCard = screen.getByRole('button', { name: /sop lama/i })

    expect(selectedCard).toHaveAttribute('aria-pressed', 'true')
    expect(selectedCard).toHaveClass('bg-surface')
    expect(selectedCard).not.toHaveClass('bg-primary-subtle')
    expect(selectedCard).not.toHaveClass('border-primary')
    expect(screen.getByText('Berlaku')).toHaveClass('bg-surface-muted')
    expect(screen.getByText('Sesuai')).toHaveClass('border-success-subtle')
  })
})

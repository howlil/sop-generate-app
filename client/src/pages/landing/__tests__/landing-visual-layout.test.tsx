import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { IdentityHero } from '../identity-hero'
import { LandingProductPreview } from '../landing-product-preview'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))

const stages = [
  { step: '01', title: 'Penyusunan' },
  { step: '02', title: 'Pengajuan' },
  { step: '03', title: 'Evaluasi' },
  { step: '04', title: 'Perbaikan' },
  { step: '05', title: 'Berita Acara' },
  { step: '06', title: 'Pengesahan' },
  { step: '07', title: 'Arsip' },
]

describe('landing visual layout', () => {
  it('centers the hero copy instead of using a left-right split layout', () => {
    render(
      <IdentityHero
        governmentName="Pemerintah Provinsi Sumatera Barat"
        officeName="Biro Organisasi"
        stages={stages}
      />,
    )

    expect(screen.getByTestId('landing-hero-copy')).toHaveClass('text-center')
  })

  it('keeps the hero product preview focused on the dashboard without companion cards below it', () => {
    render(<LandingProductPreview />)

    expect(screen.queryByText('Arsip dan validasi dokumen')).not.toBeInTheDocument()
    expect(screen.queryByText('Identitas institusi')).not.toBeInTheDocument()
  })
})

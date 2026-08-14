import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ManajemenOPD } from '../ManajemenOPD'

vi.mock('@/hooks/useToast', () => ({ useToast: () => ({ showToast: vi.fn() }) }))
vi.mock('@/hooks/use-debounced-value', () => ({ useDebouncedValue: (value: string) => value }))
vi.mock('@/api/opd', () => ({
  useOpd: () => ({ list: [{ id: 'opd-1', nama: 'Dinas Kesehatan Provinsi' }], create: vi.fn(), update: vi.fn(), delete: vi.fn() }),
}))
vi.mock('@/api/kepala-opd', () => ({
  useKepalaOpdList: () => ({ data: [], isLoading: false }),
  useCreateKepalaOpd: () => ({ mutateAsync: vi.fn() }),
  useUpdateKepalaOpd: () => ({ mutateAsync: vi.fn() }),
  useDeleteKepalaOpd: () => ({ mutateAsync: vi.fn() }),
}))
vi.mock('@tanstack/react-router', () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }))

describe('ManajemenOPD', () => {
  it('uses the shared tab treatment and keeps the active create action in the toolbar action slot', () => {
    render(<ManajemenOPD />)

    expect(screen.getByText('Kelola OPD dan akun Kepala OPD.')).toBeInTheDocument()

    const opdTab = screen.getByRole('tab', { name: 'OPD' })
    expect(opdTab).toBeInTheDocument()
    expect(opdTab.className).not.toContain('border-b-2')
    expect(screen.getByRole('tab', { name: 'Kepala OPD' })).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: 'Cari nama OPD...' })).toBeInTheDocument()
    const createButton = screen.getByRole('button', { name: 'Tambah OPD' })
    expect(createButton).toBeInTheDocument()
    expect(createButton.parentElement?.className).toContain('sm:ml-auto')
  })
})

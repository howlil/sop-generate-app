import { ChevronRight } from 'lucide-react'
import { Table } from '@/components/ui/data-table'
import { formatDateIdLong } from '@/utils/format-date'
import { cn } from '@/utils/cn'
import type { PublicSopItem } from '@/types/dto/sop-public.dto'

export interface ArsipSopTableProps {
  items: PublicSopItem[]
  showOpdColumn?: boolean
  selectedDetailSopId?: string
  onSelectSop: (sop: PublicSopItem) => void
}

export function ArsipSopTable({
  items,
  showOpdColumn = false,
  selectedDetailSopId,
  onSelectSop,
}: ArsipSopTableProps) {
  return (
    <>
      <p className="mb-3 text-sm text-slate-500 sm:hidden">Ketuk dokumen untuk membaca di tengah layar.</p>
      <p className="mb-3 hidden text-sm text-slate-500 sm:block">
        Klik baris di daftar kanan untuk melihat dokumen di panel tengah.
      </p>
      <div className="hidden sm:block">
        <Table.Card>
          <Table.Root>
            <Table.Table className="text-sm">
              <thead>
                <Table.HeadRow>
                  <Table.Th className="min-w-[12rem]">Judul SOP</Table.Th>
                  {showOpdColumn ? <Table.Th className="min-w-[8rem]">OPD</Table.Th> : null}
                  <Table.Th className="whitespace-nowrap">Nomor</Table.Th>
                  <Table.Th className="whitespace-nowrap">Versi</Table.Th>
                  <Table.Th className="whitespace-nowrap">Berlaku sejak</Table.Th>
                  <Table.Th align="center" className="w-16">
                    <span className="sr-only">Lihat</span>
                  </Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {items.map((sop) => {
                  const isSelected = sop.detailSopId === selectedDetailSopId
                  return (
                    <Table.BodyRow
                      key={sop.detailSopId}
                      className={cn(
                        'cursor-pointer',
                        isSelected && 'bg-blue-50 ring-1 ring-inset ring-blue-200',
                      )}
                      onClick={() => onSelectSop(sop)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelectSop(sop)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                    >
                      <Table.Td className="font-medium text-slate-900">{sop.judul}</Table.Td>
                      {showOpdColumn ? (
                        <Table.Td className="text-slate-600">{sop.opdNama}</Table.Td>
                      ) : null}
                      <Table.Td className="text-slate-600">{sop.nomorSOP}</Table.Td>
                      <Table.Td className="text-slate-600">{sop.versi}</Table.Td>
                      <Table.Td className="text-slate-600">
                        {sop.tanggalEfektif ? formatDateIdLong(sop.tanggalEfektif) : '—'}
                      </Table.Td>
                      <Table.Td className="text-center">
                        <ChevronRight
                          className={cn('mx-auto h-4 w-4', isSelected ? 'text-blue-700' : 'text-slate-400')}
                          aria-hidden
                        />
                      </Table.Td>
                    </Table.BodyRow>
                  )
                })}
              </tbody>
            </Table.Table>
          </Table.Root>
        </Table.Card>
      </div>
      <ul className="space-y-3 sm:hidden" aria-label="Daftar SOP">
        {items.map((sop) => {
          const isSelected = sop.detailSopId === selectedDetailSopId
          return (
            <li key={sop.detailSopId}>
              <button
                type="button"
                onClick={() => onSelectSop(sop)}
                className={cn(
                  'flex min-h-11 w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left shadow-sm transition',
                  isSelected
                    ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-blue-100',
                )}
              >
                <p className="font-medium text-slate-900">{sop.judul}</p>
                {showOpdColumn ? <p className="text-sm text-slate-600">{sop.opdNama}</p> : null}
                <p className="text-sm text-slate-500">
                  {sop.nomorSOP} · Versi {sop.versi}
                  {sop.tanggalEfektif ? ` · ${formatDateIdLong(sop.tanggalEfektif)}` : null}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

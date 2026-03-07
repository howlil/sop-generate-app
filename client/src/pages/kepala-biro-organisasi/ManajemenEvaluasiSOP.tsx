import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Eye } from 'lucide-react'
import type { Penugasan, SOPItem } from '@/lib/types/penugasan'
import { usePenugasanList } from '@/hooks/usePenugasan'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useFilteredList } from '@/hooks/useFilteredList'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ROUTES } from '@/lib/constants/routes'

/** Tanggal terakhir untuk urutan (terbaru dulu). */
function getSortDate(p: Penugasan): string {
  return p.tanggalVerifikasi ?? p.tanggalEvaluasi ?? p.tanggalRequest ?? ''
}

/** Dianggap "baru" jika tanggal masuk 7 hari terakhir. */
const HARI_BARU = 7
function isPenugasanBaru(p: Penugasan): boolean {
  const dateStr = getSortDate(p)
  if (!dateStr) return false
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= HARI_BARU
}

export function ManajemenEvaluasiSOP() {
  const navigate = useNavigate()
  const { list: penugasanList } = usePenugasanList()
  const { filteredList, searchQuery, setSearchQuery } = useFilteredList(penugasanList, {
    searchKeys: [
      (item) =>
        `${item.opd} ${item.jenis} ${(item.sopList ?? []).map((s: SOPItem) => s.nama).join(' ')}`,
    ],
  })

  /** Urutkan terbaru dulu (tanggal terakhir desc). */
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      const da = getSortDate(a)
      const db = getSortDate(b)
      if (db === da) return 0
      return db > da ? 1 : -1
    })
  }, [filteredList])

  const jumlahBaru = useMemo(() => sortedList.filter(isPenugasanBaru).length, [sortedList])

  const goToDetail = (item: Penugasan) => {
    navigate({ to: ROUTES.BIRO_ORGANISASI.DETAIL_EVALUASI, params: { id: item.id } })
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen Evaluasi SOP' }]}
      title="Manajemen Evaluasi SOP"
      description="Kelola batch evaluasi per OPD untuk verifikasi Berita Acara (1 BA = 1 evaluasi OPD). Tim Evaluasi evaluasi langsung dari Daftar SOP Evaluasi."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari OPD atau SOP..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />
      }
    >
      <Table.Card>
        <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-xs font-semibold text-gray-900">Daftar Evaluasi SOP</h2>
          {jumlahBaru > 0 && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 border-0 text-xs font-medium"
              title="Penugasan dengan tanggal masuk 7 hari terakhir"
            >
              {jumlahBaru} baru
            </Badge>
          )}
        </div>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Nama OPD</Table.Th>
              <Table.Th align="center">Jumlah SOP</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {sortedList.length === 0 ? (
              <tr>
                <Table.Td colSpan={3} className="p-8 text-center text-gray-500">
                  Tidak ada batch evaluasi.
                </Table.Td>
              </tr>
            ) : (
              sortedList.map((item) => (
                <Table.BodyRow key={item.id}>
                  <Table.Td className="font-medium text-gray-900">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{item.opd}</span>
                      {isPenugasanBaru(item) && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 border-0 text-[10px] font-medium shrink-0"
                          title="Data masuk 7 hari terakhir"
                        >
                          Baru
                        </Badge>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td className="text-center text-gray-700">{item.sopList?.length ?? 0}</Table.Td>
                  <Table.Td>
                    <div className="flex items-center justify-center gap-1">
                      <IconActionButton icon={Eye} title="Detail" onClick={() => goToDetail(item)} />
                    </div>
                  </Table.Td>
                </Table.BodyRow>
              ))
            )}
          </tbody>
        </Table.Table>
      </Table.Card>
    </ListPageLayout>
  )
}

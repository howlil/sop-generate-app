import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Eye } from 'lucide-react'
import type { Penugasan } from '@/lib/types/penugasan'
import { usePenugasanList } from '@/hooks/usePenugasan'
import { useOpdList } from '@/lib/data/opd'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useFilteredList } from '@/hooks/useFilteredList'
import { usePagination } from '@/hooks/usePagination'
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

export interface RowOpdEvaluasi {
  opdId: string
  opdNama: string
  opdKode: string
  penugasanTerbaru: Penugasan | null
  jumlahSop: number
  isBaru: boolean
}

/** Satu baris per OPD: gabung semua OPD (dari Manajemen OPD) dengan penugasan evaluasi (jika ada). Match penugasan by nama OPD. */
function buildRowsOpdEvaluasi(
  allOpds: { id: string; name: string }[],
  penugasanList: Penugasan[]
): RowOpdEvaluasi[] {
  return allOpds.map((opd) => {
    const penugasansForOpd = penugasanList.filter((p) => p.opd === opd.name)
    const penugasanTerbaru =
      penugasansForOpd.length === 0
        ? null
        : penugasansForOpd.sort((a, b) => (getSortDate(b) > getSortDate(a) ? 1 : -1))[0]
    const jumlahSop = penugasanTerbaru?.sopList?.length ?? 0
    const isBaru = penugasanTerbaru != null && isPenugasanBaru(penugasanTerbaru)
    return {
      opdId: opd.id,
      opdNama: opd.name,
      opdKode: opd.id,
      penugasanTerbaru,
      jumlahSop,
      isBaru,
    }
  })
}

export function ManajemenEvaluasiSOP() {
  const navigate = useNavigate()
  const allOpds = useOpdList()
  const { list: penugasanList } = usePenugasanList()

  const rowsByOpd = useMemo(
    () => buildRowsOpdEvaluasi(allOpds, penugasanList),
    [allOpds, penugasanList]
  )

  const { filteredList, searchQuery, setSearchQuery } = useFilteredList(rowsByOpd, {
    searchKeys: [(row) => `${row.opdNama} ${row.opdKode}`],
  })

  /** Urutkan: (1) evaluasi baru (7 hari terakhir) paling atas, (2) OPD yang punya evaluasi urut tanggal terbaru dulu, (3) OPD tanpa evaluasi urut nama. */
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      if (a.isBaru && !b.isBaru) return -1
      if (!a.isBaru && b.isBaru) return 1
      const hasA = a.penugasanTerbaru != null
      const hasB = b.penugasanTerbaru != null
      if (hasA && !hasB) return -1
      if (!hasA && hasB) return 1
      if (hasA && hasB) {
        const da = getSortDate(a.penugasanTerbaru!)
        const db = getSortDate(b.penugasanTerbaru!)
        if (db !== da) return db > da ? 1 : -1
      }
      return a.opdNama.localeCompare(b.opdNama)
    })
  }, [filteredList])

  const jumlahBaru = useMemo(() => sortedList.filter((r) => r.isBaru).length, [sortedList])

  const pagination = usePagination(sortedList.length)
  const rowsToShow = pagination.showPagination
    ? sortedList.slice(pagination.startIndex, pagination.endIndex)
    : sortedList

  const goToDetail = (penugasan: Penugasan) => {
    navigate({ to: ROUTES.BIRO_ORGANISASI.DETAIL_EVALUASI, params: { id: penugasan.id } })
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
                  Tidak ada OPD.
                </Table.Td>
              </tr>
            ) : (
              rowsToShow.map((row) => (
                <Table.BodyRow key={row.opdId}>
                  <Table.Td className="font-medium text-gray-900">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{row.opdNama}</span>
                      {row.isBaru && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 border-0 text-[10px] font-medium shrink-0"
                          title="Penugasan dengan tanggal masuk 7 hari terakhir"
                        >
                          Baru
                        </Badge>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td className="text-center text-gray-700">{row.jumlahSop}</Table.Td>
                  <Table.Td>
                    <div className="flex items-center justify-center gap-1">
                      {row.penugasanTerbaru ? (
                        <IconActionButton
                          icon={Eye}
                          title="Detail evaluasi"
                          onClick={() => goToDetail(row.penugasanTerbaru!)}
                        />
                      ) : (
                        <span className="text-xs text-gray-500">Belum ada evaluasi</span>
                      )}
                    </div>
                  </Table.Td>
                </Table.BodyRow>
              ))
            )}
          </tbody>
        </Table.Table>
        <Table.Pagination
          totalItems={sortedList.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="evaluasi"
        />
      </Table.Card>
    </ListPageLayout>
  )
}

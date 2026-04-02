import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Eye } from 'lucide-react'
import type { PengajuanEvaluasi } from '@/features/evaluasi'
import { evaluasiApi } from '@/features/evaluasi'
import { queryKeys } from '@/utils/query-keys'
import { useOpd } from '@/features/organisasi'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useFilteredList } from '@/utils/use-filtered-list'
import { usePagination } from '@/utils/use-pagination'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ROUTES } from '@/utils/constants'
import { IA } from '@/utils/constants'
import { useDocumentTitle } from '@/utils/use-document-title'

/** Tanggal terakhir untuk urutan (terbaru dulu). */
function getSortDate(p: PengajuanEvaluasi): string {
  return p.createdAt
}

/** Dianggap "baru" jika tanggal masuk 7 hari terakhir. */
const HARI_BARU = 7
function isBatchBaru(p: PengajuanEvaluasi): boolean {
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
  batchTerbaru: PengajuanEvaluasi | null
  jumlahSop: number
  isBaru: boolean
}

/** Satu baris per OPD: gabung semua OPD dengan pengajuan evaluasi (jika ada). Match by opdId. */
function buildRowsOpdEvaluasi(
  allOpds: { id: string; nama: string }[],
  pengajuanList: PengajuanEvaluasi[]
): RowOpdEvaluasi[] {
  return allOpds.map((opd) => {
    const pengajuansForOpd = pengajuanList.filter((p) => p.opdId === opd.id)
    const batchTerbaru =
      pengajuansForOpd.length === 0
        ? null
        : pengajuansForOpd.sort((a, b) => (getSortDate(b) > getSortDate(a) ? 1 : -1))[0]
    const jumlahSop = batchTerbaru?.sopList?.length ?? 0
    const isBaru = batchTerbaru != null && isBatchBaru(batchTerbaru)
    return {
      opdId: opd.id,
      opdNama: opd.nama,
      opdKode: opd.id,
      batchTerbaru,
      jumlahSop,
      isBaru,
    }
  })
}

export function ManajemenEvaluasiSOP() {
  useDocumentTitle(`${IA.NAV_BIRO_EVALUASI_TERJADWAL} — Biro`)
  const navigate = useNavigate()
  const { list: allOpds } = useOpd()
  const { data: batchList = [] } = useQuery({
    queryKey: queryKeys.evaluasiList(),
    queryFn: () => evaluasiApi.findAll(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })

  const rowsByOpd = useMemo(
    () => buildRowsOpdEvaluasi(allOpds, batchList),
    [allOpds, batchList]
  )

  const { filteredList, searchQuery, setSearchQuery } = useFilteredList(rowsByOpd, {
    searchKeys: [(row) => `${row.opdNama} ${row.opdKode}`],
  })

  /** Urutkan: (1) evaluasi baru (7 hari terakhir) paling atas, (2) OPD yang punya evaluasi urut tanggal terbaru dulu, (3) OPD tanpa evaluasi urut nama. */
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      if (a.isBaru && !b.isBaru) return -1
      if (!a.isBaru && b.isBaru) return 1
      const hasA = a.batchTerbaru != null
      const hasB = b.batchTerbaru != null
      if (hasA && !hasB) return -1
      if (!hasA && hasB) return 1
      if (hasA && hasB) {
        const da = getSortDate(a.batchTerbaru!)
        const db = getSortDate(b.batchTerbaru!)
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

  const goToDetail = (batch: VerifikasiBatch) => {
    navigate({ to: ROUTES.BIRO_ORGANISASI.DETAIL_EVALUASI, params: { id: batch.id } })
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: IA.NAV_BIRO_BATCH_BA }]}
      title={IA.NAV_BIRO_BATCH_BA}
      description={`${IA.BATCH_EVALUASI_OPD} per OPD. Buka detail untuk ${IA.VERIFIKASI_BA_BIRO} pada dokumen ${IA.BERITA_ACARA}.`}
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
              title="Terjadwal verifikasi dengan tanggal masuk 7 hari terakhir"
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
                          title="Terjadwal verifikasi dengan tanggal masuk 7 hari terakhir"
                        >
                          Baru
                        </Badge>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td className="text-center text-gray-700">{row.jumlahSop}</Table.Td>
                  <Table.Td>
                    <div className="flex items-center justify-center gap-1">
                      {row.batchTerbaru ? (
                        <IconActionButton
                          icon={Eye}
                          title="Detail evaluasi"
                          onClick={() => goToDetail(row.batchTerbaru!)}
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

/**
 * Evaluasi SOP: daftar OPD. Satu baris = satu OPD.
 * List SOP per OPD ada di halaman detail OPD (Evaluasi per OPD).
 */
import { useMemo, useState } from 'react'
import { Building2, Eye } from 'lucide-react'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ROUTES } from '@/lib/constants/routes'
import { canSelectSOPForEvaluasi, isSopInEvaluasiList } from '@/lib/domain/sop-evaluasi'
import { useFilteredList } from '@/hooks/useFilteredList'
import { usePagination } from '@/hooks/usePagination'
import { getInitialSopDaftarList } from '@/lib/data/sop-daftar'
import { useSopStatus } from '@/hooks/useSopStatus'

export interface OpdEvaluasiItem {
  id: string
  nama: string
  kode: string
  jumlahSop: number
  jumlahLayakEvaluasi: number
}

function useOpdEvaluasiList(): OpdEvaluasiItem[] {
  const { mergeSopStatus } = useSopStatus()
  const [baseSopList] = useState(() => getInitialSopDaftarList())
  const mergedSopList = useMemo(() => mergeSopStatus(baseSopList), [baseSopList, mergeSopStatus])

  return useMemo(() => {
    /** Group SOPs by opdId, collecting unique OPD names from opdId. */
    const opdMap = new Map<string, { sops: typeof mergedSopList }>()
    for (const sop of mergedSopList) {
      const opdId = sop.opdId ?? 'unknown'
      if (!opdMap.has(opdId)) opdMap.set(opdId, { sops: [] })
      opdMap.get(opdId)!.sops.push(sop)
    }

    const result: OpdEvaluasiItem[] = []
    for (const [opdId, { sops }] of opdMap.entries()) {
      const evaluasiSops = sops.filter((s) => isSopInEvaluasiList(s.status))
      if (evaluasiSops.length === 0) continue
      const jumlahLayakEvaluasi = evaluasiSops.filter((s) => canSelectSOPForEvaluasi(s.status)).length
      // Derive OPD name from sop.unitTerkait or use opdId as fallback
      const opdNama = sops[0]?.unitTerkait ?? opdId
      result.push({
        id: opdId,
        nama: opdNama,
        kode: opdId,
        jumlahSop: evaluasiSops.length,
        jumlahLayakEvaluasi,
      })
    }
    return result.sort((a, b) => a.nama.localeCompare(b.nama))
  }, [mergedSopList])
}

export function DaftarSOPEvaluasi() {
  const opdList = useOpdEvaluasiList()
  const {
    filteredList,
    searchQuery,
    setSearchQuery,
  } = useFilteredList(opdList, {
    searchKeys: ['nama', 'kode'],
  })
  const pagination = usePagination(filteredList.length)
  const rowsToShow = pagination.showPagination
    ? filteredList.slice(pagination.startIndex, pagination.endIndex)
    : filteredList

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Evaluasi SOP' }]}
      title="Evaluasi SOP"
      description="Pilih OPD untuk melihat daftar SOP yang dapat dievaluasi. Evaluasi per OPD, list SOP ada di detail."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari nama atau kode OPD..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />
      }
    >
      <Table.Card>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Nama OPD</Table.Th>
              <Table.Th align="center">Jumlah SOP</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <EmptyState
                asTableRow
                colSpan={3}
                icon={<Building2 />}
                title="Tidak ada OPD ditemukan"
                description="Coba ubah kata kunci pencarian."
              />
            ) : (
              rowsToShow.map((opd) => (
                <Table.BodyRow key={opd.id}>
                  <Table.Td className="font-medium text-gray-900">{opd.nama}</Table.Td>
                  <Table.Td className="text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-gray-700">{opd.jumlahSop}</span>
                    {opd.jumlahLayakEvaluasi > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 border-0 text-xs font-medium shrink-0"
                        title="SOP baru / perlu evaluasi"
                      >
                        {opd.jumlahLayakEvaluasi} baru
                      </Badge>
                    )}
                  </div>
                </Table.Td>
                  <Table.Td className="text-center">
                    <IconActionButton
                      icon={Eye}
                      to={ROUTES.TIM_EVALUASI.EVALUASI_OPD}
                      params={{ opdId: opd.id }}
                      title="Lihat SOP"
                      variant="outline"
                    />
                  </Table.Td>
                </Table.BodyRow>
              ))
            )}
          </tbody>
        </Table.Table>
        <Table.Pagination
          totalItems={filteredList.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="OPD"
        />
      </Table.Card>
    </ListPageLayout>
  )
}

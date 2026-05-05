/**
 * Evaluasi SOP: daftar OPD dengan jumlah SOP dalam pipeline evaluasi (server).
 */
import { useState } from 'react'
import { Building2, Eye } from 'lucide-react'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ROUTES } from '@/utils/constants'
import { useOpdEvaluasiRingkas } from '@/api/opd'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

export function DaftarSOPEvaluasi() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebouncedValue(searchQuery, 300)
  const serverSearch =
    debouncedSearch.trim() !== '' ? debouncedSearch.trim() : undefined
  const { list: opdList, isLoading } = useOpdEvaluasiRingkas(serverSearch)

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Evaluasi SOP' }]}
      title="Evaluasi SOP"
      description="Pilih OPD untuk melihat daftar SOP yang dapat dievaluasi. Evaluasi per OPD, list SOP ada di detail."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari nama OPD..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        />
      }
    >
      <Table.Paginated data={opdList} label="OPD">
        {(pageData) => (
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>Nama OPD</Table.Th>
                <Table.Th align="center">Jumlah SOP</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {isLoading ? (
                <EmptyState
                  asTableRow
                  colSpan={3}
                  icon={<Building2 />}
                  title="Memuat data..."
                  description="Mohon tunggu."
                />
              ) : pageData.length === 0 ? (
                <EmptyState
                  asTableRow
                  colSpan={3}
                  icon={<Building2 />}
                  title="Tidak ada OPD ditemukan"
                  description="Coba ubah kata kunci pencarian atau belum ada SOP dalam tahap evaluasi."
                />
              ) : (
                pageData.map((opd) => (
                  <Table.BodyRow key={opd.id}>
                    <Table.Td className="font-medium text-gray-900">
                      {opd.nama}
                    </Table.Td>
                    <Table.Td className="text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="text-gray-700">{opd.jumlahSop}</span>
                        {opd.jumlahSopBaru > 0 && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800 border-0 text-xs font-medium shrink-0"
                            title="SOP baru / perlu evaluasi"
                          >
                            {opd.jumlahSopBaru} baru
                          </Badge>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td className="text-center">
                      <IconActionButton
                        icon={Eye}
                        to={ROUTES.EVALUATOR.DETAIL_EVALUASI_OPD}
                        params={{ id: opd.id }}
                        title="Lihat SOP"
                        variant="outline"
                      />
                    </Table.Td>
                  </Table.BodyRow>
                ))
              )}
            </tbody>
          </Table.Table>
        )}
      </Table.Paginated>
    </ListPageLayout>
  )
}

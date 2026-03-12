import { useState } from 'react'
import { Eye, Edit } from 'lucide-react'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { StatusBadge } from '@/components/ui/status-badge'
import { SOPStatusFilterSelect } from '@/components/sop/SOPStatusFilterSelect'
import type { SOPSayaItem } from '@/lib/types/sop'
import { canEditSop } from '@/lib/domain/sop-status'
import { getInitialSopSayaList } from '@/lib/data/sop-daftar'
import { useSopStatus } from '@/hooks/useSopStatus'
import { ROUTES } from '@/lib/constants/routes'
import { formatDateIdLong } from '@/utils/format-date'
import { useFilteredList } from '@/hooks/useFilteredList'
import { usePagination } from '@/hooks/usePagination'

export function SOPSaya() {
  const { mergeSopStatus } = useSopStatus()
  const [sopList] = useState<SOPSayaItem[]>(() => getInitialSopSayaList())
  const mergedList = mergeSopStatus(sopList)
  const {
    filteredList: filteredSOP,
    searchQuery,
    setSearchQuery,
    filterValue: filterStatus,
    setFilterValue: setFilterStatus,
  } = useFilteredList(mergedList, {
    searchKeys: ['judul', 'nomorSOP'],
    filterKey: 'status',
  })
  const pagination = usePagination(filteredSOP.length)
  const rowsToShow = pagination.showPagination
    ? filteredSOP.slice(pagination.startIndex, pagination.endIndex)
    : filteredSOP

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'SOP Saya' }]}
      title="SOP Saya"
      description="Daftar SOP yang Anda susun"
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari SOP..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <SOPStatusFilterSelect
            className="h-8 w-[180px]"
            value={filterStatus}
            onValueChange={setFilterStatus}
          />
        </SearchToolbar>
      }
    >
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-900">Daftar SOP Saya</h2>
        </div>
        <Table.Root>
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>Judul</Table.Th>
                <Table.Th>Nomor SOP</Table.Th>
                <Table.Th align="center">Terakhir diubah</Table.Th>
                <Table.Th align="center">Status</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {rowsToShow.map((sop) => (
                <Table.BodyRow key={sop.id}>
                  <Table.Td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{sop.judul}</span>
                      {sop.komentarCount > 0 && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs border-0">
                          {sop.komentarCount} Komentar
                        </Badge>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td className="font-mono text-gray-700 text-[11px]">{sop.nomorSOP}</Table.Td>
                  <Table.Td className="text-center text-gray-600">
                    {formatDateIdLong(sop.terakhirDiubah)}
                  </Table.Td>
                  <Table.Td className="text-center">
                    <StatusBadge status={sop.status} className="text-xs" />
                  </Table.Td>
                  <Table.Td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {canEditSop(sop.status) ? (
                        <IconActionButton
                          icon={Edit}
                          to={ROUTES.TIM_PENYUSUN.DETAIL_SOP}
                          params={{ id: sop.id }}
                          title="Edit"
                        />
                      ) : (
                        <IconActionButton
                          icon={Eye}
                          to={ROUTES.TIM_PENYUSUN.DETAIL_SOP}
                          params={{ id: sop.id }}
                          title="Lihat"
                          variant="outline"
                        />
                      )}
                    </div>
                  </Table.Td>
                </Table.BodyRow>
              ))}
            </tbody>
          </Table.Table>
        </Table.Root>
        <Table.Pagination
          totalItems={filteredSOP.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="SOP"
        />
      </div>
    </ListPageLayout>
  )
}

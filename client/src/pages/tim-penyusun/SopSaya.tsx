import { useMemo } from 'react'
import { Eye, Edit } from 'lucide-react'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Table } from '@/components/ui/data-table'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { StatusBadge } from '@/components/ui/status-badge'
import { SOPStatusFilterSelect, canEditSop, useSop, useSopStatus } from '@/features/sop'
import { ROUTES } from '@/utils/constants'
import { formatDateIdLong } from '@/utils/format-date'
import { usePagination } from '@/utils/use-pagination'
import { useState, useMemo } from 'react'

export function SopSaya() {
  const { list: sopListRaw } = useSop()
  const { mergeSopStatus } = useSopStatus()
  const mergedList = useMemo(() => mergeSopStatus(sopListRaw), [sopListRaw, mergeSopStatus])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  
  const filteredSop = useMemo(() => {
    let result = mergedList
    if (filterStatus) {
      result = result.filter((sop: any) => sop.status === filterStatus)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((sop: any) => 
        sop.judul.toLowerCase().includes(q) || sop.nomorSOP.toLowerCase().includes(q)
      )
    }
    return result
  }, [mergedList, filterStatus, searchQuery])
  
  const pagination = usePagination(filteredSop.length)
  const rowsToShow = pagination.showPagination
    ? filteredSop.slice(pagination.startIndex, pagination.endIndex)
    : filteredSop

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
                    </div>
                  </Table.Td>
                  <Table.Td className="font-mono text-gray-700 text-[11px]">{sop.nomorSOP}</Table.Td>
                  <Table.Td className="text-center text-gray-600">
                    {formatDateIdLong(sop.terakhirDiperbarui)}
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
          totalItems={filteredSop.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="SOP"
        />
      </div>
    </ListPageLayout>
  )
}

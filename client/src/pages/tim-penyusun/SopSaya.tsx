import { useMemo, useState } from 'react'
import { Eye, Edit } from 'lucide-react'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Table } from '@/components/ui/data-table'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { StatusBadge } from '@/components/ui/status-badge'
import { SOPStatusFilterSelect } from '@/features/sop/components/SOPStatusFilterSelect'
import { canEditSop, useSop } from '@/features/sop'
import type { StatusSOP } from '@/types/common'
import { ROUTES } from '@/utils/constants'
import { formatDateIdLong } from '@/utils/format-date'

export function SopSaya() {
  const { list: sopList } = useSop()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredSop = useMemo(() => {
    let result = sopList
    if (filterStatus && filterStatus !== 'all') {
      result = result.filter((sop) => sop.status === filterStatus)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((sop) =>
        sop.judul.toLowerCase().includes(q) || (sop.nomorSOP ?? '').toLowerCase().includes(q)
      )
    }
    return result
  }, [sopList, filterStatus, searchQuery])

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
      <Table.Paginated data={filteredSop} label="SOP">
        {(pageData) => (
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
                {pageData.map((sop) => (
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
                      <StatusBadge status={sop.status ?? ''} className="text-xs" />
                    </Table.Td>
                    <Table.Td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canEditSop(sop.status as StatusSOP) ? (
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
        )}
      </Table.Paginated>
    </ListPageLayout>
  )
}

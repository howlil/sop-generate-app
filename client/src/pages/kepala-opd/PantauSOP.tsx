/**
 * Kepala OPD: memantau semua SOP yang ada di OPD-nya sendiri.
 * Data difilter menurut opdId Kepala OPD (getKepalaOPDOpdId).
 */
import { useMemo, useState } from 'react'
import { Eye, FileText, Ban } from 'lucide-react'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { SOPStatusFilterSelect } from '@/components/sop/SOPStatusFilterSelect'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateIdLong } from '@/utils/format-date'
import { ROUTES } from '@/lib/constants/routes'
import { getKepalaOPDOpdId } from '@/lib/data/role-display'
import { getSopDaftarByOpdId } from '@/lib/data/sop-daftar'
import { useSopStatus } from '@/hooks/useSopStatus'
import { useToast } from '@/hooks/useUI'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useFilteredList } from '@/hooks/useFilteredList'
import { usePagination } from '@/hooks/usePagination'
import { useOpdList } from '@/lib/data/opd'

export function PantauSOP() {
  const opdId = getKepalaOPDOpdId()
  const allOpds = useOpdList()
  const opd = allOpds.find((o) => o.id === opdId)
  const opdName = opd?.name ?? 'OPD'

  const [filterStatus, setFilterStatus] = useState('all')
  const [cabutSopId, setCabutSopId] = useState<string | null>(null)
  const { mergeSopStatus, setSopStatusOverride } = useSopStatus()
  const { showToast } = useToast()
  const sopListRaw = useMemo(() => getSopDaftarByOpdId(opdId), [opdId])
  const mergedList = useMemo(() => mergeSopStatus(sopListRaw), [sopListRaw, mergeSopStatus])

  const listByStatus = useMemo(
    () =>
      filterStatus === 'all'
        ? mergedList
        : mergedList.filter((s) => s.status === filterStatus),
    [mergedList, filterStatus]
  )

  const { filteredList, searchQuery, setSearchQuery } = useFilteredList(listByStatus, {
    searchKeys: [(s) => s.judul, (s) => s.nomorSOP],
  })

  const pagination = usePagination(filteredList.length)
  const rowsToShow = pagination.showPagination
    ? filteredList.slice(pagination.startIndex, pagination.endIndex)
    : filteredList

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Pantau SOP' }]}
      title="Pantau SOP"
      description={`Daftar semua SOP di ${opdName}. Hanya menampilkan SOP yang tercatat untuk OPD Anda.`}
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari judul atau nomor SOP..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <SOPStatusFilterSelect
            value={filterStatus}
            onValueChange={setFilterStatus}
            className="h-9 w-[200px]"
          />
        </SearchToolbar>
      }
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table.Root>
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>Judul SOP</Table.Th>
                <Table.Th>Nomor SOP</Table.Th>
                <Table.Th>Terakhir diperbarui</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <EmptyState
                  asTableRow
                  colSpan={5}
                  icon={<FileText />}
                  title="Tidak ada SOP ditemukan"
                  description="Tidak ada SOP untuk OPD Anda atau tidak cocok dengan pencarian."
                />
              ) : (
                rowsToShow.map((sop) => (
                  <Table.BodyRow key={sop.id}>
                    <Table.Td>
                      <p className="font-medium text-gray-900">{sop.judul}</p>
                    </Table.Td>
                    <Table.Td>
                      <p className="font-mono text-gray-700 text-[11px]">{sop.nomorSOP}</p>
                    </Table.Td>
                    <Table.Td>
                      <p className="text-gray-700">{formatDateIdLong(sop.terakhirDiperbarui)}</p>
                    </Table.Td>
                    <Table.Td>
                      <StatusBadge status={sop.status} />
                    </Table.Td>
                    <Table.Td>
                      <div className="flex items-center gap-1">
                        <IconActionButton
                          icon={Eye}
                          to={ROUTES.KEPALA_OPD.DETAIL_SOP}
                          params={{ id: sop.id }}
                          title="Lihat detail"
                        />
                        {sop.status === 'Berlaku' && (
                          <IconActionButton
                            icon={Ban}
                            title="Cabut SOP"
                            onClick={() => setCabutSopId(sop.id)}
                          />
                        )}
                      </div>
                    </Table.Td>
                  </Table.BodyRow>
                ))
              )}
            </tbody>
          </Table.Table>
        </Table.Root>

        <Table.Pagination
          totalItems={filteredList.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="SOP"
        />
      </div>
      <ConfirmDialog
        open={cabutSopId != null}
        onOpenChange={(open) => !open && setCabutSopId(null)}
        title="Cabut SOP?"
        description="SOP akan berstatus Dicabut dan tidak lagi berlaku."
        confirmLabel="Cabut SOP"
        cancelLabel="Batal"
        destructive
        onConfirm={() => {
          if (cabutSopId) {
            setSopStatusOverride(cabutSopId, 'Dicabut')
            showToast('SOP berhasil dicabut.')
            setCabutSopId(null)
          }
        }}
      />
    </ListPageLayout>
  )
}

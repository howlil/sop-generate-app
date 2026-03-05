/**
 * Legacy: daftar penugasan evaluasi (alur lama).
 * Alur baru Tim Evaluasi: gunakan Daftar SOP Evaluasi (tanpa penugasan) di tim-evaluasi.penugasan.index.
 */
import { Link } from '@tanstack/react-router'
import { Eye, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { StatusBadge } from '@/components/ui/status-badge'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { Select } from '@/components/ui/select'
import { ROUTES } from '@/lib/constants/routes'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'
import { SEED_PENUGASAN_TIM_EVALUASI } from '@/lib/seed/penugasan-evaluasi-seed'
import { formatDateIdLong } from '@/utils/format-date'
import { useFilteredList } from '@/hooks/useFilteredList'

export function PenugasanEvaluasi() {
  const penugasanList = SEED_PENUGASAN_TIM_EVALUASI
  const {
    filteredList: filteredPenugasan,
    searchQuery,
    setSearchQuery,
    filterValue: filterStatus,
    setFilterValue: setFilterStatus,
  } = useFilteredList(penugasanList, {
    searchKeys: ['sop', 'opd'],
    filterKey: 'status',
  })

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Daftar SOP Evaluasi' }]}
      title="Daftar SOP Evaluasi (legacy penugasan)"
      description="Alur baru: gunakan Daftar SOP Evaluasi untuk evaluasi langsung per SOP."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari SOP atau OPD..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <Select
            className="h-8 w-[160px]"
            value={filterStatus}
            onValueChange={setFilterStatus}
            options={[
              { value: 'all', label: 'Semua Status' },
              { value: 'assigned', label: 'Ditugaskan' },
              { value: 'in-progress', label: 'Dalam Pelaksanaan' },
              { value: 'completed', label: 'Selesai (Hasil)' },
            ]}
          />
        </SearchToolbar>
      }
    >
      <Table.Card>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Tanggal Penugasan</Table.Th>
              <Table.Th>OPD</Table.Th>
              <Table.Th>SOP</Table.Th>
              <Table.Th align="center">Status</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {filteredPenugasan.map((penugasan) => (
              <Table.BodyRow key={penugasan.id}>
                <Table.Td className="text-gray-700">
                  {formatDateIdLong(penugasan.tanggalPenugasan)}
                </Table.Td>
                <Table.Td className="text-gray-700">{penugasan.opd}</Table.Td>
                <Table.Td className="font-medium text-gray-900">{penugasan.sop}</Table.Td>
                <Table.Td className="text-center">
                  <StatusBadge status={penugasan.status} domain={STATUS_DOMAIN.PENUGASAN_EVALUASI} />
                </Table.Td>
                <Table.Td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <IconActionButton
                      icon={Eye}
                      to={ROUTES.TIM_EVALUASI.PENUGASAN_DETAIL}
                      params={{ id: penugasan.id }}
                      title="Detail"
                      variant="outline"
                    />
                    {penugasan.status !== 'completed' && (
                      <Link
                        to={ROUTES.TIM_EVALUASI.PELAKSANAAN}
                        params={{ id: penugasan.id }}
                      >
                        <Button size="icon-sm" className="h-7 w-7 p-0" title={penugasan.status === 'assigned' ? 'Mulai' : 'Lanjutkan'}>
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </Table.Td>
              </Table.BodyRow>
            ))}
          </tbody>
        </Table.Table>
      </Table.Card>
    </ListPageLayout>
  )
}

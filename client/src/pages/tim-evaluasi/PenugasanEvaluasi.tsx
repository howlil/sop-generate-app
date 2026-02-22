import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Eye, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/status-badge'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { Select } from '@/components/ui/select'
import { SEED_PENUGASAN_TIM_EVALUASI } from '@/lib/seed/penugasan-evaluasi-seed'
import { formatDateIdLong } from '@/utils/format-date'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'

export function PenugasanEvaluasi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const penugasanList = SEED_PENUGASAN_TIM_EVALUASI

  const filteredPenugasan = penugasanList.filter((p) => {
    const matchSearch =
      p.sop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.opd.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Penugasan Evaluasi' }]}
        title="Penugasan & Hasil Evaluasi"
        description="Daftar penugasan dan hasil evaluasi SOP (filter menurut status)"
      />
      <SearchToolbar
        searchPlaceholder="Cari penugasan evaluasi..."
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
                      to="/tim-evaluasi/penugasan/detail/$id"
                      params={{ id: penugasan.id }}
                      title="Detail"
                      variant="outline"
                    />
                    {penugasan.status !== 'completed' && (
                      <Link
                        to="/tim-evaluasi/pelaksanaan/$id"
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
    </div>
  )
}

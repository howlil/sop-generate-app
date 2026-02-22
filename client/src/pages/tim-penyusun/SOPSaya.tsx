import { useState, useEffect } from 'react'
import { Eye, Edit } from 'lucide-react'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { Select } from '@/components/ui/select'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/status-badge'
import { STATUS_SOP_ALL, type StatusSOP } from '@/lib/types/sop'
import { mergeSopStatus, subscribeSopStatus } from '@/lib/stores/sop-status-store'
import type { SOPSayaItem } from '@/lib/types/sop'
import { SEED_SOP_SAYA } from '@/lib/seed/sop-daftar'

export function SOPSaya() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sopList, setSopList] = useState<SOPSayaItem[]>(() => [...SEED_SOP_SAYA])

  useEffect(() => {
    const unsub = subscribeSopStatus(() => setSopList((prev) => [...prev]))
    return unsub
  }, [])

  const mergedList = mergeSopStatus(sopList)

  const filteredSOP = mergedList.filter((sop) => {
    const matchSearch =
      sop.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.nomorSOP.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || sop.status === filterStatus
    return matchSearch && matchStatus
  })

  /** Boleh edit isi SOP: Draft, Sedang Disusun, Revisi dari Kepala OPD, Revisi dari Tim Evaluasi. */
  const canEditSop = (status: StatusSOP) =>
    status === 'Draft' ||
    status === 'Sedang Disusun' ||
    status === 'Revisi dari Kepala OPD' ||
    status === 'Revisi dari Tim Evaluasi'

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'SOP Saya' }]}
        title="SOP Saya"
        description="Daftar SOP yang Anda susun"
      />
      <SearchToolbar
        searchPlaceholder="Cari SOP..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      >
        <Select
          className="h-8 w-[180px]"
          value={filterStatus}
          onValueChange={setFilterStatus}
          options={[
            { value: 'all', label: 'Semua Status' },
            ...STATUS_SOP_ALL.map((s) => ({ value: s, label: s })),
          ]}
        />
      </SearchToolbar>

      <div className="bg-white rounded-md border border-gray-200">
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
              {filteredSOP.map((sop) => (
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
                    {new Date(sop.terakhirDiubah).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Table.Td>
                  <Table.Td className="text-center">
                    <StatusBadge status={sop.status} domain="sop" className="text-xs" />
                  </Table.Td>
                  <Table.Td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {canEditSop(sop.status) && (
                        <IconActionButton
                          icon={Edit}
                          to="/tim-penyusun/detail-sop/$id"
                          params={{ id: sop.id }}
                          title="Edit"
                        />
                      )}
                      {!canEditSop(sop.status) && (
                        <IconActionButton
                          icon={Eye}
                          to="/tim-penyusun/detail-sop/$id"
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
      </div>
    </div>
  )
}

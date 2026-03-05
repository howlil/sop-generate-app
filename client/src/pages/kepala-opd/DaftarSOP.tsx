import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Filter,
  Eye,
  Send,
  Plus,
  FileText,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FormDialog } from '@/components/ui/form-dialog'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { TableFooterSummary } from '@/components/ui/table-footer-summary'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'
import { showToast } from '@/lib/stores'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { formatDateIdLong } from '@/utils/format-date'
import { getRiwayatEvaluasiForSop, addEvaluationCase } from '@/lib/stores/evaluasi-store'
import type { EvaluationCaseSourceType } from '@/lib/types/evaluasi'
import { ROUTES } from '@/lib/constants/routes'
import { STATUS_SOP_ALL, type StatusSOP } from '@/lib/types/sop'
import { setSopStatusOverride } from '@/lib/stores/sop-status-store'
import { SEED_PERATURAN_DAFTAR } from '@/lib/seed/sop-daftar'
import { useDaftarSOPFilters } from '@/hooks/useDaftarSOPFilters'
import { useDaftarSOPData } from '@/hooks/useDaftarSOPData'

export function DaftarSOP() {
  const filters = useDaftarSOPFilters()
  const { setSopList, mergedSopList, eligibleSopsForEvaluasi, filteredList } = useDaftarSOPData({
    searchQuery: filters.searchQuery,
    filterStatus: filters.filterStatus,
    filterPeraturan: filters.filterPeraturan,
    filterTanggalDari: filters.filterTanggalDari,
    filterTanggalSampai: filters.filterTanggalSampai,
    isFilterOpen: filters.isFilterOpen,
  })

  const [isRequestEvaluasiDialogOpen, setIsRequestEvaluasiDialogOpen] = useState(false)
  const [selectedSopIdsForAjukan, setSelectedSopIdsForAjukan] = useState<Set<string>>(new Set())

  const peraturanList = SEED_PERATURAN_DAFTAR

  const toggleSopSelectionForAjukan = (sopId: string) => {
    setSelectedSopIdsForAjukan((prev) => {
      const next = new Set(prev)
      if (next.has(sopId)) next.delete(sopId)
      else next.add(sopId)
      return next
    })
  }

  const confirmAjukanEvaluasiBulk = () => {
    if (selectedSopIdsForAjukan.size === 0) {
      showToast('Pilih minimal satu SOP untuk diajukan.', 'error')
      return
    }
    const ids = Array.from(selectedSopIdsForAjukan)
    try {
      const newCase = addEvaluationCase({
        source_type: 'OPD_REQUEST' as EvaluationCaseSourceType,
        source_ref: 'tim-penyusun',
        status: 'Draft',
        sopIds: ids,
      })
      setSopList((prev) =>
        prev.map((p) => {
          if (!ids.includes(p.id)) return p
          setSopStatusOverride(p.id, 'Diajukan Evaluasi')
          return { ...p, status: 'Diajukan Evaluasi' as StatusSOP }
        })
      )
      showToast(`${ids.length} SOP berhasil diajukan untuk evaluasi (${newCase.id})`)
      setIsRequestEvaluasiDialogOpen(false)
      setSelectedSopIdsForAjukan(new Set())
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Gagal mengajukan evaluasi', 'error')
    }
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Daftar SOP' }]}
      title="Daftar SOP"
      description="Daftar SOP (Tim Penyusun): buat SOP baru, pantau status, ajukan evaluasi untuk SOP yang Siap Dievaluasi."
      toolbar={
        <SearchToolbar
        searchPlaceholder="Cari judul atau nomor SOP..."
        searchValue={filters.searchQuery}
        onSearchChange={(e) => filters.setSearchQuery(e.target.value)}
      >
        <DropdownMenu open={filters.isFilterOpen} onOpenChange={filters.setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filter
              {filters.activeFilterCount > 0 && (
                <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 h-4 min-w-[16px] border-0">
                  {filters.activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-900">Filter SOP</p>
                {filters.activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-blue-600"
                    onClick={filters.clearFilters}
                  >
                    Reset
                  </Button>
                )}
              </div>
              <FormField label="Status">
                <Select
                  value={filters.filterStatus}
                  onValueChange={filters.setFilterStatus}
                  options={[
                    { value: 'all', label: 'Semua Status' },
                    ...STATUS_SOP_ALL.map((s) => ({ value: s, label: s })),
                  ]}
                />
              </FormField>
              <FormField label="Peraturan Dasar">
                <Select
                  value={filters.filterPeraturan}
                  onValueChange={filters.setFilterPeraturan}
                  options={[
                    { value: 'all', label: 'Semua Peraturan' },
                    ...peraturanList.map((p) => ({ value: p.id, label: p.nama })),
                  ]}
                />
              </FormField>
              <FormField label="Terakhir diperbarui">
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Dari" variant="muted">
                    <Input
                      type="date"
                      className="h-9 text-xs"
                      value={filters.filterTanggalDari}
                      onChange={(e) => filters.setFilterTanggalDari(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Sampai" variant="muted">
                    <Input
                      type="date"
                      className="h-9 text-xs"
                      value={filters.filterTanggalSampai}
                      onChange={(e) => filters.setFilterTanggalSampai(e.target.value)}
                    />
                  </FormField>
                </div>
              </FormField>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => {
            setSelectedSopIdsForAjukan(new Set())
            setIsRequestEvaluasiDialogOpen(true)
          }}
        >
          <Send className="w-3.5 h-3.5" />
          Request Evaluasi
        </Button>
        <Link to={ROUTES.TIM_PENYUSUN.INITIATE_PROYEK}>
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Buat SOP Baru
          </Button>
        </Link>
      </SearchToolbar>
      }
    >
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
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
                  description="Coba ubah filter atau kata kunci pencarian"
                />
              ) : (
                filteredList.map((sop) => (
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
                      <StatusBadge status={sop.status} domain={STATUS_DOMAIN.SOP} />
                    </Table.Td>
                    <Table.Td>
                      <IconActionButton
                        icon={Eye}
                        to={ROUTES.TIM_PENYUSUN.DETAIL_SOP}
                        params={{ id: sop.id }}
                        search={{ from: 'daftar' }}
                        state={{
                          sopStatus: sop.status,
                          waktuPenugasan: sop.waktuPenugasan,
                          unitTerkait: sop.unitTerkait,
                          timPenyusun: sop.timPenyusun,
                          terakhirDiperbarui: sop.terakhirDiperbarui,
                          deskripsiProyek: sop.deskripsi,
                        }}
                        title="Detail"
                      />
                    </Table.Td>
                  </Table.BodyRow>
                ))
              )}
            </tbody>
          </Table.Table>
        </Table.Root>

        {filteredList.length > 0 && (
          <TableFooterSummary
            displayedCount={filteredList.length}
            totalCount={mergedSopList.length}
            label="SOP"
          />
        )}
      </div>

      <FormDialog
        open={isRequestEvaluasiDialogOpen}
        onOpenChange={setIsRequestEvaluasiDialogOpen}
        title="Request Evaluasi SOP"
        description="Pilih SOP yang eligible untuk dievaluasi. Bisa memilih beberapa sekaligus. Setelah diajukan, SOP tidak dapat diubah hingga evaluasi selesai."
        confirmLabel={`Ajukan Evaluasi (${selectedSopIdsForAjukan.size} SOP)`}
        onConfirm={confirmAjukanEvaluasiBulk}
        confirmDisabled={selectedSopIdsForAjukan.size === 0}
        size="lg"
      >
        <div className="overflow-y-auto min-h-0 border border-gray-200 rounded-md">
          {eligibleSopsForEvaluasi.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-10 h-10" />}
              title="Tidak ada SOP yang eligible untuk dievaluasi"
              description="SOP harus berstatus Siap Dievaluasi atau Berlaku dan tidak sedang dalam evaluasi aktif."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {eligibleSopsForEvaluasi.map((sop) => {
                const riwayat = getRiwayatEvaluasiForSop(sop.id)
                const isSelected = selectedSopIdsForAjukan.has(sop.id)
                return (
                  <li key={sop.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <label className="flex items-center pt-0.5 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSopSelectionForAjukan(sop.id)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                      </label>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono text-gray-600">{sop.nomorSOP}</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{sop.judul}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-gray-500">v{sop.versi}</span>
                          <StatusBadge status={sop.status} domain={STATUS_DOMAIN.SOP} />
                        </div>
                        {riwayat.length > 0 && (
                          <div className="mt-2 p-2 bg-gray-100 rounded border border-gray-200">
                            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1">Riwayat evaluasi</p>
                            <ul className="text-xs text-gray-700 space-y-0.5">
                              {riwayat.map((c) => (
                                <li key={c.id}>
                                  {c.id} — {c.status} {c.timEvaluator ? `(${c.timEvaluator})` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </FormDialog>
    </ListPageLayout>
  )
}

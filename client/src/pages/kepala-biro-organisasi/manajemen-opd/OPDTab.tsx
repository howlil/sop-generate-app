import { Building2, Edit, Trash2, Eye, Users, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateId, formatDateIdLong } from '@/utils/format-date'
import { usePagination } from '@/hooks/usePagination'
import type { OPD, KepalaOPD } from '@/lib/types/opd'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'

export interface OPDTabProps {
  filteredOPD: OPD[]
  opdList: OPD[]
  selectedOPD: OPD | null
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isDetailDialogOpen: boolean
  setIsDetailDialogOpen: (open: boolean) => void
  riwayatKepalaOpen: boolean
  setRiwayatKepalaOpen: (open: boolean) => void
  formData: { name: string }
  setFormData: React.Dispatch<React.SetStateAction<{ name: string }>>
  getKepalaAktif: (opdId: string) => KepalaOPD | undefined
  getKepalaByOPD: (opdId: string) => KepalaOPD[]
  hasRelasiData: (opd: OPD) => boolean
  onOpenDetail: (opd: OPD) => void
  onOpenEdit: (opd: OPD) => void
  onOpenRiwayat: (opd: OPD) => void
  onDelete: (id: string) => void
  onConfirmCreate: () => void
  onConfirmEdit: () => void
}

export function OPDTab({
  filteredOPD,
  opdList: _opdList,
  selectedOPD,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDetailDialogOpen,
  setIsDetailDialogOpen,
  riwayatKepalaOpen,
  setRiwayatKepalaOpen,
  formData,
  setFormData,
  getKepalaAktif,
  getKepalaByOPD,
  hasRelasiData,
  onOpenDetail,
  onOpenEdit,
  onOpenRiwayat,
  onDelete,
  onConfirmCreate,
  onConfirmEdit,
}: OPDTabProps) {
  const pagination = usePagination(filteredOPD.length)
  const rowsToShow = pagination.showPagination
    ? filteredOPD.slice(pagination.startIndex, pagination.endIndex)
    : filteredOPD

  return (
    <>
      <Table.Card className="w-full">
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Nama OPD</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {rowsToShow.map((opd) => (
              <Table.BodyRow key={opd.id}>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-900">{opd.name}</p>
                  </div>
                </Table.Td>
                <Table.Td className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="h-7 w-7 p-0">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuItem onClick={() => onOpenDetail(opd)}>
                        <Eye className="w-3.5 h-3.5 mr-2" />Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenEdit(opd)}>
                        <Edit className="w-3.5 h-3.5 mr-2" />Edit OPD
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenRiwayat(opd)}>
                        <Users className="w-3.5 h-3.5 mr-2" />Riwayat OPD
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(opd.id)}
                        className="text-red-600"
                        disabled={hasRelasiData(opd)}
                        title={hasRelasiData(opd) ? 'OPD yang sudah mengait SOP tidak dapat dihapus' : undefined}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        {hasRelasiData(opd) ? 'Hapus (ditolak: ada SOP)' : 'Hapus OPD'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Table.Td>
              </Table.BodyRow>
            ))}
          </tbody>
        </Table.Table>
        <Table.Pagination
          totalItems={filteredOPD.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="OPD"
        />
      </Table.Card>

      <FormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Tambah OPD Baru"
        description="Lengkapi form berikut untuk menambah OPD baru"
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={onConfirmCreate}
        confirmDisabled={!formData.name}
        size="md"
      >
        <FormField label="Nama OPD" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Dinas Pendidikan"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </FormField>
      </FormDialog>

      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit OPD"
        description="Perbarui informasi OPD"
        confirmLabel="Simpan Perubahan"
        cancelLabel="Batal"
        onConfirm={onConfirmEdit}
        confirmDisabled={!formData.name}
        size="md"
      >
        <FormField label="Nama OPD" required>
          <Input
            className="h-9 text-xs"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </FormField>
      </FormDialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-gray-900">Detail OPD</DialogTitle>
          </DialogHeader>
          {selectedOPD && (
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-blue-50 px-3 py-2.5">
                <div className="p-2 bg-white/80 rounded-lg shadow-sm">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{selectedOPD.name}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{selectedOPD.email}</p>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Kepala (aktif)</span>
                  <span className="font-medium text-gray-900 text-right">
                    {getKepalaAktif(selectedOPD.id)?.name ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Telepon</span>
                  <span className="font-medium text-gray-900 text-right">{selectedOPD.phone || '—'}</span>
                </div>
                <div className="flex justify-between gap-3 pt-1 border-t border-gray-200/80">
                  <span className="text-gray-500">Dibuat</span>
                  <span className="font-medium text-gray-900 text-right">
                    {formatDateIdLong(selectedOPD.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 pt-1 border-t border-gray-200/80">
                  <span className="text-gray-500">Ringkasan SOP</span>
                  <span className="font-medium text-gray-900 text-right">
                    {selectedOPD.sopBerlaku} Berlaku · {selectedOPD.sopDraft} Draft · {selectedOPD.totalSOP} Total
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Riwayat OPD</h4>
                <div className="space-y-1.5 max-h-52 overflow-auto scrollbar-hide pr-1">
                  {getKepalaByOPD(selectedOPD.id).map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs border border-gray-100"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-gray-900 truncate block">{k.name}</span>
                        {k.nip && (
                          <span className="block text-gray-500 font-mono text-[10px] mt-0.5 truncate">{k.nip}</span>
                        )}
                      </div>
                      <StatusBadge
                        status={k.isActive ? 'Aktif' : 'Nonaktif'}
                        domain={STATUS_DOMAIN.TIM_PENYUSUN}
                      />
                    </div>
                  ))}
                  {getKepalaByOPD(selectedOPD.id).length === 0 && (
                    <p className="text-gray-500 text-xs py-2 text-center">Belum ada kepala OPD</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsDetailDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={riwayatKepalaOpen} onOpenChange={setRiwayatKepalaOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-sm">Riwayat OPD — {selectedOPD?.name}</DialogTitle>
            <DialogDescription className="text-xs">
              Daftar riwayat kepala OPD untuk OPD ini. Hanya untuk melihat; jabatan baru atau perubahan dikelola dari tab OPD atau Manajemen OPD.
            </DialogDescription>
          </DialogHeader>
          {selectedOPD && (
            <>
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50/50">
                {getKepalaByOPD(selectedOPD.id).length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada riwayat kepala OPD</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {getKepalaByOPD(selectedOPD.id).map((k) => (
                      <li key={k.id} className="bg-white px-4 py-3 hover:bg-gray-50/80 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm">{k.name}</p>
                            {k.nip && <p className="text-xs text-gray-600 mt-0.5 font-mono">{k.nip}</p>}
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{k.email}</p>
                            {k.phone && <p className="text-xs text-gray-400 mt-0.5">{k.phone}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <StatusBadge status={k.isActive ? 'Aktif' : 'Nonaktif'} domain={STATUS_DOMAIN.TIM_PENYUSUN} />
                            {k.endedAt && (
                              <span className="text-xs text-gray-500">Selesai: {formatDateId(k.endedAt)}</span>
                            )}
                            <span className="text-[10px] text-gray-400">{k.totalSOP} SOP</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
          <DialogFooter>
            <Button size="sm" className="h-8 text-xs" onClick={() => setRiwayatKepalaOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

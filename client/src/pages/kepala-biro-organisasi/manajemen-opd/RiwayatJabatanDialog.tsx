import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Table } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateId } from '@/utils/format-date'
import { usePagination } from '@/hooks/usePagination'
import type { OPD, KepalaOPD } from '@/lib/types/opd'
import type { RiwayatDialogPerson } from '@/hooks/useManajemenOPDState'

type RiwayatRow = KepalaOPD & { opdName: string }

export interface RiwayatJabatanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person: RiwayatDialogPerson | null
  riwayatRows: RiwayatRow[]
  opdList: OPD[]
  onAkhiriJabatan: (kepalaId: string) => void
  onSetKepalaAktif: (kepalaId: string) => void
  onOpenKepalaForm: (kepala: KepalaOPD) => void
  onDeleteKepala: (id: string) => void
  canDeleteKepala: (k: KepalaOPD) => boolean
  getKepalaByOPD: (opdId: string) => KepalaOPD[]
  setSelectedOPD: (opd: OPD | null) => void
  onClose: () => void
}

export function RiwayatJabatanDialog({
  open,
  onOpenChange,
  person,
  riwayatRows,
  opdList,
  onAkhiriJabatan,
  onSetKepalaAktif,
  onOpenKepalaForm,
  onDeleteKepala,
  canDeleteKepala,
  getKepalaByOPD,
  setSelectedOPD,
  onClose,
}: RiwayatJabatanDialogProps) {
  const pagination = usePagination(riwayatRows.length)
  const rowsToShow = pagination.showPagination
    ? riwayatRows.slice(pagination.startIndex, pagination.endIndex)
    : riwayatRows

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm">Riwayat jabatan</DialogTitle>
          <DialogDescription className="text-xs">
            {person ? `${person.name} — ${person.email}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-auto scrollbar-hide flex-1 min-h-0 border border-gray-200 rounded-lg">
          {person && (
            <>
              <Table.Table>
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                <Table.HeadRow>
                  <Table.Th>OPD</Table.Th>
                  <Table.Th align="center">Selesai</Table.Th>
                  <Table.Th align="center">Status</Table.Th>
                  <Table.Th align="center">Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {rowsToShow.map((r) => (
                  <Table.BodyRow key={r.id}>
                    <Table.Td>{r.opdName}</Table.Td>
                    <Table.Td className="text-center">{r.endedAt ? formatDateId(r.endedAt) : '—'}</Table.Td>
                    <Table.Td className="text-center">
                      <StatusBadge status={r.isActive ? 'Aktif' : 'Nonaktif'} />
                    </Table.Td>
                    <Table.Td>
                      <div className="flex gap-1 justify-center flex-wrap">
                        {r.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => onAkhiriJabatan(r.id)}
                          >
                            Akhiri jabatan
                          </Button>
                        )}
                        {!r.isActive &&
                          getKepalaByOPD(r.opdId).some((k) => k.id !== r.id && k.isActive) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => onSetKepalaAktif(r.id)}
                            >
                              Jadikan Aktif
                            </Button>
                          )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 p-0"
                          title="Ubah"
                          onClick={() => {
                            onOpenChange(false)
                            setSelectedOPD(opdList.find((o) => o.id === r.opdId) ?? null)
                            onOpenKepalaForm(r)
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 p-0 text-red-600"
                          title="Hapus"
                          onClick={() => onDeleteKepala(r.id)}
                          disabled={!canDeleteKepala(r)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </Table.Td>
                  </Table.BodyRow>
                ))}
              </tbody>
            </Table.Table>
            <Table.Pagination
                totalItems={riwayatRows.length}
                currentPage={pagination.page}
                onPageChange={pagination.setPage}
                label="jabatan"
              />
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

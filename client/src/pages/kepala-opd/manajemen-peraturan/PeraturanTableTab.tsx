import { Edit, Trash2, History, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Select } from '@/components/ui/select'
import type { Peraturan } from '@/lib/types/peraturan'
import type { JenisPeraturan, RiwayatVersiEntry } from '@/lib/types/peraturan'
import { formatDateIdLong } from '@/utils/format-date'
import { usePagination } from '@/hooks/usePagination'

export interface PeraturanTableTabProps {
  filteredPeraturan: Peraturan[]
  jenisList: JenisPeraturan[]
  canEditPeraturan: (p: Peraturan) => boolean
  isPeraturanDialogOpen: boolean
  setIsPeraturanDialogOpen: (open: boolean) => void
  editingPeraturan: Peraturan | null
  peraturanFormData: {
    jenisPeraturan: string
    nomor: string
    tahun: string
    tentang: string
    tanggalTerbit: string
  }
  setPeraturanFormData: React.Dispatch<React.SetStateAction<PeraturanTableTabProps['peraturanFormData']>>
  riwayatVersiOpen: boolean
  setRiwayatVersiOpen: (open: boolean) => void
  selectedPeraturanForRiwayat: Peraturan | null
  setSelectedPeraturanForRiwayat: (p: Peraturan | null) => void
  getRiwayatVersi: (peraturanId: string) => RiwayatVersiEntry[]
  onOpenPeraturanDialog: (peraturan?: Peraturan) => void
  onSavePeraturan: () => void
  onDeletePeraturan: (id: string) => void
  onToggleStatus: (id: string) => void
  confirmDisabled: boolean
}

export function PeraturanTableTab({
  filteredPeraturan,
  jenisList,
  canEditPeraturan,
  isPeraturanDialogOpen,
  setIsPeraturanDialogOpen,
  editingPeraturan,
  peraturanFormData,
  setPeraturanFormData,
  riwayatVersiOpen,
  setRiwayatVersiOpen,
  selectedPeraturanForRiwayat,
  setSelectedPeraturanForRiwayat,
  getRiwayatVersi,
  onOpenPeraturanDialog,
  onSavePeraturan,
  onDeletePeraturan,
  onToggleStatus,
  confirmDisabled,
}: PeraturanTableTabProps) {
  const pagination = usePagination(filteredPeraturan.length)
  const rowsToShow = pagination.showPagination
    ? filteredPeraturan.slice(pagination.startIndex, pagination.endIndex)
    : filteredPeraturan

  return (
    <>
      <Table.Card>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Jenis</Table.Th>
              <Table.Th>Nomor</Table.Th>
              <Table.Th>Tentang</Table.Th>
              <Table.Th align="center">Status</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {rowsToShow.map((peraturan) => (
              <Table.BodyRow key={peraturan.id}>
                <Table.Td>
                  <Badge variant="outline" className="text-xs">
                    {peraturan.jenisPeraturan}
                  </Badge>
                </Table.Td>
                <Table.Td className="font-mono text-gray-700">
                  No. {peraturan.nomor}/{peraturan.tahun}
                </Table.Td>
                <Table.Td className="text-gray-900">{peraturan.tentang}</Table.Td>
                <Table.Td className="text-center">
                  <button
                    type="button"
                    onClick={() => canEditPeraturan(peraturan) && onToggleStatus(peraturan.id)}
                    className={!canEditPeraturan(peraturan) ? 'cursor-default' : 'cursor-pointer'}
                    disabled={!canEditPeraturan(peraturan)}
                  >
                    <Badge
                      className={`text-xs border-0 ${
                        peraturan.status === 'Berlaku'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      } ${!canEditPeraturan(peraturan) ? 'opacity-90' : ''}`}
                    >
                      {peraturan.status}
                    </Badge>
                  </button>
                </Table.Td>
                <Table.Td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setSelectedPeraturanForRiwayat(peraturan)
                        setRiwayatVersiOpen(true)
                      }}
                      title="Riwayat versi & SOP yang mengait"
                    >
                      <History className="w-3 h-3" />
                    </Button>
                    <IconActionButton
                      icon={Edit}
                      title={
                        !canEditPeraturan(peraturan)
                          ? 'Hanya peraturan yang Anda buat yang dapat diedit'
                          : 'Edit'
                      }
                      onClick={() => onOpenPeraturanDialog(peraturan)}
                      disabled={!canEditPeraturan(peraturan)}
                    />
                    <IconActionButton
                      icon={Trash2}
                      title={
                        !canEditPeraturan(peraturan)
                          ? 'Hanya peraturan yang Anda buat yang dapat dihapus'
                          : peraturan.digunakan > 0
                            ? 'Tidak dapat dihapus: sudah ada SOP yang mengait'
                            : 'Hapus'
                      }
                      destructive
                      onClick={() => onDeletePeraturan(peraturan.id)}
                      disabled={!canEditPeraturan(peraturan) || peraturan.digunakan > 0}
                    />
                  </div>
                </Table.Td>
              </Table.BodyRow>
            ))}
          </tbody>
        </Table.Table>
        <Table.Pagination
          totalItems={filteredPeraturan.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="peraturan"
        />
      </Table.Card>
      {filteredPeraturan.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Tidak ada peraturan ditemukan</p>
        </div>
      )}

      {/* Dialog Riwayat Versi Peraturan */}
      <Dialog open={riwayatVersiOpen} onOpenChange={setRiwayatVersiOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-sm">Riwayat versi</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedPeraturanForRiwayat
                ? `${selectedPeraturanForRiwayat.jenisPeraturan} No. ${selectedPeraturanForRiwayat.nomor}/${selectedPeraturanForRiwayat.tahun} — ${selectedPeraturanForRiwayat.tentang}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedPeraturanForRiwayat && (
            <Table.Root className="border rounded-lg">
              <Table.Table>
                <thead>
                  <Table.HeadRow>
                    <Table.Th className="text-center w-16">Versi</Table.Th>
                    <Table.Th>Tanggal</Table.Th>
                    <Table.Th>Diubah oleh</Table.Th>
                    <Table.Th>SOP yang mengait</Table.Th>
                  </Table.HeadRow>
                </thead>
                <tbody>
                  {getRiwayatVersi(selectedPeraturanForRiwayat.id)
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <Table.BodyRow key={entry.version}>
                        <Table.Td className="text-center font-medium">{entry.version}</Table.Td>
                        <Table.Td className="text-gray-600">
                          {formatDateIdLong(entry.tanggal)}
                        </Table.Td>
                        <Table.Td className="text-gray-600">{entry.diubahOleh}</Table.Td>
                        <Table.Td className="text-gray-700">
                          {entry.sopYangMengait.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-0.5">
                              {entry.sopYangMengait.map((s) => (
                                <li key={s.id}>{s.nama}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </Table.Td>
                      </Table.BodyRow>
                    ))}
                </tbody>
              </Table.Table>
            </Table.Root>
          )}
          <DialogFooter>
            <Button size="sm" className="h-8 text-xs" onClick={() => setRiwayatVersiOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Peraturan Form Dialog */}
      <FormDialog
        open={isPeraturanDialogOpen}
        onOpenChange={setIsPeraturanDialogOpen}
        title={editingPeraturan ? 'Edit Peraturan' : 'Tambah Peraturan'}
        description={
          editingPeraturan
            ? 'Perbarui informasi peraturan'
            : 'Tambahkan peraturan baru ke database'
        }
        confirmLabel={editingPeraturan ? 'Perbarui' : 'Tambah'}
        cancelLabel="Batal"
        onConfirm={onSavePeraturan}
        confirmDisabled={confirmDisabled}
        size="md"
      >
        <FormField label="Jenis Peraturan" required>
          <Select
            value={peraturanFormData.jenisPeraturan}
            onValueChange={(jenisPeraturan) =>
              setPeraturanFormData((prev) => ({ ...prev, jenisPeraturan }))
            }
            placeholder="Pilih Jenis Peraturan"
            options={jenisList.map((jenis) => ({
              value: jenis.kode,
              label: `${jenis.kode} - ${jenis.nama}`,
            }))}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nomor" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: 1"
              value={peraturanFormData.nomor}
              onChange={(e) =>
                setPeraturanFormData((prev) => ({ ...prev, nomor: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Tahun" required>
            <Input
              className="h-9 text-xs"
              placeholder="2026"
              value={peraturanFormData.tahun}
              onChange={(e) =>
                setPeraturanFormData((prev) => ({ ...prev, tahun: e.target.value }))
              }
              maxLength={4}
            />
          </FormField>
        </div>
        <FormField label="Tentang" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Penerimaan Peserta Didik Baru"
            value={peraturanFormData.tentang}
            onChange={(e) =>
              setPeraturanFormData((prev) => ({ ...prev, tentang: e.target.value }))
            }
          />
        </FormField>
        <FormField label="Tanggal Terbit">
          <Input
            type="date"
            className="h-9 text-xs"
            value={peraturanFormData.tanggalTerbit}
            onChange={(e) =>
              setPeraturanFormData((prev) => ({
                ...prev,
                tanggalTerbit: e.target.value,
              }))
            }
          />
        </FormField>
      </FormDialog>
    </>
  )
}

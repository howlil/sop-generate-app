import { Edit, Trash2, FileText } from 'lucide-react'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import type { Peraturan } from "@/types/dto/peraturan.dto";

export interface PeraturanTableTabProps {
  filteredPeraturan: Peraturan[]
  canEditPeraturan: (p: Peraturan) => boolean
  isPeraturanDialogOpen: boolean
  setIsPeraturanDialogOpen: (open: boolean) => void
  editingPeraturan: Peraturan | null
  peraturanFormData: {
    peraturan: string
    nomor: string
    tahun: string
    tentang: string
  }
  setPeraturanFormData: React.Dispatch<React.SetStateAction<PeraturanTableTabProps['peraturanFormData']>>
  onOpenPeraturanDialog: (peraturan?: Peraturan) => void
  onSavePeraturan: () => void
  onDeletePeraturan: (id: string) => void
  confirmDisabled: boolean
}

export function PeraturanTableTab({
  filteredPeraturan,
  canEditPeraturan,
  isPeraturanDialogOpen,
  setIsPeraturanDialogOpen,
  editingPeraturan,
  peraturanFormData,
  setPeraturanFormData,
  onOpenPeraturanDialog,
  onSavePeraturan,
  onDeletePeraturan,
  confirmDisabled,
}: PeraturanTableTabProps) {
  return (
    <>
      <Table.Paginated data={filteredPeraturan} label="peraturan">
        {(pageData) => (
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>Peraturan</Table.Th>
                <Table.Th>Nomor</Table.Th>
                <Table.Th>Tentang</Table.Th>
                <Table.Th>Terakhir diedit</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {pageData.map((peraturan) => (
                <Table.BodyRow key={peraturan.id}>
                  <Table.Td>
                    <Badge variant="outline" className="text-xs">
                      {peraturan.namaPeraturan}
                    </Badge>
                  </Table.Td>
                  <Table.Td className="font-mono text-gray-700">
                    No. {peraturan.nomor}/{peraturan.tahun}
                  </Table.Td>
                  <Table.Td className="text-gray-900">{peraturan.tentang}</Table.Td>
                  <Table.Td className="text-gray-700">
                    {peraturan.lastEditedBy ? (
                      <div
                        className="min-w-0 max-w-[18rem] space-y-0.5"
                        title={`${peraturan.lastEditedBy.nama} (${peraturan.lastEditedBy.opd.nama})`}
                      >
                        <div className="truncate font-medium text-gray-900">
                          {peraturan.lastEditedBy.nama}
                        </div>
                        <div className="truncate text-xs text-gray-500">
                          {peraturan.lastEditedBy.opd.nama}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </Table.Td>
                  <Table.Td className="text-center">
                    <div className="flex items-center justify-center gap-1">
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
                            : (peraturan.digunakan ?? 0) > 0
                              ? 'Tidak dapat dihapus: sudah ada SOP yang mengait'
                              : 'Hapus'
                        }
                        destructive
                        onClick={() => onDeletePeraturan(peraturan.id)}
                        disabled={!canEditPeraturan(peraturan) || (peraturan.digunakan ?? 0) > 0}
                      />
                    </div>
                  </Table.Td>
                </Table.BodyRow>
              ))}
            </tbody>
          </Table.Table>
        )}
      </Table.Paginated>
      {filteredPeraturan.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Tidak ada peraturan ditemukan</p>
        </div>
      )}

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
        <FormField label="Peraturan" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Permendikbud, Perda, SK Kadis"
            value={peraturanFormData.peraturan}
            onChange={(e) =>
              setPeraturanFormData((prev) => ({ ...prev, peraturan: e.target.value }))
            }
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
      </FormDialog>
    </>
  )
}

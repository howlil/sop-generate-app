import { Edit, Trash2, FileText } from 'lucide-react'
import { Table } from '@/components/ui/data-table'
import { RowActions } from '@/components/data/row-actions'
import { PeraturanFormDialog } from '@/pages/penyusun/peraturan/components/PeraturanFormDialog'
import { EmptyState } from '@/components/ui/empty-state'
import type { Peraturan } from "@/types/dto/peraturan.dto";

type PeraturanFormData = {
  peraturan: string
  nomor: string
  tahun: string
  tentang: string
}

export interface PeraturanTableTabProps {
  filteredPeraturan: Peraturan[]
  canEditPeraturan: (p: Peraturan) => boolean
  isPeraturanDialogOpen: boolean
  setIsPeraturanDialogOpen: (open: boolean) => void
  editingPeraturan: Peraturan | null
  peraturanFormData: PeraturanFormData
  setPeraturanFormData: React.Dispatch<React.SetStateAction<PeraturanFormData>>
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
                  <Table.Td className="text-gray-900">
                    {peraturan.namaPeraturan}
                  </Table.Td>
                  <Table.Td className="text-gray-900">
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
                    <RowActions
                      actions={[
                        {
                          icon: Edit,
                          title: !canEditPeraturan(peraturan)
                            ? 'Hanya peraturan yang Anda buat yang dapat diedit'
                            : 'Edit',
                          onClick: () => onOpenPeraturanDialog(peraturan),
                          disabled: !canEditPeraturan(peraturan),
                        },
                        {
                          icon: Trash2,
                          title: !canEditPeraturan(peraturan)
                            ? 'Hanya peraturan yang Anda buat yang dapat dihapus'
                            : (peraturan.digunakan ?? 0) > 0
                              ? 'Tidak dapat dihapus: sudah ada SOP yang mengait'
                              : 'Hapus',
                          destructive: true,
                          onClick: () => onDeletePeraturan(peraturan.id),
                          disabled:
                            !canEditPeraturan(peraturan) ||
                            (peraturan.digunakan ?? 0) > 0,
                        },
                      ]}
                    />
                  </Table.Td>
                </Table.BodyRow>
              ))}
            </tbody>
          </Table.Table>
        )}
      </Table.Paginated>
      {filteredPeraturan.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <EmptyState
            icon={<FileText />}
            title="Tidak ada peraturan ditemukan"
            className="p-8"
          />
        </div>
      )}

      <PeraturanFormDialog
        open={isPeraturanDialogOpen}
        onOpenChange={setIsPeraturanDialogOpen}
        title={editingPeraturan ? 'Edit Peraturan' : 'Tambah Peraturan'}
        description={
          editingPeraturan
            ? 'Perbarui informasi peraturan'
            : 'Tambahkan peraturan baru ke database'
        }
        confirmLabel={editingPeraturan ? 'Perbarui' : 'Tambah'}
        value={peraturanFormData}
        onChange={setPeraturanFormData}
        onConfirm={onSavePeraturan}
        confirmDisabled={confirmDisabled}
      />
    </>
  )
}

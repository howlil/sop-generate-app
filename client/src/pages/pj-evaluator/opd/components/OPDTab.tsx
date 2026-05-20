import { useState } from 'react'
import { Building2, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { RowActions } from '@/components/data/row-actions'
import type { OPDUI as OPD } from '@/types/ui/organisasi'

interface OpdDialogState {
  isCreateOpen: boolean
  isEditOpen: boolean
}

export interface OPDTabProps {
  filteredOPD: OPD[]
  hasRelasiData: (opd: OPD) => boolean
  onDelete: (id: string) => void
  onCreate: (name: string) => void | Promise<void>
  onUpdate: (payload: { id: string; name: string }) => void | Promise<void>
}

export function OPDTab({
  filteredOPD,
  hasRelasiData,
  onDelete,
  onCreate,
  onUpdate,
}: OPDTabProps) {
  const [selectedOPD, setSelectedOPD] = useState<OPD | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [dialogState, setDialogState] = useState<OpdDialogState>({
    isCreateOpen: false,
    isEditOpen: false,
  })

  const openCreateDialog = () => {
    setFormData({ name: '' })
    setDialogState((prev) => ({ ...prev, isCreateOpen: true }))
  }
  const openEditDialog = (opd: OPD) => {
    setSelectedOPD(opd)
    setFormData({ name: opd.name })
    setDialogState((prev) => ({ ...prev, isEditOpen: true }))
  }
  const handleConfirmCreate = () => onCreate(formData.name)
  const handleConfirmEdit = () => {
    if (!selectedOPD) return
    onUpdate({ id: selectedOPD.id, name: formData.name })
  }

  return (
    <>
      <Table.Paginated data={filteredOPD} label="OPD" className="w-full">
        {(pageData) => (
          <>
            <div className="flex justify-end mb-2">
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={openCreateDialog}
              >
                Tambah OPD
              </Button>
            </div>
            <Table.Table>
              <thead>
                <Table.HeadRow>
                  <Table.Th className="w-full">Nama OPD</Table.Th>
                  <Table.Th className="w-0 whitespace-nowrap text-right">Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {pageData.map((opd) => (
                  <Table.BodyRow key={opd.id}>
                    <Table.Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <p className="font-medium text-gray-900">{opd.name}</p>
                      </div>
                    </Table.Td>
                    <Table.Td className="text-right whitespace-nowrap">
                      <RowActions
                        align="end"
                        actions={[
                          {
                            icon: Edit,
                            title: 'Edit OPD',
                            onClick: () => openEditDialog(opd),
                          },
                          {
                            icon: Trash2,
                            title: hasRelasiData(opd)
                              ? 'Hapus (ditolak: ada SOP)'
                              : 'Hapus OPD',
                            destructive: true,
                            onClick: () => onDelete(opd.id),
                            disabled: hasRelasiData(opd),
                          },
                        ]}
                      />
                    </Table.Td>
                  </Table.BodyRow>
                ))}
              </tbody>
            </Table.Table>
          </>
        )}
      </Table.Paginated>

      <FormDialog
        open={dialogState.isCreateOpen}
        onOpenChange={(open) =>
          setDialogState((prev) => ({ ...prev, isCreateOpen: open }))
        }
        title="Tambah OPD Baru"
        description="Lengkapi form berikut untuk menambah OPD baru"
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={handleConfirmCreate}
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
        open={dialogState.isEditOpen}
        onOpenChange={(open) =>
          setDialogState((prev) => ({ ...prev, isEditOpen: open }))
        }
        title="Edit OPD"
        description="Perbarui informasi OPD"
        confirmLabel="Simpan Perubahan"
        cancelLabel="Batal"
        onConfirm={handleConfirmEdit}
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
    </>
  )
}

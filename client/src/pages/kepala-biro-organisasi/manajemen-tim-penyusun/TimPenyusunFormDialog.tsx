import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { TimPenyusunFormState } from '@/hooks/useManajemenTimPenyusunState'
import type { OPD } from '@/lib/types/opd'

export type TimPenyusunFormDialogMode = 'create' | 'edit'

export interface TimPenyusunFormDialogProps {
  mode: TimPenyusunFormDialogMode
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: TimPenyusunFormState
  setFormData: React.Dispatch<React.SetStateAction<TimPenyusunFormState>>
  createOpdId: string
  setCreateOpdId: (id: string) => void
  opdList: OPD[]
  isFormValid: boolean
  onConfirm: () => void
}

export function TimPenyusunFormDialog({
  mode,
  open,
  onOpenChange,
  formData,
  setFormData,
  createOpdId,
  setCreateOpdId,
  opdList,
  isFormValid,
  onConfirm,
}: TimPenyusunFormDialogProps) {
  const isCreate = mode === 'create'
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? 'Tambah Tim Penyusun SOP' : 'Edit Tim Penyusun SOP'}
      description={isCreate ? 'Pilih OPD dan isi data pegawai tim penyusun' : 'Perbarui data tim penyusun SOP'}
      confirmLabel={isCreate ? 'Simpan' : 'Simpan Perubahan'}
      cancelLabel="Batal"
      onConfirm={onConfirm}
      confirmDisabled={!isFormValid}
      size="md"
    >
      <div className="space-y-3">
        {isCreate && (
          <FormField label="OPD" required>
            <Select
              value={createOpdId}
              onValueChange={setCreateOpdId}
              options={opdList.map((o) => ({ value: o.id, label: o.name }))}
              placeholder="Pilih OPD"
            />
          </FormField>
        )}
        <FormField label="Nama Lengkap" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Ahmad Pratama, S.Sos"
            value={formData.nama}
            onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
          />
        </FormField>
        <FormField label="NIP" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: 199203152020121001"
            value={formData.nip}
            onChange={(e) => setFormData((prev) => ({ ...prev, nip: e.target.value }))}
          />
        </FormField>
        <FormField label="Jabatan" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Kepala Seksi Organisasi"
            value={formData.jabatan}
            onChange={(e) => setFormData((prev) => ({ ...prev, jabatan: e.target.value }))}
          />
        </FormField>
        <FormField label="Pangkat / Golongan" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: IV/a"
            value={formData.pangkat}
            onChange={(e) => setFormData((prev) => ({ ...prev, pangkat: e.target.value }))}
          />
        </FormField>
        <FormField label="Email" required>
          <Input
            type="email"
            className="h-9 text-xs"
            placeholder="Contoh: ahmad@disdik.go.id"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          />
        </FormField>
        <FormField label="No. HP" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: 081234567890"
            value={formData.noHP}
            onChange={(e) => setFormData((prev) => ({ ...prev, noHP: e.target.value }))}
          />
        </FormField>
      </div>
    </FormDialog>
  )
}

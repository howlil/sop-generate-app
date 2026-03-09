import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { OPD } from '@/lib/types/opd'
import type { FormTambahKepalaState } from '@/hooks/useManajemenOPDState'

export interface TambahKepalaOPDDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: FormTambahKepalaState
  setForm: React.Dispatch<React.SetStateAction<FormTambahKepalaState>>
  opdList: OPD[]
  onConfirm: () => void
}

export function TambahKepalaOPDDialog({
  open,
  onOpenChange,
  form,
  setForm,
  opdList,
  onConfirm,
}: TambahKepalaOPDDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah Kepala OPD"
      description="Pilih OPD dan isi data kepala yang akan ditugaskan."
      confirmLabel="Simpan"
      cancelLabel="Batal"
      onConfirm={onConfirm}
      confirmDisabled={!form.opdId || !form.name}
      size="md"
    >
      <FormField label="OPD" required>
        <Select
          value={form.opdId}
          onValueChange={(opdId) => setForm((f) => ({ ...f, opdId }))}
          placeholder="Pilih OPD"
          options={opdList.map((opd) => ({ value: opd.id, label: opd.name }))}
        />
      </FormField>
      <FormField label="Nama Kepala" required>
        <Input
          className="h-9 text-xs"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Nama lengkap dengan gelar"
        />
      </FormField>
      <FormField label="NIP">
        <Input
          className="h-9 text-xs"
          value={form.nip}
          onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))}
          placeholder="Contoh: 197503152000032001"
        />
      </FormField>
      <FormField label="Email">
        <Input
          type="email"
          className="h-9 text-xs"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="email@pemda.go.id"
        />
      </FormField>
    </FormDialog>
  )
}

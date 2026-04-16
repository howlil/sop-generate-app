import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import type { FormTambahKepalaState } from '@/types/common'

interface OPD {
  id: string
  name: string
}

interface TambahKepalaUser {
  id: string
  nama: string
  email: string
  nip?: string
}

export interface TambahKepalaOPDDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: FormTambahKepalaState
  setForm: React.Dispatch<React.SetStateAction<FormTambahKepalaState>>
  opdList: OPD[]
  users: TambahKepalaUser[]
  onConfirm: () => void
}

export function TambahKepalaOPDDialog({
  open,
  onOpenChange,
  form,
  setForm,
  opdList,
  users,
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
      confirmDisabled={!form.opdId || !form.userId}
      size="md"
    >
      <FormField label="OPD" required>
        <Select
          value={form.opdId}
          onValueChange={(opdId) => setForm((f: FormTambahKepalaState) => ({ ...f, opdId }))}
          placeholder="Pilih OPD"
          options={opdList.map((opd) => ({ value: opd.id, label: opd.name }))}
        />
      </FormField>
      <FormField label="Pilih user (Kepala OPD)" required>
        <Select
          value={form.userId}
          onValueChange={(userId) =>
            setForm((f: FormTambahKepalaState) => ({
              ...f,
              userId,
            }))
          }
          placeholder="Pilih user yang sudah terdaftar"
          options={users.map((u) => ({
            value: u.id,
            label: `${u.nama} — ${u.email}${u.nip ? ` (${u.nip})` : ''}`,
          }))}
        />
      </FormField>
    </FormDialog>
  )
}

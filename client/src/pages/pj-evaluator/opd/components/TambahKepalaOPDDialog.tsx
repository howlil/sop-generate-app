import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { FormTambahKepalaState } from '@/types/ui/organisasi'

interface OPD {
  id: string
  name: string
}

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
  const valid =
    form.opdId &&
    form.nama.trim() &&
    form.email.trim() &&
    form.nip.trim() &&
    form.jabatan.trim() &&
    form.pangkat.trim() &&
    form.nohp.trim()

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah Kepala OPD"
      description="Buat akun Kepala OPD baru untuk OPD terpilih. Kata sandi awal ditetapkan server (sama seperti penyusun)."
      confirmLabel="Simpan"
      cancelLabel="Batal"
      onConfirm={onConfirm}
      confirmDisabled={!valid}
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
      <FormField label="Nama lengkap" required>
        <Input
          className="h-9 text-xs"
          value={form.nama}
          onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
          placeholder="Contoh: Dr. Ahmad Pratama, S.Sos"
        />
      </FormField>
      <FormField label="NIP" required>
        <Input
          className="h-9 text-xs font-mono"
          value={form.nip}
          onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))}
          placeholder="NIP 18 digit"
        />
      </FormField>
      <FormField label="Email" required>
        <Input
          type="email"
          className="h-9 text-xs"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="email@pemda.go.id"
        />
      </FormField>
      <FormField label="Jabatan" required>
        <Input
          className="h-9 text-xs"
          value={form.jabatan}
          onChange={(e) => setForm((f) => ({ ...f, jabatan: e.target.value }))}
          placeholder="Contoh: Kepala Dinas"
        />
      </FormField>
      <FormField label="Pangkat / golongan" required>
        <Input
          className="h-9 text-xs"
          value={form.pangkat}
          onChange={(e) => setForm((f) => ({ ...f, pangkat: e.target.value }))}
          placeholder="Contoh: IV/a"
        />
      </FormField>
      <FormField label="No. HP" required>
        <Input
          className="h-9 text-xs"
          value={form.nohp}
          onChange={(e) => setForm((f) => ({ ...f, nohp: e.target.value }))}
          placeholder="081234567890"
        />
      </FormField>
    </FormDialog>
  )
}

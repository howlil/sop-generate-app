import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import type { KepalaOPD } from '@/lib/types/opd'
import type { KepalaFormState } from '@/hooks/useManajemenOPDState'
import type { OPD } from '@/lib/types/opd'

export interface KepalaOPDFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  form: KepalaFormState
  setForm: React.Dispatch<React.SetStateAction<KepalaFormState>>
  editingKepala: KepalaOPD | null
  selectedOPD: OPD | null
  onConfirm: () => void
}

export function KepalaOPDFormDialog({
  open,
  onOpenChange,
  title,
  description,
  form,
  setForm,
  onConfirm,
}: KepalaOPDFormDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel="Simpan"
      cancelLabel="Batal"
      onConfirm={onConfirm}
      confirmDisabled={!form.name}
      size="md"
    >
      <FormField label="Nama" required>
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
      <FormField label="Telepon">
        <Input
          className="h-9 text-xs"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="0812-xxxx-xxxx"
        />
      </FormField>
    </FormDialog>
  )
}

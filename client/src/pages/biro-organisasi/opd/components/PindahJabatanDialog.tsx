import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import type { PindahDialogPerson, PindahFormState } from "@/types/ui/organisasi"
import type { OPDOption as OPD, KepalaOPDRow as KepalaOPD } from './types'

export interface PindahJabatanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person: PindahDialogPerson | null
  form: PindahFormState
  setForm: React.Dispatch<React.SetStateAction<PindahFormState>>
  opdList: OPD[]
  getKepalaAktif: (opdId: string) => KepalaOPD | undefined
  onConfirm: () => void
  onClose: () => void
}

export function PindahJabatanDialog({
  open,
  onOpenChange,
  person,
  form,
  setForm,
  opdList,
  getKepalaAktif,
  onConfirm,
  onClose,
}: PindahJabatanDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) onClose()
      }}
      title="Pindah jabatan"
      description="Pindahkan kepala OPD ini ke OPD lain. Jabatan aktif saat ini (jika ada) akan berakhir; jabatan baru dimulai di OPD tujuan."
      confirmLabel="Simpan"
      cancelLabel="Batal"
      onConfirm={onConfirm}
      confirmDisabled={!form.opdId}
      size="md"
    >
      {person && (
        <>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs">
            <p className="font-medium text-gray-900">{person.name}</p>
            {person.nip && <p className="text-gray-600 font-mono">{person.nip}</p>}
            <p className="text-gray-600">{person.email}</p>
          </div>
          <FormField label="OPD tujuan" required>
            <Select
              value={form.opdId}
              onValueChange={(opdId) => setForm((f: PindahFormState) => ({ ...f, opdId }))}
              placeholder="Pilih OPD"
              options={opdList
                .filter((opd) => !getKepalaAktif(opd.id))
                .map((opd) => ({ value: opd.id, label: opd.name }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Hanya OPD yang belum memiliki kepala yang dapat dipilih.
            </p>
          </FormField>
        </>
      )}
    </FormDialog>
  )
}

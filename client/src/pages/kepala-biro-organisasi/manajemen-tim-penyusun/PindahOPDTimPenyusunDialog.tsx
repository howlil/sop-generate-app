/**
 * Dialog pindah OPD untuk Tim Penyusun.
 * Satu orang pindah ke OPD lain: record lama dinonaktifkan (endedAt), record baru dibuat di OPD tujuan.
 * Data SOP lama tetap bisa diakses per OPD (author nama tetap tercatat).
 */
import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import type { OPD } from '@/lib/types/opd'
import type { TimPenyusun } from '@/lib/types/tim'

export interface PindahOPDTimPenyusunDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tim: TimPenyusun | null
  opdTujuanId: string
  setOpdTujuanId: (id: string) => void
  opdList: OPD[]
  onConfirm: () => void
  onClose: () => void
}

export function PindahOPDTimPenyusunDialog({
  open,
  onOpenChange,
  tim,
  opdTujuanId,
  setOpdTujuanId,
  opdList,
  onConfirm,
  onClose,
}: PindahOPDTimPenyusunDialogProps) {
  const options = opdList
    .filter((opd) => opd.id !== tim?.opdId)
    .map((opd) => ({ value: opd.id, label: opd.name }))

  return (
    <FormDialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) onClose()
      }}
      title="Pindah OPD"
      description="Pindahkan tim penyusun ini ke OPD lain. Tugas di OPD saat ini akan berakhir; jabatan baru dimulai di OPD tujuan. Data SOP yang pernah disusun tetap tercatat per OPD."
      confirmLabel="Simpan"
      cancelLabel="Batal"
      onConfirm={onConfirm}
      confirmDisabled={!opdTujuanId}
      size="md"
    >
      {tim && (
        <>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs">
            <p className="font-medium text-gray-900">{tim.nama}</p>
            <p className="text-gray-600 font-mono">{tim.nip}</p>
            <p className="text-gray-600">{tim.email}</p>
            <p className="text-gray-500 mt-1">
              OPD saat ini: {opdList.find((o) => o.id === tim.opdId)?.name ?? tim.opdId}
            </p>
          </div>
          <FormField label="OPD tujuan" required>
            <Select
              value={opdTujuanId}
              onValueChange={setOpdTujuanId}
              placeholder="Pilih OPD"
              options={options}
            />
          </FormField>
        </>
      )}
    </FormDialog>
  )
}

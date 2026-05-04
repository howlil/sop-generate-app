import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DialogFooterActions } from '@/components/ui/dialog-footer-actions'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { KepalaFormState, PindahFormState } from '@/types/ui/organisasi'
import type { KepalaOpdDto } from '@/types/dto/kepala-opd.dto'
import type { OPDOption as OPD } from './types'

export interface KepalaOpdManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tab: 'edit' | 'pindah'
  onTabChange: (tab: 'edit' | 'pindah') => void
  editingSource: KepalaOpdDto | null
  opdList: OPD[]
  form: KepalaFormState
  setForm: React.Dispatch<React.SetStateAction<KepalaFormState>>
  pindahForm: PindahFormState
  setPindahForm: React.Dispatch<React.SetStateAction<PindahFormState>>
  canPickOpdAsDestination: (opdId: string) => boolean
  onConfirmEdit: () => void
  onConfirmPindah: () => void
}

export function KepalaOpdManageDialog({
  open,
  onOpenChange,
  tab,
  onTabChange,
  editingSource,
  opdList,
  form,
  setForm,
  pindahForm,
  setPindahForm,
  canPickOpdAsDestination,
  onConfirmEdit,
  onConfirmPindah,
}: KepalaOpdManageDialogProps) {
  const editValid =
    Boolean(
      form.name.trim() &&
        form.email.trim() &&
        form.jabatan.trim() &&
        form.pangkat.trim() &&
        form.phone.trim(),
    )
  const canPindah = editingSource?.isActive === true
  const pindahValid = Boolean(pindahForm.opdId && canPindah)
  const confirmDisabled = tab === 'edit' ? !editValid : !pindahValid
  const confirmLabel = tab === 'edit' ? 'Simpan Perubahan' : 'Pindahkan'
  const description =
    editingSource && opdList.find((o) => o.id === editingSource.opdId)
      ? `OPD saat ini: ${opdList.find((o) => o.id === editingSource.opdId)?.name}`
      : undefined

  const handleConfirm = () => {
    if (tab === 'edit') {
      onConfirmEdit()
    } else {
      onConfirmPindah()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-sm">Ubah Kepala OPD</DialogTitle>
          {description != null && (
            <DialogDescription className="text-xs">{description}</DialogDescription>
          )}
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as 'edit' | 'pindah')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="edit" className="text-xs">
              Edit data
            </TabsTrigger>
            <TabsTrigger value="pindah" className="text-xs" disabled={!canPindah}>
              Pindah OPD
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-3 mt-3">
            <FormField label="Status akun" required>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as 'AKTIF' | 'NONAKTIF' }))
                }
                options={[
                  { value: 'AKTIF', label: 'Aktif' },
                  { value: 'NONAKTIF', label: 'Nonaktif' },
                ]}
                placeholder="Status"
              />
            </FormField>
            <FormField label="Nama" required>
              <Input
                className="h-9 text-xs"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nama lengkap dengan gelar"
              />
            </FormField>
            <FormField label="NIP" required>
              <Input
                className="h-9 text-xs font-mono"
                value={form.nip}
                onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))}
                placeholder="NIP"
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
              />
            </FormField>
            <FormField label="Pangkat / golongan" required>
              <Input
                className="h-9 text-xs"
                value={form.pangkat}
                onChange={(e) => setForm((f) => ({ ...f, pangkat: e.target.value }))}
              />
            </FormField>
            <FormField label="No. HP" required>
              <Input
                className="h-9 text-xs"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="0812-xxxx-xxxx"
              />
            </FormField>
          </TabsContent>

          <TabsContent value="pindah" className="space-y-3 mt-3">
            {editingSource && (
              <>
                {!canPindah && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                    Akun nonaktif tidak dapat dipindahkan. Aktifkan kembali di tab Edit data.
                  </p>
                )}
                <FormField label="OPD tujuan" required>
                  <Select
                    value={pindahForm.opdId}
                    onValueChange={(opdId) =>
                      setPindahForm((f: PindahFormState) => ({ ...f, opdId }))
                    }
                    placeholder="Pilih OPD"
                    options={opdList
                      .filter((opd) => opd.id !== editingSource.opdId)
                      .filter((opd) => canPickOpdAsDestination(opd.id))
                      .map((opd) => ({ value: opd.id, label: opd.name }))}
                  />
                </FormField>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooterActions
          cancelLabel="Batal"
          confirmLabel={confirmLabel}
          onCancel={() => onOpenChange(false)}
          onConfirm={handleConfirm}
          confirmDisabled={confirmDisabled}
        />
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState } from 'react'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/cn'
import type { StatusTim } from '@/types/dto/tim.dto'

interface OPD {
  id: string
  name: string
}

export type PeranPenyusunApi = 'PENYUSUN' | 'PJ_PENYUSUN'

export interface PenyusunFormData {
  namaLengkap: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  nohp: string
  peranTim: PeranPenyusunApi
  /** Mode edit: dikirim lewat PATCH penyusun bersama field lain */
  statusAkun?: StatusTim
}

export type PenyusunFormDialogMode = 'create' | 'edit'

type EditDialogTab = 'data' | 'pindah'

export interface PenyusunFormDialogProps {
  mode: PenyusunFormDialogMode
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: PenyusunFormData
  setFormData: React.Dispatch<React.SetStateAction<PenyusunFormData>>
  createOpdId: string
  setCreateOpdId: (id: string) => void
  opdList: OPD[]
  isFormValid: boolean
  onConfirm: () => void
  confirmDisabled?: boolean
  confirmLabel?: string
  /** Tab Pindah OPD — OPD asal penyusun */
  editingOpdId?: string
  opdTujuanId?: string
  setOpdTujuanId?: (id: string) => void
  onConfirmPindah?: () => void
  pindahConfirmDisabled?: boolean
}

const PERAN_OPTIONS: { value: PeranPenyusunApi; label: string }[] = [
  { value: 'PENYUSUN', label: 'Penyusun' },
  { value: 'PJ_PENYUSUN', label: 'PJ Penyusun' },
]

/** Selaras design-style-guide: input compact, border gray-200 */
const inputFieldClass =
  'h-9 border-gray-200 text-xs placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500'

export function PenyusunFormDialog({
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
  confirmDisabled = false,
  confirmLabel,
  editingOpdId,
  opdTujuanId = '',
  setOpdTujuanId,
  onConfirmPindah,
  pindahConfirmDisabled = false,
}: PenyusunFormDialogProps) {
  const isCreate = mode === 'create'
  const [editTab, setEditTab] = useState<EditDialogTab>('data')

  useEffect(() => {
    if (open && !isCreate) {
      setEditTab('data')
    }
  }, [open, isCreate])

  const canPindahTab = (formData.statusAkun ?? 'AKTIF') === 'AKTIF'

  useEffect(() => {
    if (!canPindahTab && editTab === 'pindah') {
      setEditTab('data')
    }
  }, [canPindahTab, editTab])

  const pindahOptions = opdList
    .filter((opd) => opd.id !== editingOpdId)
    .map((opd) => ({ value: opd.id, label: opd.name }))

  const fieldsSection = (
    <>
      {!isCreate && (
        <FormField label="Status akun" required>
          <Select
            value={formData.statusAkun ?? 'AKTIF'}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, statusAkun: v as StatusTim }))
            }
            options={[
              { value: 'AKTIF', label: 'Aktif' },
              { value: 'NONAKTIF', label: 'Nonaktif' },
            ]}
            placeholder="Pilih status"
          />
        </FormField>
      )}
      <FormField label="Peran" required>
        <Select
          value={formData.peranTim}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, peranTim: v as PeranPenyusunApi }))
          }
          options={PERAN_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Pilih peran"
        />
      </FormField>
      <FormField label="Nama Lengkap" required>
        <Input
          className={inputFieldClass}
          placeholder="Contoh: Ahmad Pratama, S.Sos"
          value={formData.namaLengkap}
          onChange={(e) => setFormData((prev) => ({ ...prev, namaLengkap: e.target.value }))}
        />
      </FormField>
      <FormField label="NIP" required>
        <Input
          className={cn(inputFieldClass, 'font-mono')}
          placeholder="Contoh: 199203152020121001"
          value={formData.nip}
          onChange={(e) => setFormData((prev) => ({ ...prev, nip: e.target.value }))}
        />
      </FormField>
      <FormField label="Jabatan" required>
        <Input
          className={inputFieldClass}
          placeholder="Contoh: Kepala Seksi Organisasi"
          value={formData.jabatan}
          onChange={(e) => setFormData((prev) => ({ ...prev, jabatan: e.target.value }))}
        />
      </FormField>
      <FormField label="Pangkat / Golongan" required>
        <Input
          className={inputFieldClass}
          placeholder="Contoh: IV/a"
          value={formData.pangkat}
          onChange={(e) => setFormData((prev) => ({ ...prev, pangkat: e.target.value }))}
        />
      </FormField>
      <FormField label="Email" required>
        <Input
          type="email"
          className={inputFieldClass}
          placeholder="Contoh: ahmad@disdik.go.id"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        />
      </FormField>
      <FormField label="No. HP" required>
        <Input
          className={inputFieldClass}
          placeholder="Contoh: 081234567890"
          value={formData.nohp}
          onChange={(e) => setFormData((prev) => ({ ...prev, nohp: e.target.value }))}
        />
      </FormField>
    </>
  )

  const createForm = (
    <div className="space-y-3">
      <FormField label="OPD" required>
        <Select
          value={createOpdId}
          onValueChange={setCreateOpdId}
          options={opdList.map((o) => ({ value: o.id, label: o.name }))}
          placeholder="Pilih OPD"
        />
      </FormField>
      {fieldsSection}
    </div>
  )

  if (isCreate) {
    return (
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Tambah penyusun"
        description="Pilih OPD dan isi data pegawai. Sandi awal ditetapkan server."
        confirmLabel={confirmLabel ?? 'Simpan'}
        cancelLabel="Batal"
        onConfirm={onConfirm}
        confirmDisabled={!isFormValid || confirmDisabled}
        size="md"
        className="max-w-lg"
      >
        {createForm}
      </FormDialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-sm">Edit data penyusun</DialogTitle>
          <DialogDescription className="text-xs">
            Perbarui data, status akun, atau mutasi ke OPD lain (satu akun yang sama).
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={editTab}
          onValueChange={(v) => setEditTab(v as EditDialogTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="data" className="text-xs">
              Edit data
            </TabsTrigger>
            <TabsTrigger value="pindah" className="text-xs" disabled={!canPindahTab}>
              Pindah OPD
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-3 mt-3">
            {fieldsSection}
          </TabsContent>

          <TabsContent value="pindah" className="space-y-3 mt-3">
            {canPindahTab ? (
              <FormField label="OPD tujuan" required>
                <Select
                  value={opdTujuanId}
                  onValueChange={(v) => setOpdTujuanId?.(v)}
                  placeholder="Pilih OPD"
                  options={pindahOptions}
                />
              </FormField>
            ) : (
              <div className="rounded-lg border border-orange-200 bg-orange-100 px-3 py-2.5 text-xs text-orange-800">
                Penyusun nonaktif tidak dapat dipindahkan. Set status ke Aktif di tab{' '}
                <span className="font-medium text-orange-900">Edit data</span> lalu simpan.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:justify-end pt-3">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          {editTab === 'data' ? (
            <Button
              type="button"
              size="sm"
              disabled={!isFormValid || confirmDisabled}
              onClick={onConfirm}
            >
              {confirmLabel ?? 'Simpan Perubahan'}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={
                !canPindahTab ||
                !opdTujuanId ||
                pindahConfirmDisabled ||
                onConfirmPindah == null
              }
              onClick={() => onConfirmPindah?.()}
            >
              Pindahkan
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

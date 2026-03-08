/**
 * Dialog Buat SOP Baru — form judul, nomor, deskripsi + opsional salin dari template.
 * Dipakai di Manajemen SOP dan Daftar SOP (Kepala OPD).
 */
import { useState, useMemo } from 'react'
import { FileText, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/useUI'
import { getSopTemplates } from '@/lib/data/initiate-proyek'
import type { SOPTemplate } from '@/lib/types/sop'

export interface BuatSOPSuccessData {
  judul: string
  nomorSOP: string
  deskripsi: string
}

export interface BuatSOPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Dipanggil setelah SOP berhasil dibuat; data baru untuk ditambah ke daftar & navigasi ke detail. */
  onSuccess?: (data: BuatSOPSuccessData) => void
}

export function BuatSOPDialog({ open, onOpenChange, onSuccess }: BuatSOPDialogProps) {
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SOPTemplate | null>(null)
  const [templateSearchQuery, setTemplateSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    judulSOP: '',
    nomorSOP: '',
    deskripsi: '',
  })

  const { showToast } = useToast()
  const sopTemplates = getSopTemplates()
  const q = templateSearchQuery.trim().toLowerCase()
  const filteredTemplates = useMemo(
    () =>
      q
        ? sopTemplates.filter(
            (t) =>
              t.kode.toLowerCase().includes(q) ||
              t.judul.toLowerCase().includes(q) ||
              t.opd.toLowerCase().includes(q) ||
              (t.kategori && t.kategori.toLowerCase().includes(q)) ||
              (t.versi && String(t.versi).toLowerCase().includes(q))
          )
        : sopTemplates,
    [sopTemplates, q]
  )

  const handleCopyFromTemplate = () => {
    if (!selectedTemplate) return
    setFormData((prev) => ({
      ...prev,
      judulSOP: `${selectedTemplate.judul} (Adaptasi)`,
    }))
    setShowCopyDialog(false)
    setSelectedTemplate(null)
    setTemplateSearchQuery('')
    showToast(`Template SOP dari ${selectedTemplate.opd} berhasil disalin`)
  }

  const handleSubmit = () => {
    if (!formData.judulSOP?.trim() || !formData.nomorSOP?.trim() || !formData.deskripsi?.trim()) {
      showToast('Mohon lengkapi Judul SOP, Nomor SOP, dan Deskripsi', 'error')
      return
    }
    const data: BuatSOPSuccessData = {
      judul: formData.judulSOP.trim(),
      nomorSOP: formData.nomorSOP.trim(),
      deskripsi: formData.deskripsi.trim(),
    }
    showToast(`SOP "${data.judul}" berhasil dibuat.`)
    onSuccess?.(data)
    onOpenChange(false)
    setFormData({ judulSOP: '', nomorSOP: '', deskripsi: '' })
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFormData({ judulSOP: '', nomorSOP: '', deskripsi: '' })
      setShowCopyDialog(false)
      setSelectedTemplate(null)
      setTemplateSearchQuery('')
    }
    onOpenChange(next)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Buat SOP Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Isi judul, nomor, dan deskripsi. Setelah disimpan sebagai draft status menjadi Sedang Disusun.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <FormField label="Opsional" variant="muted">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 w-full sm:w-auto"
                onClick={() => setShowCopyDialog(true)}
              >
                <Copy className="w-3.5 h-3.5" />
                Salin dari SOP Lain
              </Button>
            </FormField>
            <FormField label="Judul SOP" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: SOP Pelayanan Penerimaan Siswa Baru"
                value={formData.judulSOP}
                onChange={(e) => setFormData((prev) => ({ ...prev, judulSOP: e.target.value }))}
              />
            </FormField>
            <FormField label="Nomor SOP" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: T.001/UN15/KP.01.00/2024"
                value={formData.nomorSOP}
                onChange={(e) => setFormData((prev) => ({ ...prev, nomorSOP: e.target.value }))}
              />
            </FormField>
            <FormField label="Deskripsi" required>
              <Textarea
                className="text-xs min-h-[80px]"
                placeholder="Deskripsi singkat atau ruang lingkup SOP"
                value={formData.deskripsi}
                onChange={(e) => setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))}
              />
            </FormField>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleOpenChange(false)}>
              Batal
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSubmit}>
              <FileText className="w-3.5 h-3.5" />
              Buat SOP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-sm">Salin Template dari SOP OPD Lain</DialogTitle>
            <DialogDescription className="text-xs">
              Pilih SOP dari OPD lain sebagai template. Metadata dasar akan disalin dan dapat Anda sesuaikan.
            </DialogDescription>
          </DialogHeader>
          <div className="pb-2">
            <SearchInput
              placeholder="Cari kode, judul, OPD, atau kategori..."
              value={templateSearchQuery}
              onChange={(e) => setTemplateSearchQuery(e.target.value)}
              className="w-full max-w-none"
              inputClassName="border border-gray-200 rounded-md bg-gray-50/50 focus-within:bg-white text-xs"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
            {filteredTemplates.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                {sopTemplates.length === 0
                  ? 'Belum ada template SOP.'
                  : 'Tidak ada template yang cocok dengan pencarian.'}
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {template.kode}
                      </Badge>
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-1">{template.judul}</h3>
                    <p className="text-xs text-gray-600">{template.opd}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setShowCopyDialog(false)
                setSelectedTemplate(null)
                setTemplateSearchQuery('')
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleCopyFromTemplate}
              disabled={!selectedTemplate}
            >
              <Copy className="w-3.5 h-3.5" />
              Gunakan Template Ini
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

import { useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { FileText, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Input } from '@/components/ui/input'
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
import { PageHeader } from '@/components/layout/PageHeader'
import { showToast } from '@/lib/stores'
import { SEED_TIM_PENYUSUN_OPTIONS } from '@/lib/seed/tim-penyusun-seed'
import { SEED_SOP_TEMPLATES } from '@/lib/seed/initiate-proyek-seed'
import type { SOPTemplate } from '@/lib/types/sop'
import { formatDatetime } from '@/utils/format-date'

export function InitiateProyekSOP() {
  const navigate = useNavigate()
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SOPTemplate | null>(null)

  const [formData, setFormData] = useState({
    judulSOP: '',
    nomorSOP: '',
    deskripsi: '',
    unitTerkait: '',
    penyusun: [] as string[],
  })

  // Default dari backend: otomatis terisi ketika proyek diinisiasi
  const waktuPenugasan = formatDatetime(new Date())
  // Terakhir diperbarui: di-update oleh backend ketika ada perubahan detail
  const terakhirDiperbarui = '-'

  const sopTemplates = SEED_SOP_TEMPLATES

  const timPenyusunOptions = SEED_TIM_PENYUSUN_OPTIONS

  const togglePenyusun = (nama: string) => {
    if (formData.penyusun.includes(nama)) {
      setFormData({ ...formData, penyusun: formData.penyusun.filter((p) => p !== nama) })
    } else {
      setFormData({ ...formData, penyusun: [...formData.penyusun, nama] })
    }
  }

  const handleCopyFromTemplate = () => {
    if (!selectedTemplate) return
    setFormData({
      ...formData,
      judulSOP: `${selectedTemplate.judul} (Adaptasi)`,
    })
    setShowCopyDialog(false)
    showToast(`Template SOP dari ${selectedTemplate.opd} berhasil disalin`)
  }

  const handleSubmit = () => {
    if (
      !formData.judulSOP?.trim() ||
      !formData.nomorSOP?.trim() ||
      !formData.deskripsi?.trim() ||
      !formData.unitTerkait?.trim() ||
      formData.penyusun.length === 0
    ) {
      showToast('Mohon lengkapi semua field: Judul SOP, Nomor SOP, Deskripsi, Unit terkait, dan Tim Penyusun', 'error')
      return
    }
    showToast(
      `Proyek SOP "${formData.judulSOP}" berhasil dibuat. Tim penyusun akan menerima notifikasi untuk mulai menyusun dokumen.`
    )
    setTimeout(() => navigate({ to: '/kepala-opd/daftar-sop' }), 1500)
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[
          { label: 'Daftar SOP', to: '/kepala-opd/daftar-sop' },
          { label: 'Initiate Proyek SOP' },
        ]}
        title="Inisiasi Proyek SOP"
        description="Buat proyek SOP baru dan tugaskan ke tim penyusun"
        leading={<BackButton to="/kepala-opd/daftar-sop" />}
      />

      <div className="bg-white rounded-md border border-gray-200 p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Informasi Proyek SOP</h2>
          <p className="text-xs text-gray-600">
            Isi judul, nomor, deskripsi, unit terkait, dan tugaskan tim penyusun. Waktu penugasan dan
            terakhir diperbarui diisi otomatis oleh sistem.
          </p>
        </div>

        <div className="space-y-3">
          <FormField label="Opsional" variant="muted">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setShowCopyDialog(true)}
              >
                <Copy className="w-3.5 h-3.5" />
                Salin dari SOP Lain
              </Button>
              <span className="text-xs text-gray-500">Isi form dari template SOP OPD lain</span>
            </div>
          </FormField>

          <FormField label="Judul SOP" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: SOP Pelayanan Penerimaan Siswa Baru"
              value={formData.judulSOP}
              onChange={(e) => setFormData({ ...formData, judulSOP: e.target.value })}
            />
          </FormField>

          <FormField label="Nomor SOP" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: T.001/UN15/KP.01.00/2024"
              value={formData.nomorSOP}
              onChange={(e) => setFormData({ ...formData, nomorSOP: e.target.value })}
            />
          </FormField>

          <FormField label="Deskripsi" required>
            <Textarea
              className="text-xs min-h-[80px]"
              placeholder="Deskripsi singkat atau ruang lingkup SOP"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />
          </FormField>

          <FormField label="Waktu penugasan">
            <Input
              className="h-9 text-xs bg-gray-50"
              readOnly
              value={waktuPenugasan}
              title="Otomatis terisi dari backend saat proyek diinisiasi"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default dari backend, otomatis terbuat ketika proyek diinisiasi
            </p>
          </FormField>

          <FormField label="Terakhir diperbarui">
            <Input
              className="h-9 text-xs bg-gray-50"
              readOnly
              value={terakhirDiperbarui}
              title="Diperbarui oleh sistem saat ada perubahan detail"
            />
            <p className="text-xs text-gray-500 mt-1">Diperbarui otomatis ketika ada update detail</p>
          </FormField>

          <FormField label="Tim penyusun yang ditugaskan" required>
            <div className="border border-gray-200 rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
              {timPenyusunOptions.map((tim) => (
                <label
                  key={tim.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-gray-300 mt-0.5"
                    checked={formData.penyusun.includes(tim.nama)}
                    onChange={() => togglePenyusun(tim.nama)}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">{tim.nama}</p>
                    <p className="text-xs text-gray-500">{tim.jabatan}</p>
                  </div>
                </label>
              ))}
            </div>
            {formData.penyusun.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.penyusun.map((nama) => (
                  <Badge key={nama} className="bg-blue-100 text-blue-700 text-xs border-0">
                    {nama}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.penyusun.length} tim penyusun dipilih. Mereka akan menerima notifikasi untuk
              mulai menyusun dokumen SOP.
            </p>
          </FormField>

          <FormField label="Unit terkait" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Seksi Kurikulum, Sub Bag TU (pisahkan dengan koma)"
              value={formData.unitTerkait}
              onChange={(e) => setFormData({ ...formData, unitTerkait: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Unit-unit yang terlibat dalam SOP ini</p>
          </FormField>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Link to="/kepala-opd/daftar-sop">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Batal
            </Button>
          </Link>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSubmit}>
            <FileText className="w-3.5 h-3.5" />
            Buat Proyek dan Tugaskan
          </Button>
        </div>
      </div>

      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Salin Template dari SOP OPD Lain</DialogTitle>
            <DialogDescription className="text-xs">
              Pilih SOP dari OPD lain sebagai template. Metadata dasar akan disalin dan dapat Anda
              sesuaikan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sopTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-3 border rounded-md cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {template.kode}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700 text-xs border-0">
                        {template.kategori}
                      </Badge>
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-1">{template.judul}</h3>
                    <p className="text-xs text-gray-600">{template.opd}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
                    v{template.versi}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setShowCopyDialog(false)
                setSelectedTemplate(null)
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
    </div>
  )
}

import { useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface SOPTemplate {
  id: string
  kode: string
  judul: string
  opd: string
  kategori: string
  versi: string
}

export function InitiateProyekSOP() {
  const navigate = useNavigate()
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SOPTemplate | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const [formData, setFormData] = useState({
    judulSOP: '',
    nomorSOP: '',
    deskripsi: '',
    unitTerkait: '',
    penyusun: [] as string[],
  })

  // Default dari backend: otomatis terisi ketika proyek diinisiasi
  const waktuPenugasan = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  // Terakhir diperbarui: di-update oleh backend ketika ada perubahan detail
  const terakhirDiperbarui = '-'

  const sopTemplates: SOPTemplate[] = [
    {
      id: '1',
      kode: 'SOP/DINKES/PLY/2026/001',
      judul: 'SOP Pelayanan Kesehatan Masyarakat',
      opd: 'Dinas Kesehatan',
      kategori: 'Pelayanan',
      versi: '2.0',
    },
    {
      id: '2',
      kode: 'SOP/DISHUB/PLY/2026/003',
      judul: 'SOP Penerbitan Izin Trayek',
      opd: 'Dinas Perhubungan',
      kategori: 'Pelayanan',
      versi: '1.5',
    },
    {
      id: '3',
      kode: 'SOP/DPUPR/ADM/2026/005',
      judul: 'SOP Pengadaan Barang dan Jasa',
      opd: 'Dinas PUPR',
      kategori: 'Administrasi',
      versi: '3.0',
    },
  ]

  const timPenyusunOptions = [
    { id: '1', nama: 'Ahmad Pratama, S.Sos', jabatan: 'Kepala Seksi Kurikulum' },
    { id: '2', nama: 'Siti Nurhaliza, S.Pd', jabatan: 'Staff Kurikulum' },
    { id: '3', nama: 'Budi Santoso, S.T', jabatan: 'Kepala TU' },
    { id: '4', nama: 'Rina Wijaya, S.Pd', jabatan: 'Staff Administrasi' },
  ]

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
    setToastMessage(`Template SOP dari ${selectedTemplate.opd} berhasil disalin`)
  }

  const handleSubmit = () => {
    if (
      !formData.judulSOP?.trim() ||
      !formData.nomorSOP?.trim() ||
      !formData.deskripsi?.trim() ||
      !formData.unitTerkait?.trim() ||
      formData.penyusun.length === 0
    ) {
      setToastMessage('Mohon lengkapi semua field: Judul SOP, Nomor SOP, Deskripsi, Unit terkait, dan Tim Penyusun')
      return
    }
    setToastMessage(
      `Proyek SOP "${formData.judulSOP}" berhasil dibuat. Tim penyusun akan menerima notifikasi untuk mulai menyusun dokumen.`
    )
    setTimeout(() => navigate({ to: '/kepala-opd/daftar-sop' }), 1500)
  }

  return (
    <div className="space-y-3">
      {toastMessage && (
        <div
          className={`rounded-md border px-4 py-2 text-xs ${
            toastMessage.includes('berhasil')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {toastMessage}
        </div>
      )}

      <PageHeader
        breadcrumb={[
          { label: 'Daftar SOP', to: '/kepala-opd/daftar-sop' },
          { label: 'Initiate Proyek SOP' },
        ]}
        title="Inisiasi Proyek SOP"
        description="Buat proyek SOP baru dan tugaskan ke tim penyusun"
        leading={
          <Link to="/kepala-opd/daftar-sop">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Kembali">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        }
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
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Opsional</Label>
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Judul SOP <span className="text-red-600">*</span>
            </Label>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: SOP Pelayanan Penerimaan Siswa Baru"
              value={formData.judulSOP}
              onChange={(e) => setFormData({ ...formData, judulSOP: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Nomor SOP <span className="text-red-600">*</span>
            </Label>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: T.001/UN15/KP.01.00/2024"
              value={formData.nomorSOP}
              onChange={(e) => setFormData({ ...formData, nomorSOP: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Deskripsi <span className="text-red-600">*</span>
            </Label>
            <Textarea
              className="text-xs min-h-[80px]"
              placeholder="Deskripsi singkat atau ruang lingkup SOP"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Waktu penugasan</Label>
            <Input
              className="h-9 text-xs bg-gray-50"
              readOnly
              value={waktuPenugasan}
              title="Otomatis terisi dari backend saat proyek diinisiasi"
            />
            <p className="text-xs text-gray-500">
              Default dari backend, otomatis terbuat ketika proyek diinisiasi
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Terakhir diperbarui</Label>
            <Input
              className="h-9 text-xs bg-gray-50"
              readOnly
              value={terakhirDiperbarui}
              title="Diperbarui oleh sistem saat ada perubahan detail"
            />
            <p className="text-xs text-gray-500">Diperbarui otomatis ketika ada update detail</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Tim penyusun yang ditugaskan <span className="text-red-600">*</span>
            </Label>
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
            <p className="text-xs text-gray-500">
              {formData.penyusun.length} tim penyusun dipilih. Mereka akan menerima notifikasi untuk
              mulai menyusun dokumen SOP.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Unit terkait <span className="text-red-600">*</span>
            </Label>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Seksi Kurikulum, Sub Bag TU (pisahkan dengan koma)"
              value={formData.unitTerkait}
              onChange={(e) => setFormData({ ...formData, unitTerkait: e.target.value })}
            />
            <p className="text-xs text-gray-500">Unit-unit yang terlibat dalam SOP ini</p>
          </div>
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

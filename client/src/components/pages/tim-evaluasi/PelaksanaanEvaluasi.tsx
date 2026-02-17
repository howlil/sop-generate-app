import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  Save,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  ArrowLeft,
  List,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Building,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/layout/PageHeader'
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

interface Temuan {
  id: string
  bagianSOP: string
  kategori: 'minor' | 'major' | 'critical'
  temuan: string
  referensiAturan: string
  rekomendasi: string
}

export function PelaksanaanEvaluasi() {
  const { id } = useParams({ from: '/tim-evaluasi/pelaksanaan/$id' })
  const navigate = useNavigate()

  const penugasanInfo = {
    id: id ?? '1',
    kode: 'TUG-EVL-012/2026',
    opd: 'Dinas Pendidikan',
    sop: 'SOP Penerimaan Siswa Baru 2026',
    kodeSOP: 'SOP/DISDIK/PLY/2026/001',
    jenis: 'Evaluasi Rutin',
  }

  const [temuanList, setTemuanList] = useState<Temuan[]>([])
  const [kesimpulan, setKesimpulan] = useState('')
  const [rekomendasi, setRekomendasi] = useState('')
  const [statusEvaluasi, setStatusEvaluasi] = useState<'Sesuai' | 'Tidak Sesuai' | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  useEffect(() => {
    if (!id) return
    const raw = localStorage.getItem(`evaluasi_draft_${id}`)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data.temuanList) setTemuanList(data.temuanList)
        if (data.kesimpulan) setKesimpulan(data.kesimpulan)
        if (data.rekomendasi) setRekomendasi(data.rekomendasi)
        if (data.statusEvaluasi) setStatusEvaluasi(data.statusEvaluasi)
      } catch {
        // ignore
      }
    }
  }, [id])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const bagianSOPOptions = [
    '1. Tujuan',
    '2. Ruang Lingkup',
    '3. Definisi',
    '4. Dasar Hukum',
    '5. Persyaratan',
    '6. Prosedur Kerja',
    '7. Diagram Alir',
    '8. Lampiran',
    'Umum',
  ]

  const addTemuan = () => {
    setTemuanList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        bagianSOP: '',
        kategori: 'minor',
        temuan: '',
        referensiAturan: '',
        rekomendasi: '',
      },
    ])
  }

  const removeTemuan = (tid: string) => {
    setTemuanList((prev) => prev.filter((t) => t.id !== tid))
  }

  const updateTemuan = (tid: string, field: keyof Temuan, value: string) => {
    setTemuanList((prev) =>
      prev.map((t) => (t.id === tid ? { ...t, [field]: value } : t))
    )
  }

  const getKategoriColor = (kategori: string) => {
    switch (kategori) {
      case 'minor':
        return 'bg-yellow-100 text-yellow-700'
      case 'major':
        return 'bg-orange-100 text-orange-700'
      case 'critical':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleSaveDraft = () => {
    if (!id) return
    localStorage.setItem(
      `evaluasi_draft_${id}`,
      JSON.stringify({
        temuanList,
        kesimpulan,
        rekomendasi,
        statusEvaluasi,
      })
    )
    setToast({ type: 'success', message: 'Draft evaluasi berhasil disimpan' })
  }

  const handleSubmit = () => {
    if (!statusEvaluasi) {
      setToast({ type: 'error', message: 'Silakan tetapkan status evaluasi terlebih dahulu' })
      return
    }
    if (statusEvaluasi === 'Tidak Sesuai' && temuanList.length === 0) {
      setToast({ type: 'error', message: 'Status "Tidak Sesuai" harus memiliki minimal 1 temuan' })
      return
    }
    if (!kesimpulan.trim()) {
      setToast({ type: 'error', message: 'Kesimpulan evaluasi harus diisi' })
      return
    }
    setToast({ type: 'success', message: 'Hasil evaluasi berhasil dikirim ke Biro Organisasi' })
    setIsSubmitOpen(false)
    setTimeout(() => {
      navigate({ to: '/tim-evaluasi/penugasan' })
    }, 1500)
  }

  const isFormComplete = statusEvaluasi !== null && kesimpulan.trim() !== ''

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0">
      <PageHeader
        breadcrumb={[
          { label: 'Penugasan Evaluasi', to: '/tim-evaluasi/penugasan' },
          { label: 'Pelaksanaan Evaluasi' },
        ]}
        title={penugasanInfo.sop}
        description={`${penugasanInfo.kodeSOP} • ${penugasanInfo.opd}`}
        leading={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate({ to: '/tim-evaluasi/penugasan' })}
            title="Kembali ke Penugasan"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleSaveDraft}>
              <Save className="w-3.5 h-3.5" /> Simpan Draft
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setIsSubmitOpen(true)} disabled={!isFormComplete}>
              <Send className="w-3.5 h-3.5" /> Kirim Hasil
            </Button>
          </div>
        }
      />

      {toast && (
        <div
          className={`flex-shrink-0 rounded-md border p-3 text-xs ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Satu blok: info penugasan + 3 panel (workspace seperti Detail Biro) */}
      <div className="flex-1 min-h-0 rounded-lg border border-gray-200 overflow-hidden bg-white flex flex-col">
        {/* Bagian atas: informasi penugasan */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Informasi Penugasan</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">{penugasanInfo.opd}</span>
            </div>
            <Badge variant="outline" className="text-xs font-mono">{penugasanInfo.kode}</Badge>
            <Badge className="bg-purple-100 text-purple-700 text-xs border-0">{penugasanInfo.jenis}</Badge>
          </div>
          <p className="text-xs text-gray-600 mt-2">{penugasanInfo.sop}</p>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{penugasanInfo.kodeSOP}</p>
        </div>

        {/* Tiga panel: Daftar SOP | Preview SOP | Form Evaluasi */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Kiri: Daftar SOP (bisa minimize) */}
          <div
            className={`flex flex-col flex-shrink-0 border-r border-gray-200 bg-white transition-[width] duration-200 overflow-hidden ${
              leftPanelCollapsed ? 'w-12' : 'w-[min(240px,20%)] min-w-[180px]'
            }`}
          >
            {leftPanelCollapsed ? (
              <button
                type="button"
                onClick={() => setLeftPanelCollapsed(false)}
                className="flex flex-col items-center justify-center flex-1 py-4 gap-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Tampilkan daftar SOP"
              >
                <List className="w-5 h-5" />
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between gap-1 p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-gray-700 truncate">Daftar SOP</h3>
                    <span className="text-[10px] text-gray-500">1 dokumen</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => setLeftPanelCollapsed(true)} title="Sembunyikan panel">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 min-h-0">
                  <div className="p-2 rounded-md border border-blue-200 bg-blue-50 text-xs">
                    <span className="block font-medium text-gray-900 truncate" title={penugasanInfo.sop}>{penugasanInfo.sop}</span>
                    <span className="block text-[10px] text-gray-500 font-mono mt-0.5">{penugasanInfo.kodeSOP}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tengah: Preview SOP */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-xs font-semibold text-gray-700">Preview SOP</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{penugasanInfo.sop}</p>
                  <p className="text-xs text-gray-500 font-mono">{penugasanInfo.kodeSOP}</p>
                </div>
                <div className="mt-4 border border-dashed border-gray-200 rounded-md p-8 text-center bg-gray-50/50">
                  <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-500">Preview dokumen SOP</p>
                  <p className="text-[10px] text-gray-400 mt-1">Dokumen dapat dilampirkan atau ditautkan di sini</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kanan: Form Evaluasi (bisa minimize) */}
          <div
            className={`flex flex-col flex-shrink-0 bg-white transition-[width] duration-200 overflow-hidden ${
              rightPanelCollapsed ? 'w-12' : 'w-[min(380px,33%)] min-w-[280px]'
            }`}
          >
            {rightPanelCollapsed ? (
              <button
                type="button"
                onClick={() => setRightPanelCollapsed(false)}
                className="flex flex-col items-center justify-center flex-1 py-4 gap-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Tampilkan form evaluasi"
              >
                <MessageSquare className="w-5 h-5" />
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between gap-1 p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                  <h3 className="text-xs font-semibold text-gray-700 truncate">Form Evaluasi</h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => setRightPanelCollapsed(true)} title="Sembunyikan panel">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
                  {/* Status Hasil Evaluasi */}
                  <div>
                    <Label className="text-xs font-semibold text-gray-900">Status Hasil Evaluasi *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        type="button"
                        className={`p-3 rounded-md border transition-all ${
                          statusEvaluasi === 'Sesuai' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => setStatusEvaluasi('Sesuai')}
                      >
                        <CheckCircle className={`w-6 h-6 mx-auto mb-1 ${statusEvaluasi === 'Sesuai' ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-xs font-semibold block ${statusEvaluasi === 'Sesuai' ? 'text-green-600' : 'text-gray-700'}`}>Sesuai</span>
                      </button>
                      <button
                        type="button"
                        className={`p-3 rounded-md border transition-all ${
                          statusEvaluasi === 'Tidak Sesuai' ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => setStatusEvaluasi('Tidak Sesuai')}
                      >
                        <XCircle className={`w-6 h-6 mx-auto mb-1 ${statusEvaluasi === 'Tidak Sesuai' ? 'text-red-600' : 'text-gray-400'}`} />
                        <span className={`text-xs font-semibold block ${statusEvaluasi === 'Tidak Sesuai' ? 'text-red-600' : 'text-gray-700'}`}>Tidak Sesuai</span>
                      </button>
                    </div>
                    {statusEvaluasi === 'Tidak Sesuai' && temuanList.length === 0 && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-800">Minimal 1 temuan wajib untuk status Tidak Sesuai.</p>
                      </div>
                    )}
                  </div>

                  {/* Temuan */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold text-gray-900">Temuan Evaluasi</Label>
                      <Button size="sm" className="h-7 text-[10px] gap-1 px-2" onClick={addTemuan}>
                        <Plus className="w-3 h-3" /> Tambah
                      </Button>
                    </div>
                    {temuanList.length === 0 ? (
                      <div className="py-6 border border-dashed border-gray-200 rounded-md bg-gray-50 text-center">
                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <p className="text-[10px] text-gray-500">Belum ada temuan</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {temuanList.map((temuan) => (
                          <div key={temuan.id} className="border border-gray-200 rounded-md p-2 bg-gray-50">
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <select
                                className="h-6 flex-1 rounded border border-gray-200 px-1.5 text-[10px] bg-white"
                                value={temuan.kategori}
                                onChange={(e) => updateTemuan(temuan.id, 'kategori', e.target.value as Temuan['kategori'])}
                              >
                                <option value="minor">Minor</option>
                                <option value="major">Major</option>
                                <option value="critical">Critical</option>
                              </select>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => removeTemuan(temuan.id)}>
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                            <select
                              className="h-7 w-full rounded border border-gray-200 px-1.5 text-[10px] bg-white mb-1.5"
                              value={temuan.bagianSOP}
                              onChange={(e) => updateTemuan(temuan.id, 'bagianSOP', e.target.value)}
                            >
                              <option value="">Bagian SOP</option>
                              {bagianSOPOptions.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                            <Textarea
                              className="text-[10px] min-h-[50px] bg-white mb-1.5"
                              placeholder="Deskripsi temuan..."
                              value={temuan.temuan}
                              onChange={(e) => updateTemuan(temuan.id, 'temuan', e.target.value)}
                            />
                            <Input
                              className="h-7 text-[10px] bg-white mb-1.5"
                              placeholder="Referensi aturan"
                              value={temuan.referensiAturan}
                              onChange={(e) => updateTemuan(temuan.id, 'referensiAturan', e.target.value)}
                            />
                            <Textarea
                              className="text-[10px] min-h-[40px] bg-white"
                              placeholder="Rekomendasi perbaikan..."
                              value={temuan.rekomendasi}
                              onChange={(e) => updateTemuan(temuan.id, 'rekomendasi', e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Kesimpulan & Rekomendasi */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-900">Kesimpulan Evaluasi *</Label>
                    <Textarea
                      className="text-xs min-h-[80px]"
                      placeholder="Kesimpulan umum evaluasi..."
                      value={kesimpulan}
                      onChange={(e) => setKesimpulan(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-900">Rekomendasi Umum</Label>
                    <Textarea
                      className="text-xs min-h-[60px]"
                      placeholder="Rekomendasi (opsional)..."
                      value={rekomendasi}
                      onChange={(e) => setRekomendasi(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs w-full gap-1.5" onClick={handleSaveDraft}>
                      <Save className="w-3.5 h-3.5" /> Simpan Draft
                    </Button>
                    <Button size="sm" className="h-8 text-xs w-full gap-1.5" onClick={() => setIsSubmitOpen(true)} disabled={!isFormComplete}>
                      <Send className="w-3.5 h-3.5" /> Kirim Hasil ke Biro
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Preview Hasil Evaluasi</DialogTitle>
            <DialogDescription className="text-xs">{penugasanInfo.sop}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div
              className={`p-4 rounded-md ${
                statusEvaluasi === 'Sesuai'
                  ? 'bg-green-50 border border-green-200'
                  : statusEvaluasi === 'Tidak Sesuai'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {statusEvaluasi === 'Sesuai' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : statusEvaluasi === 'Tidak Sesuai' ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                )}
                <span className={`text-sm font-semibold ${statusEvaluasi === 'Sesuai' ? 'text-green-700' : statusEvaluasi === 'Tidak Sesuai' ? 'text-red-700' : 'text-gray-700'}`}>
                  Status: {statusEvaluasi || 'Belum Ditetapkan'}
                </span>
              </div>
              {kesimpulan && (
                <div>
                  <p className="text-xs font-semibold text-gray-900 mb-1">Kesimpulan:</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{kesimpulan}</p>
                </div>
              )}
            </div>
            {temuanList.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs font-semibold text-gray-900 mb-3">Temuan ({temuanList.length}):</p>
                <div className="space-y-3">
                  {temuanList.map((t, idx) => (
                    <div key={t.id} className="p-3 bg-white rounded-md border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                        <Badge className={`text-xs border-0 ${getKategoriColor(t.kategori)}`}>{t.kategori}</Badge>
                        {t.bagianSOP && <Badge variant="secondary" className="text-xs">{t.bagianSOP}</Badge>}
                      </div>
                      <p className="text-xs text-gray-900 mb-1"><strong>Temuan:</strong> {t.temuan}</p>
                      {t.referensiAturan && <p className="text-xs text-gray-700 mb-1"><strong>Referensi:</strong> {t.referensiAturan}</p>}
                      <p className="text-xs text-gray-700"><strong>Rekomendasi:</strong> {t.rekomendasi}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {rekomendasi && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs font-semibold text-gray-900 mb-1">Rekomendasi Umum:</p>
                <p className="text-xs text-gray-700 leading-relaxed">{rekomendasi}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button size="sm" className="h-8 text-xs" onClick={() => setIsPreviewOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Kirim */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Konfirmasi Kirim Hasil Evaluasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className={`p-3 rounded-md ${statusEvaluasi === 'Sesuai' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-xs mb-1 text-gray-700">Status:</p>
              <p className={`text-sm font-semibold ${statusEvaluasi === 'Sesuai' ? 'text-green-600' : 'text-red-600'}`}>{statusEvaluasi}</p>
              {temuanList.length > 0 && <p className="text-xs text-gray-700 mt-1">{temuanList.length} temuan</p>}
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-800">
                <strong>Perhatian:</strong> Setelah dikirim, hasil evaluasi tidak dapat diubah.
              </p>
            </div>
            <p className="text-xs text-gray-700">
              Hasil akan dikirim ke <strong>Biro Organisasi</strong> dan <strong>{penugasanInfo.opd}</strong>.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsSubmitOpen(false)}>Batal</Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSubmit}>
              <Send className="w-3.5 h-3.5" /> Ya, Kirim Hasil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  Save,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  List,
  MessageSquare,
  Building,
} from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { FormField } from '@/components/ui/form-field'
import { PageHeader } from '@/components/layout/PageHeader'
import { DetailWorkspace } from '@/components/layout/DetailWorkspace'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { showToast } from '@/lib/stores'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getPenugasanById, updatePenugasan } from '@/lib/stores/penugasan-store'

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

  const [komentarEvaluasi, setKomentarEvaluasi] = useState('')
  const [statusEvaluasi, setStatusEvaluasi] = useState<'Sesuai' | 'Revisi Biro' | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  useEffect(() => {
    if (!id) return
    const fromStore = getPenugasanById(id)
    const sopItem = fromStore?.sopList?.find(
      (s) => s.nama === penugasanInfo.sop || s.nomor === penugasanInfo.kodeSOP
    )
    if (sopItem?.status === 'Sesuai' || sopItem?.status === 'Revisi Biro') {
      setStatusEvaluasi(sopItem.status)
      if (sopItem.catatan) setKomentarEvaluasi(sopItem.catatan)
      return
    }
    const raw = localStorage.getItem(`evaluasi_draft_${id}`)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data.komentarEvaluasi) setKomentarEvaluasi(data.komentarEvaluasi)
        if (data.statusEvaluasi) setStatusEvaluasi(data.statusEvaluasi)
      } catch {
        // ignore
      }
    }
  }, [id])

  const handleSaveDraft = () => {
    if (!id) return
    localStorage.setItem(
      `evaluasi_draft_${id}`,
      JSON.stringify({
        komentarEvaluasi,
        statusEvaluasi,
      })
    )
    showToast('Draft evaluasi berhasil disimpan')
  }

  const handleSubmit = () => {
    if (!statusEvaluasi) {
      showToast('Silakan tetapkan status evaluasi terlebih dahulu', 'error')
      return
    }
    if (statusEvaluasi === 'Revisi Biro' && !komentarEvaluasi.trim()) {
      showToast('Status "Revisi Biro" wajib diisi komentar evaluasi', 'error')
      return
    }
    const penugasan = id ? getPenugasanById(id) : undefined
    if (penugasan?.sopList?.length) {
      const updatedSopList = penugasan.sopList.map((sop) => {
        const isCurrentSop = sop.nama === penugasanInfo.sop || sop.nomor === penugasanInfo.kodeSOP
        if (!isCurrentSop) return sop
        return {
          ...sop,
          status: statusEvaluasi,
          catatan: komentarEvaluasi.trim() || undefined,
        }
      })
      updatePenugasan(id!, {
        sopList: updatedSopList,
        status: 'Selesai',
        tanggalEvaluasi: new Date().toISOString().split('T')[0],
      })
    }
    showToast('Hasil evaluasi berhasil dikirim ke Biro Organisasi')
    setIsSubmitOpen(false)
    setTimeout(() => {
      navigate({ to: '/tim-evaluasi/penugasan' })
    }, 1500)
  }

  const isFormComplete = statusEvaluasi !== null && (statusEvaluasi !== 'Revisi Biro' || komentarEvaluasi.trim() !== '')

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
          <BackButton size="icon" onClick={() => navigate({ to: '/tim-evaluasi/penugasan' })} />
        }
        actions={
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="w-3.5 h-3.5" /> Preview
          </Button>
        }
      />

      <DetailWorkspace
        header={
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Informasi Penugasan</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="font-medium text-gray-900">{penugasanInfo.opd}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">{penugasanInfo.sop}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{penugasanInfo.kodeSOP}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleSaveDraft}>
                <Save className="w-3.5 h-3.5" /> Simpan Draft
              </Button>
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setIsSubmitOpen(true)} disabled={!isFormComplete}>
                <Send className="w-3.5 h-3.5" /> Kirim Hasil ke Biro
              </Button>
            </div>
          </div>
        }
        leftPanel={
          <CollapsibleSidePanel
            side="left"
            collapsed={leftPanelCollapsed}
            onCollapsedChange={setLeftPanelCollapsed}
            widthExpanded="w-[min(240px,20%)] min-w-[180px]"
            title="Daftar SOP"
            subtitle="1 dokumen"
            collapseButtonLabel="Daftar"
            collapseButtonIcon={<List className="w-5 h-5" />}
          >
            <SOPListCard
              items={[{ id: penugasanInfo.id, nama: penugasanInfo.sop, nomor: penugasanInfo.kodeSOP }]}
            />
          </CollapsibleSidePanel>
        }
        main={
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-xs font-semibold text-gray-700">Preview SOP</h3>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <SOPPreviewTemplate name={penugasanInfo.sop} number={penugasanInfo.kodeSOP} />
            </div>
          </div>
        }
        rightPanel={
          <CollapsibleSidePanel
            side="right"
            collapsed={rightPanelCollapsed}
            onCollapsedChange={setRightPanelCollapsed}
            widthExpanded="w-[min(380px,33%)] min-w-[280px]"
            title="Form Evaluasi"
            collapseButtonLabel="Form"
            collapseButtonIcon={<MessageSquare className="w-5 h-5" />}
          >
            <div className="p-3 space-y-4">
              <FormField label="Status Hasil Evaluasi" required>
                <div className="grid grid-cols-2 gap-2">
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
                      statusEvaluasi === 'Revisi Biro' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setStatusEvaluasi('Revisi Biro')}
                  >
                    <XCircle className={`w-6 h-6 mx-auto mb-1 ${statusEvaluasi === 'Revisi Biro' ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-semibold block ${statusEvaluasi === 'Revisi Biro' ? 'text-amber-600' : 'text-gray-700'}`}>Revisi Biro</span>
                  </button>
                </div>
                {statusEvaluasi === 'Revisi Biro' && !komentarEvaluasi.trim() && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800">Komentar evaluasi wajib untuk status Revisi Biro.</p>
                  </div>
                )}
              </FormField>

              <FormField label="Komentar Evaluasi">
                <Textarea
                  className="text-xs min-h-[80px]"
                  placeholder="Komentar evaluasi (wajib jika status Revisi Biro)..."
                  value={komentarEvaluasi}
                  onChange={(e) => setKomentarEvaluasi(e.target.value)}
                />
              </FormField>
            </div>
          </CollapsibleSidePanel>
        }
      />

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
                  : statusEvaluasi === 'Revisi Biro'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {statusEvaluasi === 'Sesuai' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : statusEvaluasi === 'Revisi Biro' ? (
                  <XCircle className="w-5 h-5 text-amber-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                )}
                <span className={`text-sm font-semibold ${statusEvaluasi === 'Sesuai' ? 'text-green-700' : statusEvaluasi === 'Revisi Biro' ? 'text-amber-700' : 'text-gray-700'}`}>
                  Status: {statusEvaluasi || 'Belum Ditetapkan'}
                </span>
              </div>
              </div>
            {komentarEvaluasi.trim() && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <p className="text-xs font-semibold text-gray-900 mb-1">Komentar Evaluasi:</p>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{komentarEvaluasi}</p>
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
            <div className={`p-3 rounded-md ${statusEvaluasi === 'Sesuai' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className="text-xs mb-1 text-gray-700">Status:</p>
              <p className={`text-sm font-semibold ${statusEvaluasi === 'Sesuai' ? 'text-green-600' : 'text-amber-600'}`}>{statusEvaluasi}</p>
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

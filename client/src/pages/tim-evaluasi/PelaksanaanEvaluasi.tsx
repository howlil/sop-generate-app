import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  Save,
  Send,
  Printer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  List,
  MessageSquare,
} from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { FormField } from '@/components/ui/form-field'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { useToast, useCollapsiblePanels } from '@/hooks/useUI'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { InfoCard } from '@/components/ui/info-card'
import type { StatusSOP } from '@/lib/types/sop'
import { usePenugasanDetail } from '@/hooks/usePenugasan'
import { useSopStatus } from '@/hooks/useSopStatus'
import { getPenugasanDetailById } from '@/lib/data/penugasan-detail'
import { useEvaluasiDraft } from '@/hooks/useEvaluasiDraft'
import { ROUTES } from '@/lib/constants/routes'

export function PelaksanaanEvaluasi() {
  const { id } = useParams({ from: '/tim-evaluasi/pelaksanaan/$id' })
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { penugasan: penugasanFromStore, updatePenugasan } = usePenugasanDetail(id)
  const { setSopStatusOverride } = useSopStatus()

  const seedDetail = getPenugasanDetailById(id ?? '1')
  const penugasanInfo = {
    id: seedDetail?.id ?? id ?? '1',
    kode: seedDetail?.kodePenugasan ?? '-',
    opd: seedDetail?.opd ?? '-',
    sop: seedDetail?.sop ?? '-',
    kodeSOP: seedDetail?.kodeSOP ?? '-',
    jenis: seedDetail?.jenis ?? 'Evaluasi Rutin',
  }

  const {
    komentarEvaluasi, setKomentarEvaluasi,
    statusEvaluasi, setStatusEvaluasi,
    saveDraft: handleSaveDraft,
  } = useEvaluasiDraft(id)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const { leftCollapsed: leftPanelCollapsed, setLeftCollapsed: setLeftPanelCollapsed, rightCollapsed: rightPanelCollapsed, setRightCollapsed: setRightPanelCollapsed } = useCollapsiblePanels()

  const handleSubmit = () => {
    if (!statusEvaluasi) {
      showToast('Silakan tetapkan status evaluasi terlebih dahulu', 'error')
      return
    }
    if (statusEvaluasi === 'Revisi Biro' && !komentarEvaluasi.trim()) {
      showToast('Status "Revisi Biro" wajib diisi komentar evaluasi', 'error')
      return
    }
    const penugasan = penugasanFromStore
    if (penugasan?.sopList?.length) {
      const sopStatusBaru: StatusSOP =
        statusEvaluasi === 'Sesuai' ? 'Dievaluasi Tim Evaluasi' : 'Revisi dari Tim Evaluasi'
      const updatedSopList = penugasan.sopList.map((sop) => {
        const isCurrentSop = sop.nama === penugasanInfo.sop || sop.nomor === penugasanInfo.kodeSOP
        if (!isCurrentSop) return sop
        if (sop.id) setSopStatusOverride(sop.id, sopStatusBaru)
        return {
          ...sop,
          status: statusEvaluasi,
          catatan: komentarEvaluasi.trim() || undefined,
        }
      })
      updatePenugasan({
        sopList: updatedSopList,
        status: 'Selesai',
        tanggalEvaluasi: new Date().toISOString().split('T')[0],
      })
    }
    showToast('Hasil evaluasi berhasil dikirim. Status SOP diperbarui.')
    setIsSubmitOpen(false)
    setTimeout(() => {
      navigate({ to: ROUTES.TIM_EVALUASI.PENUGASAN })
    }, 1500)
  }

  const isFormComplete = statusEvaluasi !== null && (statusEvaluasi !== 'Revisi Biro' || komentarEvaluasi.trim() !== '')

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          { label: 'Evaluasi SOP', to: ROUTES.TIM_EVALUASI.PENUGASAN },
          { label: 'Evaluasi SOP' },
        ]}
        title={penugasanInfo.sop}
        description={`${penugasanInfo.kodeSOP} • ${penugasanInfo.opd}`}
        backTo={ROUTES.TIM_EVALUASI.PENUGASAN}
        backSize="icon"
        header={
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Informasi evaluasi</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50" onClick={() => window.print()}>
                  <Printer className="w-3.5 h-3.5" /> Print SOP
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50" onClick={handleSaveDraft}>
                  <Save className="w-3.5 h-3.5" /> Simpan Draft
                </Button>
                <Button size="sm" className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5" onClick={() => setIsSubmitOpen(true)} disabled={!isFormComplete}>
                  <Send className="w-3.5 h-3.5" /> Kirim Hasil ke Biro
                </Button>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-medium text-gray-900">{penugasanInfo.opd}</span>
              <span className="text-gray-700">{penugasanInfo.sop}</span>
              <span className="text-gray-500 font-mono">{penugasanInfo.kodeSOP}</span>
            </div>
          </>
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
                  <InfoCard variant="warning" className="mt-2 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800">Komentar evaluasi wajib untuk status Revisi Biro.</p>
                  </InfoCard>
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

      {/* Dialog Konfirmasi Kirim */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Konfirmasi Kirim Hasil Evaluasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <InfoCard variant={statusEvaluasi === 'Sesuai' ? 'success' : 'warning'}>
              <p className="text-xs mb-1 text-gray-700">Status:</p>
              <p className={`text-sm font-semibold ${statusEvaluasi === 'Sesuai' ? 'text-green-600' : 'text-amber-600'}`}>{statusEvaluasi}</p>
            </InfoCard>
            <InfoCard variant="warning">
              <p className="text-xs text-amber-800">
                <strong>Perhatian:</strong> Setelah dikirim, hasil evaluasi tidak dapat diubah.
              </p>
            </InfoCard>
            <p className="text-xs text-gray-700">
              Status SOP akan diperbarui menjadi <strong>{statusEvaluasi === 'Sesuai' ? 'Dievaluasi Tim Evaluasi' : 'Revisi dari Tim Evaluasi'}</strong>. Hasil tercatat untuk verifikasi Biro (Berita Acara).
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
    </>
  )
}

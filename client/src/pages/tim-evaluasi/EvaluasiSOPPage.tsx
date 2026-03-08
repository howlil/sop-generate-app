/**
 * Halaman evaluasi SOP oleh Tim Evaluasi (langsung per SOP, tanpa penugasan).
 * Hasil: Sesuai → status SOP "Siap Diverifikasi"; Revisi Biro → "Revisi dari Tim Evaluasi".
 */
import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  Save,
  Send,
  Printer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { FormField } from '@/components/ui/form-field'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { InfoCard } from '@/components/ui/info-card'
import { useEvaluasiDraft } from '@/hooks/useEvaluasiDraft'
import { useToast, useCollapsiblePanels } from '@/hooks/useUI'
import { ROUTES } from '@/lib/constants/routes'
import { STATUS_HASIL_EVALUASI } from '@/lib/constants/evaluasi'
import { getStatusSopAfterEvaluasi } from '@/lib/domain/evaluasi'
import { getInitialSopDaftarList } from '@/lib/data/sop-daftar'
import { useSopStatus } from '@/hooks/useSopStatus'

export function EvaluasiSOPPage() {
  const { sopId } = useParams({ from: '/tim-evaluasi/evaluasi/$sopId' })
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { mergeSopStatus, setSopStatusOverride } = useSopStatus()
  const [sopList] = useState(() => getInitialSopDaftarList())
  const mergedList = useMemo(() => mergeSopStatus(sopList), [sopList, mergeSopStatus])
  const sop = useMemo(() => mergedList.find((s) => s.id === sopId), [mergedList, sopId])

  // Workflow: saat Tim Evaluasi membuka halaman evaluasi, status SOP → Sedang Dievaluasi (jika saat ini Diajukan Evaluasi)
  useEffect(() => {
    if (sopId && sop?.status === 'Diajukan Evaluasi') {
      setSopStatusOverride(sopId, 'Sedang Dievaluasi')
    }
  }, [sopId, sop?.status, setSopStatusOverride])

  const {
    komentarEvaluasi,
    setKomentarEvaluasi,
    statusEvaluasi,
    setStatusEvaluasi,
    saveDraft: handleSaveDraft,
  } = useEvaluasiDraft(sopId)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const { rightCollapsed: rightPanelCollapsed, setRightCollapsed: setRightPanelCollapsed } = useCollapsiblePanels()

  const handleSubmit = () => {
    if (!statusEvaluasi) {
      showToast('Silakan tetapkan status evaluasi terlebih dahulu', 'error')
      return
    }
    if (statusEvaluasi === 'Revisi Biro' && !komentarEvaluasi.trim()) {
      showToast('Status "Revisi Biro" wajib diisi komentar evaluasi', 'error')
      return
    }
    if (!sopId) return
    const newStatus = getStatusSopAfterEvaluasi(statusEvaluasi)
    setSopStatusOverride(sopId, newStatus)
    showToast(`Hasil evaluasi berhasil disimpan. Status SOP: ${newStatus}.`)
    setIsSubmitOpen(false)
    setTimeout(() => navigate({ to: ROUTES.TIM_EVALUASI.PENUGASAN }), 1500)
  }

  const isFormComplete =
    statusEvaluasi !== null && (statusEvaluasi !== 'Revisi Biro' || komentarEvaluasi.trim() !== '')

  if (!sop) {
    return (
      <div className="space-y-3 p-4">
        <BackButton to={ROUTES.TIM_EVALUASI.PENUGASAN} />
        <p className="text-sm text-gray-600">SOP tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          { label: 'Evaluasi SOP', to: ROUTES.TIM_EVALUASI.PENUGASAN },
          { label: 'Evaluasi SOP' },
        ]}
        title={sop.judul}
        description={sop.nomorSOP}
        backTo={ROUTES.TIM_EVALUASI.PENUGASAN}
        backSize="icon"
        header={
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Evaluasi SOP</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
                  onClick={() => window.print()}
                >
                  <Printer className="w-3.5 h-3.5" /> Print SOP
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
                  onClick={handleSaveDraft}
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Draft
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5"
                  onClick={() => setIsSubmitOpen(true)}
                  disabled={!isFormComplete}
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Hasil Evaluasi
                </Button>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-gray-700">{sop.judul}</span>
              <span className="text-gray-500 font-mono">{sop.nomorSOP}</span>
            </div>
          </>
        }
        main={
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-xs font-semibold text-gray-700">Preview SOP</h3>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <SOPPreviewTemplate name={sop.judul} number={sop.nomorSOP} />
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
                    className={`p-3 rounded-lg border transition-all ${
                      statusEvaluasi === 'Sesuai' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setStatusEvaluasi('Sesuai')}
                  >
                    <CheckCircle
                      className={`w-6 h-6 mx-auto mb-1 ${statusEvaluasi === 'Sesuai' ? 'text-green-600' : 'text-gray-400'}`}
                    />
                    <span
                      className={`text-xs font-semibold block ${statusEvaluasi === 'Sesuai' ? 'text-green-600' : 'text-gray-700'}`}
                    >
                      Sesuai
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">→ {STATUS_HASIL_EVALUASI.Sesuai}</span>
                  </button>
                  <button
                    type="button"
                    className={`p-3 rounded-lg border transition-all ${
                      statusEvaluasi === 'Revisi Biro' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setStatusEvaluasi('Revisi Biro')}
                  >
                    <XCircle
                      className={`w-6 h-6 mx-auto mb-1 ${statusEvaluasi === 'Revisi Biro' ? 'text-amber-600' : 'text-gray-400'}`}
                    />
                    <span
                      className={`text-xs font-semibold block ${statusEvaluasi === 'Revisi Biro' ? 'text-amber-600' : 'text-gray-700'}`}
                    >
                      Revisi Biro
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">→ Revisi dari Tim Evaluasi</span>
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
                  placeholder="Komentar evaluasi (wajib jika Revisi Biro)..."
                  value={komentarEvaluasi}
                  onChange={(e) => setKomentarEvaluasi(e.target.value)}
                />
              </FormField>
            </div>
          </CollapsibleSidePanel>
        }
      />

      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Konfirmasi Kirim Hasil Evaluasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <InfoCard variant={statusEvaluasi === 'Sesuai' ? 'success' : 'warning'}>
              <p className="text-xs mb-1 text-gray-700">Status SOP setelah dikirim:</p>
              <p className="text-sm font-semibold text-gray-900">
                {statusEvaluasi ? STATUS_HASIL_EVALUASI[statusEvaluasi] : '—'}
              </p>
            </InfoCard>
            <InfoCard variant="warning">
              <p className="text-xs text-amber-800">
                <strong>Perhatian:</strong> Setelah dikirim, hasil evaluasi tidak dapat diubah.
              </p>
            </InfoCard>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsSubmitOpen(false)}>
              Batal
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSubmit}>
              <Send className="w-3.5 h-3.5" /> Ya, Kirim Hasil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

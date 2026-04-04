/**
 * Halaman evaluasi SOP oleh Tim Evaluasi (langsung per SOP, langsung per SOP).
 * Hasil: Sesuai → status SOP "Siap Diverifikasi"; Perlu Perbaikan → "Revisi dari Tim Evaluasi".
 */
import { useState, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Save, Send, Printer, MessageSquare } from 'lucide-react'
import { SOPPreviewTemplate } from '@/features/sop/components/SOPPreviewTemplate'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/BackButton'
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
import { StatusHasilEvaluasiPicker } from '@/features/evaluasi'
import { useEvaluasiDraft, getStatusSopAfterEvaluasi, isFormEvaluasiSopComplete, STATUS_HASIL_EVALUASI } from '@/features/evaluasi'
import { useToast } from '@/utils/ui'
import { useCollapsiblePanels } from '@/utils/ui'
import { ROUTES } from '@/utils/constants'
import { useSop } from '@/features/sop'
import { useSopStatus } from '@/features/sop/hooks/useSopStatus'
import type { StatusSOP } from '@/types/common'

export function EvaluasiSOPPage() {
  const { sopId } = useParams({ from: '/tim-evaluasi/evaluasi/$sopId' })
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { setSopStatusOverride } = useSopStatus()
  const { list: sopListRaw } = useSop()
  const sop = useMemo(() => sopListRaw?.find((s) => s.id === sopId), [sopListRaw, sopId])

  // Note: Status change from DIAJUKAN_EVALUASI to SEDANG_DIEVALUASI is now
  // triggered by explicit user action (banner in UI), not automatically on mount.
  // This prevents unintended side-effects when page is opened accidentally.

  const {
    komentarEvaluasi,
    setKomentarEvaluasi,
    statusEvaluasi,
    setStatusEvaluasi,
    saveDraft,
    isSaving,
  } = useEvaluasiDraft(sop?.opdId, sopId)
  const handleSaveDraft = () => {
    if (isSaving) return
    saveDraft()
  }
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const { rightCollapsed: rightPanelCollapsed, setRightCollapsed: setRightPanelCollapsed } = useCollapsiblePanels()

  const handleSubmit = () => {
    if (!isFormEvaluasiSopComplete({ hasil: statusEvaluasi!, catatan: komentarEvaluasi })) {
      showToast('Silakan lengkapi status dan komentar evaluasi terlebih dahulu', 'error')
      return
    }
    if (!sopId || !statusEvaluasi) return
    const newStatus = getStatusSopAfterEvaluasi(statusEvaluasi) as StatusSOP
    setSopStatusOverride(sopId, newStatus)
    showToast(`Hasil evaluasi berhasil disimpan. Status SOP: ${newStatus}.`)
    setIsSubmitOpen(false)
    setTimeout(() => navigate({ to: ROUTES.TIM_EVALUASI.EVALUASI }), 1500)
  }

  const isFormComplete = isFormEvaluasiSopComplete({ hasil: statusEvaluasi!, catatan: komentarEvaluasi })

  if (!sop) {
    return (
      <div className="space-y-3 p-4">
        <BackButton to={ROUTES.TIM_EVALUASI.EVALUASI} />
        <p className="text-sm text-gray-600">SOP tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <>
      {sop.status === 'DIAJUKAN_EVALUASI' && (
        <div className="mx-4 mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-blue-900">SOP ini sedang menunggu evaluasi</p>
            <p className="text-xs text-blue-700 mt-0.5">Mulai evaluasi untuk mengubah status menjadi "Sedang Dievaluasi"</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs shrink-0 border-blue-300 text-blue-900 hover:bg-blue-100"
            onClick={() => setSopStatusOverride(sopId, 'SEDANG_DIEVALUASI')}
          >
            Mulai Evaluasi
          </Button>
        </div>
      )}
      <DetailPageLayout
        breadcrumb={[
          { label: 'Evaluasi SOP', to: ROUTES.TIM_EVALUASI.EVALUASI },
          { label: 'Evaluasi SOP' },
        ]}
        title={sop.judul}
        description={sop.nomorSOP}
        backTo={ROUTES.TIM_EVALUASI.EVALUASI}
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
            widthExpanded="w-full"
            title="Form Evaluasi"
            collapseButtonLabel="Form"
            collapseButtonIcon={<MessageSquare className="w-5 h-5" />}
          >
            <div className="p-3 space-y-4">
              <StatusHasilEvaluasiPicker
                value={statusEvaluasi}
                onChange={setStatusEvaluasi}
                komentarTrim={komentarEvaluasi.trim()}
              />

              <FormField label="Komentar Evaluasi">
                <Textarea
                  className="text-xs min-h-[80px]"
                  placeholder="Komentar evaluasi (wajib jika Perlu Perbaikan)..."
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
            <InfoCard variant={statusEvaluasi === 'SESUAI' ? 'success' : 'warning'}>
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

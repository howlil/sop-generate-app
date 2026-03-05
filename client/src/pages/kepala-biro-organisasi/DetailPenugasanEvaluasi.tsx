import { useState, useEffect } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { FileText, CheckCircle, Download, List, MessageSquare, Calendar } from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { formatDateId } from '@/utils/format-date'
import { getPenugasanById, getPenugasanList, subscribePenugasan, updatePenugasan } from '@/lib/stores/penugasan-store'
import type { Penugasan } from '@/lib/types/penugasan'
import { PinVerificationDialog } from '@/components/tte/PinVerificationDialog'
import { useTTESignature } from '@/hooks/useTTESignature'
import { canVerifyPenugasan, generateBANumber } from '@/lib/domain/sop-status'
import { ROUTES } from '@/lib/constants/routes'
import { TTESignatureBlock } from '@/components/tte/TTESignatureBlock'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { NotFoundWithBack } from '@/components/ui/not-found'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { showToast } from '@/lib/stores'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/ui/status-badge'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'
import { InfoField, InfoGrid } from '@/components/ui/info-field'
import { InfoCard } from '@/components/ui/info-card'

export function DetailPenugasanEvaluasi() {
  const { id } = useParams({ from: '/biro-organisasi/manajemen-evaluasi-sop/detail/$id' })
  const [penugasan, setPenugasan] = useState<Penugasan | null>(() => getPenugasanById(id) ?? null)
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)
  const [isBAOpen, setIsBAOpen] = useState(false)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  const tte = useTTESignature({
    role: 'biro-organisasi',
    documentId: penugasan ? `batch-evaluasi-${penugasan.id}` : undefined,
  })

  useEffect(() => {
    const unsub = subscribePenugasan(() => setPenugasan(getPenugasanById(id) ?? null))
    return unsub
  }, [id])

  const handlePinConfirm = tte.createPinConfirmHandler(
    {
      documentLabel: penugasan?.opd ?? '',
      referenceId: generateBANumber(getPenugasanList().filter((h) => h.isVerified).length),
    },
    (payload) => {
      if (!penugasan) return
      const batchNumber = generateBANumber(getPenugasanList().filter((h) => h.isVerified).length - 1)
      updatePenugasan(penugasan.id, {
        status: 'Terverifikasi',
        isVerified: true,
        nomorBA: batchNumber,
        tanggalVerifikasi: new Date().toISOString().split('T')[0],
        namaBiro: payload.nama,
        tteSignaturePayload: payload,
      })
      showToast('Batch evaluasi berhasil diverifikasi dengan TTE BSRE. Berita Acara telah dibuat.')
    }
  )

  const sopList = penugasan?.sopList ?? []
  const firstSopId = sopList[0]?.id ?? null
  const effectiveSopId = selectedSopId ?? firstSopId
  const displaySop = sopList.find((s) => s.id === effectiveSopId)

  if (!penugasan) {
    return (
      <NotFoundWithBack
        message="Penugasan tidak ditemukan."
        backAction={
          <BackButton to={ROUTES.BIRO_ORGANISASI.EVALUASI_SOP}>Kembali</BackButton>
        }
      />
    )
  }

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          { label: 'Manajemen Evaluasi SOP', to: ROUTES.BIRO_ORGANISASI.EVALUASI_SOP },
          { label: 'Detail' },
        ]}
        title="Detail Evaluasi SOP"
        description="Informasi batch evaluasi dan verifikasi (Berita Acara)"
        backTo={ROUTES.BIRO_ORGANISASI.EVALUASI_SOP}
        backSize="icon"
        header={
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Informasi OPD & Evaluasi</h2>
              <div className="flex items-center gap-2">
                {canVerifyPenugasan(penugasan) && (
                  tte.canSign ? (
                    <Button size="sm" className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5" onClick={tte.openPinDialog}>
                      <CheckCircle className="w-3.5 h-3.5" /> Verifikasi Batch (TTE)
                    </Button>
                  ) : (
                    <Link to={ROUTES.BIRO_ORGANISASI.TTD}>
                      <Button variant="outline" size="sm" className="h-8 px-3 rounded-md border-gray-200 hover:bg-gray-50 text-xs gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Buat TTD dulu
                      </Button>
                    </Link>
                  )
                )}
                {penugasan.isVerified && penugasan.nomorBA && (
                  <Button variant="outline" size="sm" className="h-8 px-3 rounded-md border-gray-200 hover:bg-gray-50 text-xs gap-1.5" onClick={() => setIsBAOpen(true)}>
                    <FileText className="w-3.5 h-3.5" /> Lihat BA
                  </Button>
                )}
              </div>
            </div>
            <div className="pt-2 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-900">{penugasan.opd}</span>
                <Badge variant="outline" className="text-xs h-4 px-1.5 border-gray-200">{penugasan.jenis}</Badge>
                <StatusBadge status={penugasan.status} domain={STATUS_DOMAIN.EVALUASI_BIRO} className="text-xs h-4 px-1.5 border-0" />
              </div>
              <InfoGrid cols={4}>
                {penugasan.tanggalRequest && (
                  <InfoField label="Tanggal Request:" icon={<Calendar />}>
                    {formatDateId(penugasan.tanggalRequest)}
                  </InfoField>
                )}
                {penugasan.timMonev && (
                  <InfoField label="Tim Monev:">
                    {penugasan.timMonev}
                  </InfoField>
                )}
                {penugasan.tanggalEvaluasi && (
                  <InfoField label="Tgl Evaluasi:" icon={<Calendar />}>
                    {formatDateId(penugasan.tanggalEvaluasi)}
                  </InfoField>
                )}
                {penugasan.tanggalVerifikasi && (
                  <InfoField label="Tgl Verifikasi:" icon={<Calendar />}>
                    {formatDateId(penugasan.tanggalVerifikasi)}
                  </InfoField>
                )}
                {penugasan.nomorBA && (
                  <InfoField label="Nomor BA:">
                    {penugasan.nomorBA}
                  </InfoField>
                )}
              </InfoGrid>
              {penugasan.catatan && (
                <InfoCard variant="neutral">
                  <p className="text-xs text-gray-700"><strong>Catatan penugasan:</strong> {penugasan.catatan}</p>
                </InfoCard>
              )}
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
            subtitle={`${sopList.length} dokumen`}
            collapseButtonLabel="Daftar"
            collapseButtonIcon={<List className="w-5 h-5" />}
          >
            <SOPListCard
              items={sopList.map((s) => ({ id: s.id, nama: s.nama, nomor: s.nomor, status: s.status }))}
              selectedId={effectiveSopId}
              onSelect={setSelectedSopId}
              statusDomain={STATUS_DOMAIN.SOP}
            />
          </CollapsibleSidePanel>
        }
        main={
          <div className="flex flex-col h-full">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700">Preview SOP</h3>
              {displaySop?.status && (
                <StatusBadge status={displaySop.status} domain={STATUS_DOMAIN.SOP} />
              )}
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              {displaySop ? (
                <SOPPreviewTemplate name={displaySop.nama} number={displaySop.nomor} />
              ) : (
                <div className="flex items-center justify-center flex-1 text-xs text-gray-400">
                  Pilih SOP di daftar kiri
                </div>
              )}
            </div>
          </div>
        }
        rightPanel={
          <CollapsibleSidePanel
            side="right"
            collapsed={rightPanelCollapsed}
            onCollapsedChange={setRightPanelCollapsed}
            widthExpanded="w-[min(320px,33%)] min-w-[220px]"
            title="Catatan & Rekomendasi"
            collapseButtonLabel="Catatan"
            collapseButtonIcon={<MessageSquare className="w-5 h-5" />}
          >
            <div className="p-3" />
          </CollapsibleSidePanel>
        }
      />

      {/* Dialog Berita Acara */}
      <Dialog open={isBAOpen} onOpenChange={setIsBAOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Berita Acara Verifikasi Evaluasi SOP</DialogTitle>
          </DialogHeader>
          {penugasan.nomorBA && penugasan.isVerified && (
            <div className="space-y-4 text-xs">
              <div className="text-center border-b pb-4">
                <h2 className="text-sm font-semibold mb-1">BERITA ACARA</h2>
                <h3 className="text-sm font-semibold mb-2">VERIFIKASI MONITORING DAN EVALUASI SOP</h3>
                <p>Nomor: {penugasan.nomorBA}</p>
              </div>
              <InfoCard variant="neutral">
                <div className="space-y-1">
                  <p><strong>Batch:</strong> {penugasan.opd}</p>
                  <p><strong>Evaluator:</strong> {penugasan.timMonev}</p>
                  <p><strong>Tanggal Verifikasi:</strong> {formatDateId(penugasan.tanggalVerifikasi)}</p>
                  <p><strong>Jumlah SOP:</strong> {sopList.length}</p>
                </div>
              </InfoCard>
              <p className="leading-relaxed">
                Berdasarkan hasil monitoring dan evaluasi, batch ini telah diverifikasi dengan {sopList.length} SOP.
              </p>
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div className="text-center"><p className="mb-12">Evaluator</p><p className="font-semibold">{penugasan.timMonev}</p></div>
                <div className="text-center">
                  {penugasan.tteSignaturePayload ? (
                    <TTESignatureBlock
                      payload={penugasan.tteSignaturePayload}
                      roleLabel="Biro Organisasi"
                      qrSize={80}
                    />
                  ) : (
                    <>
                      <p className="mb-12">Biro Organisasi</p>
                      <p className="font-semibold">{penugasan.namaBiro}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsBAOpen(false)}>Tutup</Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => window.print()}><Download className="w-3.5 h-3.5" /> Unduh PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinVerificationDialog
        open={tte.pinDialogOpen}
        onOpenChange={tte.setPinDialogOpen}
        title="Verifikasi PIN TTE"
        description="Masukkan PIN TTE BSRE untuk memverifikasi batch evaluasi ini."
        onConfirm={handlePinConfirm}
        confirmLabel="Verifikasi"
      />
    </>
  )
}

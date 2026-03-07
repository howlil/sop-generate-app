import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { FileText, CheckCircle, Download, List, MessageSquare, Calendar, History } from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { formatDateId } from '@/utils/format-date'
import { getOpdListEvaluasi, getRiwayatEvaluasiOpd, getRiwayatEvaluasiSop } from '@/lib/data/penugasan-evaluasi'
import { PinVerificationDialog } from '@/components/tte/PinVerificationDialog'
import { useTTESignature } from '@/hooks/useTTESignature'
import { ROUTES } from '@/lib/constants/routes'
import { TTESignatureBlock } from '@/components/tte/TTESignatureBlock'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { NotFoundWithBack } from '@/components/ui/not-found'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { useToast } from '@/hooks/useUI'
import { usePenugasanEvaluasi } from '@/hooks/usePenugasanEvaluasi'
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
import { RiwayatCardList } from '@/components/evaluasi/RiwayatCardList'

export function DetailPenugasanEvaluasi() {
  const { id } = useParams({ from: '/biro-organisasi/manajemen-evaluasi-sop/detail/$id' })
  const { showToast } = useToast()
  const { penugasan, selectedSopId, setSelectedSopId, handleVerifySuccess, canVerify } = usePenugasanEvaluasi(id)
  const [isBAOpen, setIsBAOpen] = useState(false)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'catatan' | 'riwayat'>('catatan')

  const tte = useTTESignature({
    role: 'biro-organisasi',
    documentId: penugasan ? `batch-evaluasi-${penugasan.id}` : undefined,
  })

  const handlePinConfirm = tte.createPinConfirmHandler(
    {
      documentLabel: penugasan?.opd ?? '',
      referenceId: penugasan?.id ?? '',
    },
    (payload) => {
      handleVerifySuccess(payload)
      showToast('Batch evaluasi berhasil diverifikasi dengan TTE BSRE. Berita Acara telah dibuat.')
    }
  )

  const sopList = penugasan?.sopList ?? []
  const firstSopId = sopList[0]?.id ?? null
  const effectiveSopId = selectedSopId ?? firstSopId
  const displaySop = sopList.find((s) => s.id === effectiveSopId)
  const opdListEvaluasi = getOpdListEvaluasi()
  const riwayatEvaluasiOpd = getRiwayatEvaluasiOpd()
  const riwayatEvaluasiSop = getRiwayatEvaluasiSop()
  const opdId = penugasan ? opdListEvaluasi.find((o) => o.nama === penugasan.opd)?.id ?? null : null
  const riwayatOpd = opdId ? (riwayatEvaluasiOpd[opdId] ?? []) : []
  const riwayatSop = effectiveSopId ? (riwayatEvaluasiSop[effectiveSopId] ?? []) : []

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
                {canVerify && (
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
            tabs={[
              { id: 'catatan', label: 'Catatan & Rekomendasi', icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: 'riwayat', label: 'Riwayat Penilaian OPD', icon: <History className="w-3.5 h-3.5" /> },
            ]}
            activeTab={rightPanelTab}
            onTabChange={(id) => setRightPanelTab(id as 'catatan' | 'riwayat')}
            collapseButtonLabel="Catatan"
            collapseButtonIcon={<MessageSquare className="w-5 h-5" />}
          >
            <div className="p-3 space-y-4">
              {rightPanelTab === 'catatan' && (
                <>
                  {!effectiveSopId ? (
                    <p className="text-xs text-gray-500">
                      Pilih SOP di daftar kiri untuk melihat riwayat hasil evaluasi.
                    </p>
                  ) : (
                    <RiwayatCardList
                      title="Riwayat hasil evaluasi SOP ini"
                      emptyMessage="Belum ada riwayat evaluasi SOP ini."
                      items={riwayatSop}
                      renderItem={(r) => (
                        <>
                          <div className="flex flex-wrap items-baseline gap-x-1.5">
                            <span className="font-medium text-gray-700">{formatDateId(r.date)}</span>
                            <span className="text-gray-500">—</span>
                            <span className="text-gray-600">{r.evaluatorName}</span>
                            <span
                              className={
                                r.hasil === 'Sesuai'
                                  ? 'text-green-600 font-medium'
                                  : 'text-amber-600 font-medium'
                              }
                            >
                              · {r.hasil}
                            </span>
                          </div>
                          {r.komentar && (
                            <p className="text-gray-600 mt-1 leading-snug">
                              {r.komentar}
                            </p>
                          )}
                        </>
                      )}
                    />
                  )}
                </>
              )}
              {rightPanelTab === 'riwayat' && (
                <RiwayatCardList
                  title="Riwayat penilaian OPD"
                  emptyMessage="Belum ada riwayat penilaian OPD."
                  items={riwayatOpd}
                  renderItem={(r) => (
                    <>
                      <div className="flex flex-wrap items-baseline gap-x-1.5">
                        <span className="font-medium text-gray-700">{formatDateId(r.date)}</span>
                        <span className="text-gray-500">—</span>
                        <span className="text-gray-600">{r.evaluatorName}</span>
                        <span className="text-blue-600 font-medium">Skor {r.skor}/5</span>
                      </div>
                      {r.sopJudul && (
                        <p className="text-gray-600 mt-1 leading-snug truncate" title={r.sopJudul}>
                          SOP: {r.sopJudul}
                        </p>
                      )}
                    </>
                  )}
                />
              )}
            </div>
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

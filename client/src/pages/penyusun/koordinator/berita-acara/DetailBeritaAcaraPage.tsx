import { useEffect, useMemo, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import {
  usePengajuanBeritaAcaraView,
  usePengajuanEvaluasiDetail,
  usePengajuanSopDokumenWorkbench,
} from '@/api/evaluasi'
import { PinVerificationDialog } from '@/pages/pj-evaluator/tte/components/PinVerificationDialog'
import { createPinConfirmHandler, useTandaTanganiBA } from '@/api/tte'
import { BeritaAcaraTemplate } from '@/pages/penyusun/koordinator/berita-acara/components/BeritaAcaraTemplate'
import { SOPListCard } from '@/pages/penyusun/sop/components/SOPListCard'
import { SOPPreviewTemplate } from '@/pages/penyusun/sop/components/SOPPreviewTemplate'
import type { SOPPreviewTemplateProps } from '@/pages/penyusun/sop/components/SOPPreviewTemplate'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { NotFoundWithBack } from '@/components/ui/not-found'
import { PengajuanEvaluasiStatusHeader } from '@/components/evaluasi/pengajuan-evaluasi-status-header'
import { InfoCard } from '@/components/ui/info-card'
import { InfoField } from '@/components/ui/info-field'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mapPenyusunWorkbenchToPreviewProps } from '@/lib/sop/detailSop.mappers'
import { parseTTESignaturePayload } from '@/lib/tte/parse-tte-signature-payload'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { ROUTES } from '@/utils/constants'
import { PengajuanCetakArsipButtons } from '@/components/pengajuan/PengajuanCetakArsipButtons'
import {
  PengajuanSemuaSopPrintStack,
  type PengajuanSemuaSopPrintItem,
} from '@/components/pengajuan/PengajuanSemuaSopPrintStack'
import { usePengajuanCetakArsip } from '@/hooks/use-pengajuan-cetak-arsip'
import { canCetakArsipPengajuan } from '@/lib/print/pengajuan-print'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DetailBeritaAcaraPage() {
  const { id } = useParams({ from: '/penyusun/pj-penyusun/berita-acara/$id' })
  const [tteDialogOpen, setTteDialogOpen] = useState(false)
  const [previewMainTab, setPreviewMainTab] = useState<'sop' | 'ba'>('ba')
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)
  const [semuaSopReady, setSemuaSopReady] = useState(false)
  const { pengajuan, loading: isLoading } = usePengajuanEvaluasiDetail(id)

  useEffect(() => {
    setSelectedSopId(null)
  }, [id])

  const tandaTanganiBA = useTandaTanganiBA({ isPjPenyusun: true })
  const handlePinConfirm = createPinConfirmHandler(
    tandaTanganiBA.mutateAsync,
    (pin) => ({
      pengajuanId: id,
      payload: {
        pin,
        nomorDokumen: pengajuan?.nomorBA ?? `BA-${pengajuan?.opdNama ?? ''}`,
        judulDokumen: `Berita Acara Evaluasi - ${pengajuan?.opdNama ?? ''}`,
      },
    }),
  )

  const isReadyForSignature = pengajuan?.status === 'DIVERIFIKASI_PJ_EVALUATOR'
  const isAlreadySigned = pengajuan?.status === 'DITANDATANGANI_PJ_PENYUSUN'
  const isSelesai = pengajuan?.status === 'SELESAI'
  const sopList = pengajuan?.sopList ?? []
  const canCetak = canCetakArsipPengajuan(pengajuan?.status)
  const sopPrintItems = useMemo<PengajuanSemuaSopPrintItem[]>(
    () =>
      sopList.map((item) => ({
        sopDetailId: item.sopDetailId,
        nama: item.nama,
        nomor: item.nomor,
      })),
    [sopList],
  )
  const firstSopDetailId = sopList[0]?.sopDetailId ?? null
  const effectiveSopDetailId = selectedSopId ?? firstSopDetailId
  const selectedSop = sopList.find((sop) => sop.sopDetailId === effectiveSopDetailId) ?? null

  const { handleCetak, cetakLoading, semuaSopLoading } = usePengajuanCetakArsip({
    pengajuanId: id,
    effectiveSopDetailId,
    semuaSopReady,
    setPreviewMainTab,
  })

  const sopWorkbenchEnabled = Boolean(
    effectiveSopDetailId && (previewMainTab === 'sop' || canCetak),
  )
  const {
    data: sopDokumen,
    isFetching: sopWorkbenchLoading,
    isError: sopWorkbenchError,
    refetch: refetchSopDokumen,
  } = usePengajuanSopDokumenWorkbench(id, effectiveSopDetailId, {
    enabled: sopWorkbenchEnabled,
  })

  const sopPreviewProps = useMemo(() => {
    const wb = sopDokumen?.workbench
    if (wb === undefined) return null
    return mapPenyusunWorkbenchToPreviewProps(wb)
  }, [sopDokumen])

  const tteSignaturePayloadKepalaOpd = useMemo(
    () => parseTTESignaturePayload(sopDokumen?.tteSignaturePayloadKepalaOpd),
    [sopDokumen?.tteSignaturePayloadKepalaOpd],
  )

  const isSopPreviewLoading = sopWorkbenchEnabled && sopPreviewProps === null && sopWorkbenchLoading
  const { data: baView } = usePengajuanBeritaAcaraView(id, {
    enabled: Boolean(pengajuan && (previewMainTab === 'ba' || canCetak)),
  })

  if (isLoading && pengajuan === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[320px] text-gray-600 text-sm">
        <Loader2 className="h-9 w-9 animate-spin text-gray-400" aria-hidden />
        <p>Memuat detail Berita Acara...</p>
      </div>
    )
  }

  if (pengajuan === null) {
    return (
      <NotFoundWithBack
        message="Pengajuan evaluasi tidak ditemukan."
        backAction={
          <BackButton to={ROUTES.PENYUSUN.PJ_PENYUSUN_BERITA_ACARA}>
            Kembali
          </BackButton>
        }
      />
    )
  }

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
          { label: 'PJ Penyusun', to: ROUTES.PENYUSUN.SOP },
          { label: 'Berita Acara', to: ROUTES.PENYUSUN.PJ_PENYUSUN_BERITA_ACARA },
        ]}
        title="Detail Berita Acara"
        description={`${pengajuan.opdNama ?? ''} - verifikasi BA dan finalisasi tanda tangan elektronik.`}
        backTo={ROUTES.PENYUSUN.PJ_PENYUSUN_BERITA_ACARA}
        backSize="icon"
        header={
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-semibold text-gray-900">Informasi OPD & Evaluasi</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <PengajuanCetakArsipButtons
                  pengajuanStatus={pengajuan.status}
                  effectiveSopDetailId={effectiveSopDetailId}
                  sopCount={sopList.length}
                  cetakLoading={cetakLoading}
                  semuaSopLoading={semuaSopLoading}
                  onCetak={handleCetak}
                />
                {isReadyForSignature && (
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => setTteDialogOpen(true)}
                    disabled={tandaTanganiBA.isPending}
                  >
                    {tandaTanganiBA.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Menandatangani...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Tanda Tangan TTE
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
              <InfoField label="OPD">{pengajuan.opdNama ?? pengajuan.opd?.nama ?? ''}</InfoField>
              <InfoField label="Nomor BA">
                <span className="font-mono">{pengajuan.nomorBA ?? '-'}</span>
              </InfoField>
              <InfoField label="Tanggal Verifikasi">{formatDate(pengajuan.tanggalVerifikasi)}</InfoField>
              <InfoField label="Evaluator">{pengajuan.timEvaluasi ?? '-'}</InfoField>
              <InfoField label="Jumlah SOP">{`${sopList.length} dokumen`}</InfoField>
            </div>
            <PengajuanEvaluasiStatusHeader
              status={pengajuan.status}
              statusLabel={pengajuan.statusLabel ?? pengajuan.status}
              role="PJ_PENYUSUN"
            />
            {isReadyForSignature && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-700" />
                  <p className="text-xs text-orange-700">
                    Berita Acara ini telah diverifikasi oleh PJ Evaluator dan menunggu tanda tangan Anda.
                  </p>
                </div>
              </div>
            )}
            {isAlreadySigned && (
              <InfoCard variant="success" icon={<CheckCircle />} title="Berita Acara telah ditandatangani">
                Ditandatangani pada {formatDate(pengajuan.tanggalTTDBaPjPenyusun)}. Menunggu pengesahan
                Kepala OPD.
              </InfoCard>
            )}
            {isSelesai && (
              <InfoCard variant="success" icon={<CheckCircle />} title="Pengajuan evaluasi selesai">
                Seluruh SOP dalam pengajuan ini telah ditandatangani Kepala OPD. Berita Acara dapat dicetak
                sebagai arsip.
              </InfoCard>
            )}
          </div>
        }
        leftPanel={
          <CollapsibleSidePanel
            side="left"
            collapsed={leftPanelCollapsed}
            onCollapsedChange={setLeftPanelCollapsed}
            widthCollapsed="w-10"
            widthExpanded="w-[min(300px,36vw)]"
            title="Daftar SOP"
          >
            <SOPListCard
              items={sopList.map((sop) => ({
                id: sop.sopDetailId,
                nama: sop.nama,
                nomor: sop.nomor,
                statusDokumen: sop.status,
                statusDokumenLabel: sop.statusLabel ?? sop.status,
                hasilEvaluasi: sop.hasil,
                hasilEvaluasiLabel: sop.hasilLabel,
              }))}
              selectedId={effectiveSopDetailId}
              onSelect={setSelectedSopId}
            />
          </CollapsibleSidePanel>
        }
      >
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          <Tabs
            value={previewMainTab}
            onValueChange={(value) => setPreviewMainTab(value as 'sop' | 'ba')}
            className="flex h-full min-h-0 flex-col"
          >
            <div data-print-hide className="border-b border-gray-200 px-2 py-2">
              <TabsList className="h-8 bg-transparent p-0 gap-2">
                <TabsTrigger value="sop" className="h-8 text-xs">
                  Pratinjau SOP
                </TabsTrigger>
                <TabsTrigger value="ba" className="h-8 text-xs">
                  Berita Acara
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="sop" className="mt-3 flex min-h-0 flex-1 flex-col overflow-auto px-2 pb-2">
              {selectedSop !== null ? (
                isSopPreviewLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
                    <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                    Memuat dokumen SOP…
                  </div>
                ) : sopPreviewProps !== null ? (
                  <div data-print-area="sop">
                    <SOPPreviewTemplate
                      name={sopPreviewProps.name}
                      number={sopPreviewProps.number}
                      metadata={sopPreviewProps.metadata as SOPPreviewTemplateProps['metadata']}
                      prosedurRows={sopPreviewProps.prosedurRows}
                      implementers={sopPreviewProps.implementers}
                      tteSignaturePayload={tteSignaturePayloadKepalaOpd ?? null}
                      previewOptions={{ editable: false, showScrollbar: true }}
                    />
                  </div>
                ) : sopWorkbenchError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <AlertCircle className="h-10 w-10 text-red-500" aria-hidden />
                    <p className="max-w-md text-sm text-gray-600">
                      Dokumen lengkap SOP dalam pengajuan evaluasi tidak dapat dimuat.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void refetchSopDokumen()}
                    >
                      Coba lagi
                    </Button>
                  </div>
                ) : null
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
                  Tidak ada SOP untuk ditampilkan.
                </div>
              )}
            </TabsContent>
            <TabsContent value="ba" className="mt-2 flex min-h-0 flex-1 flex-col overflow-auto px-1 pb-1 sm:px-2">
              <div data-print-area="ba" className="w-full">
                <BeritaAcaraTemplate
                  forPrint
                  opd={pengajuan.opdNama ?? pengajuan.opd?.nama ?? ''}
                  nomorBA={baView?.nomorBA ?? pengajuan.nomorBA}
                  tanggalVerifikasi={baView?.tanggalVerifikasiPjEvaluator ?? pengajuan.tanggalVerifikasi}
                  namaBiro={pengajuan.namaPjEvaluator}
                  namaPjPenyusun={pengajuan.namaPjPenyusun ?? pengajuan.opdNama ?? 'PJ Penyusun OPD'}
                  tteSignaturePayloadPjEvaluator={baView?.tteBeritaAcara?.payloadPjEvaluator}
                  tteSignaturePayloadPjPenyusun={baView?.tteBeritaAcara?.payloadPjPenyusun}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DetailPageLayout>

      <PengajuanSemuaSopPrintStack
        pengajuanId={id}
        sopItems={sopPrintItems}
        prefetchEnabled={canCetak}
        onAllLoadedChange={setSemuaSopReady}
      />

      <PinVerificationDialog
        open={tteDialogOpen}
        onOpenChange={setTteDialogOpen}
        title="Verifikasi PIN TTE"
        description="Masukkan PIN TTE untuk menandatangani Berita Acara ini (simulasi)."
        onConfirm={handlePinConfirm}
      />
    </>
  )
}

import { useMemo, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useEvaluasiDetail, usePengajuanBeritaAcaraView, usePengajuanSopDokumenWorkbench } from "@/api/evaluasi";
import { PinVerificationDialog } from "@/pages/pj-evaluator/tte/components/PinVerificationDialog";
import { createPinConfirmHandler } from "@/api/tte";
import { useTandaTanganiBA } from '@/api/tte'
import { BeritaAcaraTemplate } from '@/pages/penyusun/koordinator/berita-acara/components/BeritaAcaraTemplate'
import { SOPListCard } from '@/pages/penyusun/sop/components/SOPListCard'
import { SOPPreviewTemplate } from '@/pages/penyusun/sop/components/SOPPreviewTemplate'
import type { SOPPreviewTemplateProps } from '@/pages/penyusun/sop/components/SOPPreviewTemplate'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { NotFoundWithBack } from '@/components/ui/not-found'
import { StatusBadge } from '@/components/ui/status-badge'
import { InfoCard } from '@/components/ui/info-card'
import { InfoField } from '@/components/ui/info-field'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { mapPenyusunWorkbenchToPreviewProps } from '@/lib/sop/detailSop.mappers'
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  Printer,
  ChevronRight,
} from 'lucide-react'
import { ROUTES } from '@/utils/constants'

const PRINT_DELAY_MS = 150

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
  const navigate = useNavigate()
  const [tteDialogOpen, setTteDialogOpen] = useState(false)
  const [previewMainTab, setPreviewMainTab] = useState<'sop' | 'ba'>('ba')
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)

  const { data: pengajuan, isLoading, error } = useEvaluasiDetail(id)

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
  const sopList = pengajuan?.sopList ?? []
  const firstSopDetailId = sopList[0]?.sopDetailId ?? null
  const effectiveSopDetailId = selectedSopId ?? firstSopDetailId
  const selectedSop = sopList.find((sop) => sop.sopDetailId === effectiveSopDetailId) ?? null
  const sopWorkbenchEnabled = Boolean(previewMainTab === 'sop' && effectiveSopDetailId)
  const { data: sopDokumen, isFetching: sopWorkbenchLoading } = usePengajuanSopDokumenWorkbench(
    id,
    effectiveSopDetailId,
    { enabled: sopWorkbenchEnabled },
  )
  const sopPreviewProps = useMemo(() => {
    const wb = sopDokumen?.workbench
    if (wb === undefined) return null
    return mapPenyusunWorkbenchToPreviewProps(wb)
  }, [sopDokumen])
  const { data: baView } = usePengajuanBeritaAcaraView(id, { enabled: true })

  if (isLoading && pengajuan === undefined) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[320px] text-gray-600 text-sm">
        <Loader2 className="h-9 w-9 animate-spin text-gray-400" aria-hidden />
        <p>Memuat detail Berita Acara...</p>
      </div>
    )
  }

  if (pengajuan === undefined) {
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
              <h2 className="text-sm font-semibold text-gray-900">
                Informasi OPD & Evaluasi
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    setPreviewMainTab('ba')
                    setTimeout(() => window.print(), PRINT_DELAY_MS)
                  }}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak BA
                </Button>
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
              <InfoField label="Status">
                <StatusBadge status={pengajuan.status} />
              </InfoField>
              <InfoField label="Tanggal Verifikasi">{formatDate(pengajuan.tanggalVerifikasi)}</InfoField>
              <InfoField label="Evaluator">{pengajuan.timEvaluasi ?? '-'}</InfoField>
              <InfoField label="Jumlah SOP">{`${sopList.length} dokumen`}</InfoField>
            </div>
            {isReadyForSignature && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-700" />
                  <div>
                    <p className="text-xs text-orange-700">
                      Berita Acara ini telah diverifikasi oleh PJ Evaluator dan menunggu tanda tangan Anda.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isAlreadySigned && (
              <InfoCard variant="success" icon={<CheckCircle />} title="Berita Acara telah ditandatangani">
                Ditandatangani pada {formatDate(pengajuan.tanggalTTDBaPjPenyusun)}.
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
                status: sop.status,
              }))}
              selectedId={effectiveSopDetailId}
              onSelect={setSelectedSopId}
            />
          </CollapsibleSidePanel>
        }
      >
        <>
          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-3 h-12 w-12 text-red-500" />
              <h3 className="mb-1 text-lg font-semibold text-gray-700">
                Gagal Memuat Data
              </h3>
              <p className="mb-4 max-w-md text-sm text-gray-500">
                Terjadi kesalahan saat mengambil detail berita acara.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate({ to: ROUTES.PENYUSUN.PJ_PENYUSUN_BERITA_ACARA })}
              >
                Kembali ke Daftar
              </Button>
            </div>
          )}
          {!error && (
            <div className="flex h-full min-h-0 min-w-0 flex-col">
              <Tabs
                value={previewMainTab}
                onValueChange={(value) => setPreviewMainTab(value as 'sop' | 'ba')}
                className="flex h-full min-h-0 flex-col"
              >
                <div className="border-b border-gray-200 px-2 py-2">
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
                    sopWorkbenchLoading ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 text-sm">
                        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                        Memuat dokumen SOP…
                      </div>
                    ) : sopPreviewProps !== null ? (
                      <SOPPreviewTemplate
                        name={sopPreviewProps.name}
                        number={sopPreviewProps.number}
                        metadata={sopPreviewProps.metadata as SOPPreviewTemplateProps['metadata']}
                        prosedurRows={sopPreviewProps.prosedurRows}
                        implementers={sopPreviewProps.implementers}
                        previewOptions={{ editable: false, showScrollbar: true }}
                      />
                    ) : (
                      <div className="rounded-lg border bg-white p-4 space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">SOP terpilih</p>
                          <h3 className="text-sm font-semibold text-gray-900">{selectedSop.judul}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                          <div>
                            Nomor SOP:{' '}
                            <span className="font-mono font-medium">
                              {selectedSop.nomorSOP ?? selectedSop.nomor ?? '-'}
                            </span>
                          </div>
                          <div>
                            Status: <span className="font-medium">{selectedSop.status ?? '-'}</span>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate({
                                to: ROUTES.PENYUSUN.DETAIL_SOP,
                                params: { id: selectedSop.sopDetailId },
                              })
                            }
                          >
                            Lihat Detail SOP
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
                      Tidak ada SOP untuk ditampilkan.
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="ba" className="mt-2 flex min-h-0 flex-1 flex-col overflow-auto px-1 pb-1 sm:px-2">
                  <div className="w-full">
                    <BeritaAcaraTemplate
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
          )}
        </>
      </DetailPageLayout>

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

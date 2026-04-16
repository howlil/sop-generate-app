import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useEvaluasiDetail } from '@/features/evaluasi'
import { PinVerificationDialog, createPinConfirmHandler } from '@/features/tte'
import { useTandaTanganiBA } from '@/features/tte/hooks/useTte'
import { BeritaAcaraTemplate } from '@/components/berita-acara/BeritaAcaraTemplate'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InfoCard } from '@/components/ui/info-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  Printer,
  Clock,
  Users,
  FileSpreadsheet,
} from 'lucide-react'
import { useToast } from '@/utils/toast'
import { ROUTES } from '@/utils/constants'

const STATUS_LABEL: Record<string, string> = {
  DIAJUKAN: 'Diajukan',
  SEDANG_DIEVALUASI: 'Sedang Dievaluasi',
  SELESAI_DIEVALUASI: 'Selesai Dievaluasi',
  DIVERIFIKASI_BIRO: 'Diverifikasi Biro',
  DITANDATANGANI_KOORDINATOR: 'Ditandatangani Koordinator',
  DISETUJAI: 'Disetujui',
  DITOLAK: 'Ditolak',
}

const STATUS_CONFIG: Record<string, { className: string }> = {
  DIVERIFIKASI_BIRO: { className: 'h-4 border-0 bg-orange-100 text-orange-700' },
  DITANDATANGANI_KOORDINATOR: { className: 'h-4 border-0 bg-green-100 text-green-700' },
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DetailBeritaAcaraPage() {
  const { id } = useParams({ from: '/tim-penyusun/koordinator/berita-acara/$id' })
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [tteDialogOpen, setTteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('berita-acara')

  const { data: pengajuan, isLoading, error } = useEvaluasiDetail(id)

  const tandaTanganiBA = useTandaTanganiBA({ isKoordinator: true })

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
    () => {
      showToast(`Berita Acara ${pengajuan?.opdNama ?? ''} berhasil ditandatangani`, 'success')
      setTteDialogOpen(false)
    },
  )

  const isReadyForSignature = pengajuan?.status === 'DIVERIFIKASI_BIRO'
  const isAlreadySigned = pengajuan?.status === 'DITANDATANGANI_KOORDINATOR'

  return (
    <>
      <DetailPageLayout
        breadcrumb={[
        { label: 'Koordinator Tim Penyusun', to: ROUTES.TIM_PENYUSUN.SOP },
        { label: 'Berita Acara', to: ROUTES.TIM_PENYUSUN.KOORDINATOR_BERITA_ACARA },
        { label: pengajuan?.opdNama ?? 'Detail' },
      ]}
      title="Detail Berita Acara"
      description={pengajuan?.opdNama ?? 'Memuat...'}
      backTo={ROUTES.TIM_PENYUSUN.KOORDINATOR_BERITA_ACARA}
      backSize="icon"
      actions={
        isReadyForSignature && (
          <Button
            onClick={() => setTteDialogOpen(true)}
            disabled={tandaTanganiBA.isPending}
          >
            {tandaTanganiBA.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menandatangani...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Tanda Tangan dengan TTE
              </>
            )}
          </Button>
        )
      }
      header={
        pengajuan && (
          <div className="space-y-4">
            {/* Status & Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm text-gray-900">
                    {pengajuan.opdNama ?? pengajuan.opd?.nama ?? '-'}
                  </h2>
                  <Badge className={STATUS_CONFIG[pengajuan.status]?.className}>
                    {STATUS_LABEL[pengajuan.status] ?? pengajuan.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Nomor BA: <span className="font-mono text-gray-900">{pengajuan.nomorBA ?? '-'}</span>
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Cetak
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoCard title="Tanggal Evaluasi" icon={<Clock />}>
                {formatDate(pengajuan.tanggalVerifikasi)}
              </InfoCard>
              <InfoCard title="Tim Evaluasi" icon={<Users />}>
                {pengajuan.timEvaluasi ?? "-"}
              </InfoCard>
              <InfoCard title="Jumlah SOP" icon={<FileText />}>
                {`${pengajuan.sopList?.length ?? 0} dokumen`}
              </InfoCard>
            </div>

            {/* Alert for pending signature */}
            {isReadyForSignature && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-700" />
                  <div>
                    <p className="text-xs text-orange-700">
                      Berita Acara ini telah diverifikasi oleh Biro Organisasi dan menunggu tanda tangan Anda.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Alert for already signed */}
            {isAlreadySigned && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="text-xs text-green-700">
                      Berita Acara ini telah ditandatangani pada{' '}
                      {formatDate(pengajuan.tanggalTTDBaKoordinator)}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
      main={
        <>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-gray-400" />
              <span className="text-gray-400">Memuat data...</span>
            </div>
          )}

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
                onClick={() => navigate({ to: ROUTES.TIM_PENYUSUN.KOORDINATOR_BERITA_ACARA })}
              >
                Kembali ke Daftar
              </Button>
            </div>
          )}

          {pengajuan && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger
                    value="berita-acara"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Berita Acara
                  </TabsTrigger>
                  <TabsTrigger
                    value="sop-terkait"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    SOP Terkait ({pengajuan.sopList?.length ?? 0})
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab: Berita Acara Document */}
              <TabsContent value="berita-acara" className="mt-6">
                <div className="rounded-lg border bg-gray-50 p-6">
                  <BeritaAcaraTemplate
                    opd={pengajuan.opdNama ?? pengajuan.opd?.nama ?? ''}
                    nomorBA={pengajuan.nomorBA}
                    tanggalVerifikasi={pengajuan.tanggalVerifikasi}
                    namaBiro={pengajuan.namaBiro}
                    tteSignaturePayload={pengajuan.tteSignaturePayload as any}
                  />
                </div>
              </TabsContent>

              {/* Tab: Related SOPs */}
              <TabsContent value="sop-terkait" className="mt-6">
                {pengajuan.sopList && pengajuan.sopList.length > 0 ? (
                  <div className="space-y-3">
                    {pengajuan.sopList.map((sop) => (
                      <div
                        key={sop.id}
                        className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{sop.judul}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                              <div>
                                Nomor SOP:{' '}
                                <span className="font-mono font-medium">
                                  {sop.nomorSOP ?? sop.nomor ?? '-'}
                                </span>
                              </div>
                              <div>
                                Status:{' '}
                                <span className="font-medium">{sop.status ?? '-'}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate({
                                to: ROUTES.TIM_PENYUSUN.DETAIL_SOP,
                                params: { id: sop.sopDetailId },
                              })
                            }
                          >
                            <FileText className="mr-1 h-4 w-4" />
                            Lihat SOP
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FileSpreadsheet className="mb-3 h-12 w-12" />
                    <p className="text-sm font-medium">Tidak ada SOP terkait</p>
                    <p className="text-xs">SOP akan muncul setelah evaluasi selesai</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </>
      }
    />

    <PinVerificationDialog
      open={tteDialogOpen}
      onOpenChange={setTteDialogOpen}
      title="Verifikasi PIN TTE"
      description="Masukkan PIN TTE BSRE untuk menandatangani Berita Acara ini."
      onConfirm={handlePinConfirm}
    />
    </>
  )
}

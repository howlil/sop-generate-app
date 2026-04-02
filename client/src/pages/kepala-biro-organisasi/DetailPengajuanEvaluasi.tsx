import { useState, useMemo } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { CheckCircle, List, MessageSquare, Calendar, History, Printer } from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { SOPListCard } from '@/components/sop/SOPListCard'
import { formatDateId } from '@/utils/format-date'
import { PinVerificationDialog } from '@/components/tte/PinVerificationDialog'
import { useTTESignature } from '@/hooks/useTTE'
import { usePengajuanEvaluasiDetail } from '@/hooks/useEvaluasi'
import { ROUTES } from '@/utils/constants/routes'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { NotFoundWithBack } from '@/components/ui/not-found'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { useToast } from '@/hooks/useUI'
import { StatusBadge } from '@/components/ui/status-badge'
import { InfoField, InfoGrid } from '@/components/ui/info-field'
import { RiwayatCardList } from '@/components/evaluasi/RiwayatCardList'
import { BeritaAcaraTemplate } from '@/components/berita-acara/BeritaAcaraTemplate'
import { InfoCard } from '@/components/ui/info-card'
import { useDocumentTitle } from '@/utils/use-document-title'
import { IA } from '@/utils/constants/pipeline-ia'

const PRINT_DELAY_MS = 150

export function DetailPengajuanEvaluasi() {
  const { id } = useParams({ from: '/biro-organisasi/manajemen-evaluasi-sop/detail/$id' })
  const { showToast } = useToast()
  const { 
    pengajuan,
    updatePengajuan,
    mergedSopRows,
    handleVerify,
    isVerified,
    canVerify
  } = usePengajuanEvaluasiDetail(id)
  const [previewMainTab, setPreviewMainTab] = useState<'sop' | 'ba'>('sop')
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'catatan' | 'riwayat'>('catatan')
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)

  const tte = useTTESignature({
    role: 'biro-organisasi',
    documentId: pengajuan ? `pengajuan-evaluasi-${pengajuan.id}` : undefined,
  })

  const handlePinConfirm = tte.createPinConfirmHandler(
    {
      documentLabel: pengajuan?.opdNama ?? '',
      referenceId: pengajuan?.id ?? '',
    },
    () => {
      handleVerify()
      showToast('Verifikasi Berita Acara (Biro) berhasil. Koordinator Tim Penyusun dapat melanjutkan verifikasi BA.')
    }
  )

  const sopList = pengajuan?.sopList ?? []
  const firstSopDetailId = sopList[0]?.sopDetailId ?? null
  const effectiveSopDetailId = selectedSopId ?? firstSopDetailId
  const displaySop = sopList.find((s) => s.sopDetailId === effectiveSopDetailId)

  const riwayatOpd: any[] = []
  const riwayatSop: any[] = []

  useDocumentTitle(pengajuan ? `${IA.TERJADWAL_EVALUASI_OPD} — ${pengajuan.opdNama}` : undefined)

  if (!pengajuan) {
    return (
      <NotFoundWithBack
        message="Pengajuan evaluasi tidak ditemukan."
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
          { label: IA.NAV_BIRO_EVALUASI_TERJADWAL, to: ROUTES.BIRO_ORGANISASI.EVALUASI_SOP },
          { label: pengajuan.opdNama },
        ]}
        title={`${IA.TERJADWAL_EVALUASI_OPD} — ${pengajuan.opdNama}`}
        description={`${IA.VERIFIKASI_BA_BIRO} pada dokumen ${IA.BERITA_ACARA}. Setelah ini: Koordinator → ${IA.PENGESAHAN_SOP} oleh Kepala OPD.`}
        backTo={ROUTES.BIRO_ORGANISASI.EVALUASI_SOP}
        backSize="icon"
        header={
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-semibold text-gray-900">Informasi OPD & Evaluasi</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    setPreviewMainTab('sop')
                    setTimeout(() => window.print(), PRINT_DELAY_MS)
                  }}
                  disabled={pengajuan.status !== 'SELESAI_DIEVALUASI'}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak BA
                </Button>
                {canVerify && (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => tte.openDialog()}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verifikasi BA
                  </Button>
                )}
              </div>
            </div>

            <InfoGrid>
              <InfoField label="OPD" value={pengajuan.opdNama} />
              <InfoField label="Jenis" value={pengajuan.jenis} />
              <InfoField 
                label="Status" 
                value={
                  <StatusBadge status={pengajuan.status} />
                }
              />
              <InfoField 
                label="Tanggal Evaluasi" 
                value={pengajuan.tanggalEvaluasi ? formatDateId(pengajuan.tanggalEvaluasi) : '-'}
              />
              {pengajuan.nilaiOPD && (
                <InfoField label="Nilai OPD" value={pengajuan.nilaiOPD.toString()} />
              )}
            </InfoGrid>

            {isVerified && (
              <InfoCard
                variant="success"
                icon={CheckCircle}
                title="Berita Acara telah diverifikasi"
                description="Koordinator Tim Penyusun dapat melanjutkan verifikasi. Setelah itu, Kepala OPD dapat mengesahkan SOP."
              />
            )}
          </>
        }
        leftPanel={
          <CollapsibleSidePanel
            title="Daftar SOP"
            icon={List}
            collapsed={leftPanelCollapsed}
            onToggleCollapse={() => setLeftPanelCollapsed((s) => !s)}
          >
            <div className="space-y-2">
              {sopList.map((sop) => (
                <SOPListCard
                  key={sop.sopDetailId}
                  id={sop.sopDetailId}
                  nomor={sop.nomor}
                  nama={sop.nama}
                  status={sop.hasil === 'SESUAI' ? 'SIAP_DIVERIFIKASI' : 'REVISI_DARI_TIM_EVALUASI'}
                  isSelected={sop.sopDetailId === effectiveSopDetailId}
                  onClick={() => setSelectedSopId(sop.sopDetailId)}
                />
              ))}
            </div>
          </CollapsibleSidePanel>
        }
        rightPanel={
          <CollapsibleSidePanel
            title="Catatan & Riwayat"
            icon={rightPanelTab === 'catatan' ? MessageSquare : History}
            collapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed((s) => !s)}
            header={
              <div className="flex items-center gap-1">
                <button
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    rightPanelTab === 'catatan'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setRightPanelTab('catatan')}
                >
                  Catatan
                </button>
                <button
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    rightPanelTab === 'riwayat'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setRightPanelTab('riwayat')}
                >
                  Riwayat
                </button>
              </div>
            }
          >
            {rightPanelTab === 'catatan' ? (
              <div className="space-y-2 text-sm text-gray-600">
                {pengajuan.catatan ? (
                  <p className="whitespace-pre-wrap">{pengajuan.catatan}</p>
                ) : (
                  <p className="text-gray-400 italic">Tidak ada catatan</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <RiwayatCardList
                  riwayatOpd={riwayatOpd}
                  riwayatSop={riwayatSop}
                  emptyMessage="Belum ada riwayat evaluasi"
                />
              </div>
            )}
          </CollapsibleSidePanel>
        }
      >
        {previewMainTab === 'sop' && displaySop && (
          <SOPPreviewTemplate
            sopDetailId={displaySop.sopDetailId}
            initialTab="prosedur"
          />
        )}

        {previewMainTab === 'ba' && pengajuan && (
          <BeritaAcaraTemplate pengajuan={pengajuan} />
        )}
      </DetailPageLayout>

      <PinVerificationDialog
        open={tte.isDialogOpen}
        onOpenChange={tte.setIsDialogOpen}
        role="biro-organisasi"
        onPinConfirm={handlePinConfirm}
      />
    </>
  )
}

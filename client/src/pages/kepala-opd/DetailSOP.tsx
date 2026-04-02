import { useState, useMemo } from 'react'
import { useParams, useLocation, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  History,
  Calendar,
  Building2,
  Users,
  RefreshCw,
  Printer,
  Ban,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { VersionHistoryPanel, SOPPreviewTemplate } from '@/features/sop'
import { InfoField } from '@/components/ui/info-field'
import { PinVerificationDialog } from '@/features/tte'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/utils/ui'
import { useSopStatus, type StatusSOP, type DetailSOPVersionSeed } from '@/features/sop'
import {
  getInitialSopDetailImplementers,
  getInitialSopDetailProsedurRows,
  useDetailSopById,
  useEditHistory,
} from '@/features/sop'
import { useEvaluasiDetail } from '@/features/evaluasi'
import { formatDateIdLong } from '@/utils/format-date'
import * as versionDiff from '@/utils/version-diff'
import { useTTESignature } from '@/features/tte'
import { evaluasiApi } from '@/features/evaluasi'
import { queryKeys } from '@/utils/query-keys'
import { canKepalaOpdSignSop, isSopEligibleForSigning } from '@/features/sop'
import { getKepalaOPDOpdId } from '@/utils/role'
import { useOpd } from '@/features/organisasi'
import { ROUTES } from '@/utils/constants'

type Version = DetailSOPVersionSeed

export interface DetailSOPProps {
  /** Breadcrumb (default: Daftar SOP → Detail SOP). */
  breadcrumb?: { label: string; to?: string }[]
  /** Back link (default: Daftar SOP). */
  backTo?: string
  /** Tampilkan tombol Mengesahkan (TTE) bila SOP status Terverifikasi dari Biro. Default true (Kepala OPD). Set false untuk view-only (Biro). */
  showSignButton?: boolean
}

export function DetailSOP(props: DetailSOPProps = {}) {
  const {
    breadcrumb,
    backTo,
    showSignButton = true,
  } = props
  const { showToast } = useToast()
  const { getSopStatusOverride, setSopStatusOverride } = useSopStatus()
  const { data: pengajuanList = [] } = useQuery({
    queryKey: queryKeys.evaluasiList(),
    queryFn: () => evaluasiApi.findAll(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
  const opdId = getKepalaOPDOpdId()
  const { list: opds } = useOpd()
  const opdName = opds.find((o) => o.id === opdId)?.nama ?? ''
  const params = useParams({ strict: false })
  const id = 'id' in params ? params.id : undefined
  const location = useLocation()
  const detailMetaState = location.state as {
    sopStatus?: StatusSOP
    waktuPenugasan?: string
    unitTerkait?: string
    timPenyusun?: string
    terakhirDiperbarui?: string
    deskripsiProyek?: string
  } | undefined
  const sopStatus: StatusSOP =
    (id ? getSopStatusOverride(id) : undefined) ??
    detailMetaState?.sopStatus ??
    DEFAULT_SOP_STATUS

  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [viewingVersion, setViewingVersion] = useState<Version | null>(null)
  const [cabutConfirmOpen, setCabutConfirmOpen] = useState(false)

  const implementers = getInitialSopDetailImplementers()
  const prosedurRows = getInitialSopDetailProsedurRows()

  // Use real API instead of stubs
  const { data: sopDetail } = useDetailSopById(id ?? '')
  const { data: editHistory = [] } = useEditHistory(id ?? '')
  const { data: pengajuanEvaluasi } = useEvaluasiDetail(pengajuanId ?? '')

  // Transform API data to component format
  const metadata = useMemo(() => {
    if (!sopDetail) return { id: '', name: '', number: '', lembaga: '', logoUrl: '', tanggalEfektif: '', tanggalRevisi: '' }
    return {
      id: sopDetail.id,
      name: sopDetail.namaLembaga,
      number: sopDetail.nomorSOP,
      lembaga: sopDetail.namaLembaga,
      logoUrl: sopDetail.logoInstansi,
      tanggalEfektif: sopDetail.tanggalEfektif ?? '',
      tanggalRevisi: sopDetail.tanggalRevisi ?? '',
    }
  }, [sopDetail])

  const versionDiffItems = useMemo(
    () => versionDiff.computeVersionDiff(metadata, prosedurRows, viewingVersion?.snapshot ?? undefined),
    [viewingVersion, metadata, prosedurRows]
  )

  const tte = useTTESignature({ role: 'kepala-opd', documentId: id })

  const handlePinConfirm = tte.createPinConfirmHandler(
    { documentLabel: metadata.name, referenceId: metadata.number || id || '' },
    () => {
      if (id) setSopStatusOverride(id, 'Berlaku')
      showToast('SOP berhasil disahkan dengan TTE BSRE.')
    }
  )

  const handleCabutSop = () => {
    if (id) {
      setSopStatusOverride(id, 'Dicabut')
      showToast('SOP berhasil dicabut.')
    }
  }

  /** Kepala OPD hanya menandatangani SOP (TTE). Tanpa tugas Setuju/Tolak atau pemeriksaan. */
  const versions: Version[] = useMemo(() => {
    if (!editHistory || editHistory.length === 0) return []
    return editHistory.map(log => ({
      version: log.versiSOP.toString(),
      author: log.dibuatOleh?.nama ?? 'Unknown',
      date: log.createdAt,
      changes: log.perubahan?.join(', ') ?? '',
      snapshot: undefined, // TODO: load actual snapshot
    }))
  }, [editHistory])

  const effectiveBreadcrumb = breadcrumb ?? [
    { label: 'Pantau SOP', to: ROUTES.KEPALA_OPD.PANTAU_SOP },
    { label: 'Detail SOP' },
  ]
  const effectiveBackTo = backTo ?? ROUTES.KEPALA_OPD.PANTAU_SOP
  const canShowSignButton =
    showSignButton &&
    canKepalaOpdSignSop(sopStatus, pengajuanList, opdId, id ?? '')
  const needBaSignFirst =
    showSignButton &&
    isSopEligibleForSigning(sopStatus) &&
    !canShowSignButton

  const createdBy = versions.length > 0 ? versions[versions.length - 1]?.author : undefined
  const evaluatedBy = pengajuanEvaluasi?.diselesaikanOleh?.nama

  const workspaceHeaderToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Kiri: detail SOP (info + print + versi + status) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
        {createdBy && (
          <span>
            <span className="font-medium text-gray-500">Penyusun:</span>{' '}
            <span className="text-gray-800">{createdBy}</span>
          </span>
        )}
        {evaluatedBy && (
          <span>
            <span className="font-medium text-gray-500">Evaluator:</span>{' '}
            <span className="text-gray-800">{evaluatedBy}</span>
          </span>
        )}
        <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
          Versi {versions[0]?.version || '1.0'}
        </Badge>
        <StatusBadge status={sopStatus} className="text-xs border-0" />
      </div>
      {/* Kanan: tombol aksi (Print + Tanda tangan) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
          onClick={() => window.print()}
        >
          <Printer className="w-3.5 h-3.5" /> Print SOP
        </Button>
        {canShowSignButton && (
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={tte.openPinDialog}
            disabled={!tte.canSign}
            title={!tte.canSign ? 'Setup TTE terlebih dahulu' : 'Mengesahkan SOP dengan TTE BSRE'}
          >
            Tanda tangan
          </Button>
        )}
        {needBaSignFirst && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
            Tandatangani <Link to={ROUTES.KEPALA_OPD.BERITA_ACARA} search={{ id: undefined }} className="underline font-medium">Berita Acara</Link> terlebih dahulu untuk mengesahkan SOP.
          </span>
        )}
        {showSignButton && sopStatus === 'Berlaku' && id && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 rounded-md border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            onClick={() => setCabutConfirmOpen(true)}
            title="Cabut SOP — status menjadi Dicabut"
          >
            <Ban className="w-3.5 h-3.5" /> Cabut SOP
          </Button>
        )}
      </div>
    </div>
  )

  const hasProyekInfo = Boolean(
    detailMetaState?.waktuPenugasan ?? detailMetaState?.unitTerkait ?? detailMetaState?.timPenyusun ?? detailMetaState?.deskripsiProyek
  )

  return (
    <>
    <DetailPageLayout
      breadcrumb={effectiveBreadcrumb}
      title="Detail Dokumen SOP"
      description={metadata.name}
      backTo={effectiveBackTo}
      backSize="icon"
      actions={null}
      header={
        <>
          {workspaceHeaderToolbar}
          {hasProyekInfo && (
            <>
              <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Informasi SOP</h2>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-2">
                {detailMetaState?.waktuPenugasan && (
                  <InfoField label="Waktu pembuatan" icon={<Calendar />}>
                    {detailMetaState.waktuPenugasan.includes('-')
                      ? formatDateIdLong(detailMetaState.waktuPenugasan + 'T00:00:00')
                      : detailMetaState.waktuPenugasan}
                  </InfoField>
                )}
                {detailMetaState?.unitTerkait && (
                  <InfoField label="Unit" icon={<Building2 />}>
                    {detailMetaState.unitTerkait}
                  </InfoField>
                )}
                {detailMetaState?.timPenyusun && (
                  <InfoField label="Tim" icon={<Users />}>
                    {detailMetaState.timPenyusun}
                  </InfoField>
                )}
                {detailMetaState?.terakhirDiperbarui && (
                  <InfoField label="Diperbarui" icon={<RefreshCw />}>
                    {detailMetaState.terakhirDiperbarui}
                  </InfoField>
                )}
              </div>
              {detailMetaState?.deskripsiProyek && (
                <p className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 leading-relaxed max-w-full" title={detailMetaState.deskripsiProyek}>
                  {detailMetaState.deskripsiProyek}
                </p>
              )}
            </>
          )}
        </>
      }
      main={
          <div className="flex flex-col h-full p-4">
            <SOPPreviewTemplate
              metadata={metadata}
              prosedurRows={prosedurRows}
              implementers={implementers}
              tteSignaturePayload={tte.ttePayload}
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
            />
          </div>
      }
      rightPanel={
          <CollapsibleSidePanel
            side="right"
            collapsed={isRightPanelCollapsed}
            onCollapsedChange={setIsRightPanelCollapsed}
            widthCollapsed="w-10 min-w-[2.5rem]"
            widthExpanded="w-full"
            collapseButtonLabel="Riwayat"
            collapseButtonIcon={<History className="w-4 h-4 text-gray-500" />}
            tabs={[{ id: 'riwayat', label: 'Riwayat', icon: <History className="w-3.5 h-3.5" /> }]}
            activeTab="riwayat"
            onTabChange={() => {}}
          >
            <VersionHistoryPanel
              variant="cards"
              versions={versions.map((v: Version) => ({
                id: v.id,
                version: v.version,
                date: v.date,
                author: v.author,
                changes: v.changes,
                snapshot: v.snapshot,
              }))}
              summary={`${versions.length} versi terdokumentasi`}
              viewingVersion={viewingVersion ? { id: viewingVersion.id, version: viewingVersion.version, date: viewingVersion.date, author: viewingVersion.author, changes: viewingVersion.changes, snapshot: viewingVersion.snapshot } : null}
              setViewingVersion={(v) => setViewingVersion(v ? versions.find((vx: Version) => vx.id === v.id) ?? null : null)}
              versionDiff={versionDiffItems}
            />
          </CollapsibleSidePanel>
      }
      workspaceClassName="print:hidden"
    />
    <PinVerificationDialog
      open={tte.pinDialogOpen}
      onOpenChange={tte.setPinDialogOpen}
      title="Verifikasi PIN TTE"
      description="Masukkan PIN TTE BSRE untuk mengesahkan SOP ini."
      onConfirm={handlePinConfirm}
      confirmLabel="Mengesahkan"
    />
    <ConfirmDialog
      open={cabutConfirmOpen}
      onOpenChange={setCabutConfirmOpen}
      title="Cabut SOP?"
      description="SOP ini akan berstatus Dicabut dan tidak lagi berlaku. Anda dapat mengajukan evaluasi ulang jika nanti akan diaktifkan kembali."
      confirmLabel="Cabut SOP"
      cancelLabel="Batal"
      destructive
      onConfirm={handleCabutSop}
    />
  </>
  )
}

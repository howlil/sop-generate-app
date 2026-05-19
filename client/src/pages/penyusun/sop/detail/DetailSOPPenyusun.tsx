import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { useAppRole } from '@/hooks/useAppRole'
import { useToast } from '@/hooks/useToast'
import { ROUTES } from '@/utils/constants'
import { useUmpanBalikEvaluasi } from '@/api/evaluasi'
import { getKirimUlangBlockingReason } from '@/lib/evaluasi/evaluasi-domain'
import {
  useBuatVersiBaru,
  useDetailSopPenyusun,
  useResolveSopKomentar,
  useRiwayatVersi,
  useSopKomentar,
} from '@/api/sop'
import { BuatVersiBaruDialog } from '@/pages/penyusun/sop/components/BuatVersiBaruDialog'
import { getBuatVersiBaruBlockingReason } from '@/lib/sop/sop-version-domain'
import type { StatusSOP } from '@/types/dto/sop.dto'
import type { SopHeaderAutosaveStatus } from '@/hooks/useSopHeaderAutosave'
import type { SopProsedurAutosaveStatus } from '@/hooks/useSopProsedurAutosave'
import { DetailSOPPenyusunHeader } from './components/DetailSopPenyusunHeader'
import { DetailSOPPenyusunMain } from './components/DetailSopPenyusunMain'
import { DetailSOPPenyusunSidePanel } from './components/DetailSopPenyusunSidePanel'
import { SopEditorProvider, type SopEditorContextValue } from './SopEditorContext'

type CombinedAutosaveStatus = SopHeaderAutosaveStatus

/**
 * Gabungkan dua status autosave (header + prosedur) menjadi satu indikator UI.
 * Prioritas: error > saving > pending > saved > idle.
 */
function combineAutosaveStatus(
  header: SopHeaderAutosaveStatus,
  prosedur: SopProsedurAutosaveStatus,
): CombinedAutosaveStatus {
  const order: CombinedAutosaveStatus[] = ['error', 'saving', 'pending', 'saved', 'idle']
  for (const candidate of order) {
    if (header === candidate || prosedur === candidate) return candidate
  }
  return 'idle'
}

export function DetailSOPPenyusun() {
  const { role } = useAppRole()
  const { id } = useParams({ from: '/penyusun/sop/$id' })
  const navigate = useNavigate()
  const { showToast } = useToast()

  const {
    metadata,
    setMetadata: _setMetadata,
    prosedurRows,
    setProsedurRows,
    implementers,
    setImplementers,
    diagramVersion,
    setDiagramVersion,
    activeTab,
    setActiveTab,
    isEditingSteps,
    setIsEditingSteps,
    isEditPanelCollapsed,
    setIsEditPanelCollapsed,
    rightPanelTab,
    setRightPanelTab,
    masterPelaksanaOptions,
    relatedSopOptions,
    peraturanList,
    auditLogs,
    currentSopStatus,
    currentSopStatusLabel,
    isRevisionFlow,
    primaryActionLabel,
    handleMetadataChange,
    handleComplete,
    isKirimUlangKeEvaluatorPending,
    autosaveStatus,
    autosaveError,
    flushHeaderAutosave,
    prosedurAutosaveStatus,
    prosedurAutosaveError,
    flushProsedurAutosave,
    canEditDetail,
  } = useDetailSopPenyusun(id, undefined, undefined)

  const isReadOnly = !canEditDetail

  useEffect(() => {
    if (isReadOnly) {
      setIsEditingSteps(false)
    }
  }, [isReadOnly, setIsEditingSteps])
  /* `setMetadata` perlu di-cast karena hook mengembalikan dispatcher yang sama persis
     bentuknya dengan tipe context — alias ini hanya untuk memenuhi naming convention. */
  const setMetadata = _setMetadata

  const { data: umpanBalik, isLoading: isUmpanBalikLoading } = useUmpanBalikEvaluasi(
    id,
    isRevisionFlow || currentSopStatus === 'REVISI_DARI_EVALUATOR',
  )
  const kirimUlangBlockingReason = isRevisionFlow
    ? getKirimUlangBlockingReason(umpanBalik ?? null)
    : null

  const sopHeaderId = metadata.sopId
  const { data: riwayatVersi = [] } = useRiwayatVersi(sopHeaderId)
  const { mutateAsync: buatVersiBaru, isPending: isBuatVersiBaruPending } = useBuatVersiBaru()
  const [isBuatVersiDialogOpen, setIsBuatVersiDialogOpen] = useState(false)
  const terminalStatuses: StatusSOP[] = ['BERLAKU', 'DIGANTIKAN', 'DICABUT']
  const hasRevisiInFlight = riwayatVersi.some(
    (row) => !terminalStatuses.includes(row.status as StatusSOP),
  )
  const canBuatVersiBaru =
    currentSopStatus === 'BERLAKU' && !hasRevisiInFlight
  const buatVersiBaruBlockingReason = canBuatVersiBaru
    ? null
    : getBuatVersiBaruBlockingReason({
        id: sopHeaderId ?? '',
        opdId: '',
        detailSopId: id,
        judul: metadata.nama ?? '',
        nomorSop: metadata.nomorSOP ?? null,
        pembuat: null,
        terakhirDiedit: { nama: null, waktu: null },
        status: currentSopStatus,
        statusLabel: currentSopStatusLabel,
        peraturanId: null,
        terakhirDiperbarui: null,
        versiBerlaku: { detailSopId: id, versi: metadata.version ?? 1, nomorSop: metadata.nomorSOP ?? '', status: 'BERLAKU', statusLabel: 'Berlaku' },
        canBuatVersiBaru: false,
      })

  const { data: komentarList, isLoading: isKomentarLoading } = useSopKomentar(
    isRevisionFlow ? undefined : id,
  )
  const { mutateAsync: resolveKomentarAsync, isPending: isResolvingKomentar } =
    useResolveSopKomentar(id)

  /* Toast error autosave sekali per error reference (hindari spam saat re-render). */
  const lastHeaderErrorRef = useRef<Error | null>(null)
  useEffect(() => {
    if (isReadOnly) return
    if (autosaveError && autosaveError !== lastHeaderErrorRef.current) {
      lastHeaderErrorRef.current = autosaveError
      showToast(`Gagal autosave header SOP: ${autosaveError.message}`, 'error')
    }
    if (autosaveError === null) {
      lastHeaderErrorRef.current = null
    }
  }, [autosaveError, showToast, isReadOnly])

  const lastProsedurErrorRef = useRef<Error | null>(null)
  useEffect(() => {
    if (isReadOnly) return
    if (prosedurAutosaveError && prosedurAutosaveError !== lastProsedurErrorRef.current) {
      lastProsedurErrorRef.current = prosedurAutosaveError
      showToast(
        `Gagal autosave langkah/aktor pelaksana: ${prosedurAutosaveError.message}`,
        'error',
      )
    }
    if (prosedurAutosaveError === null) {
      lastProsedurErrorRef.current = null
    }
  }, [prosedurAutosaveError, showToast, isReadOnly])

  /* Best-effort flush sebelum tab disembunyikan / ditutup / refresh. */
  useEffect(() => {
    if (isReadOnly) return
    const flushBothFireAndForget = (): void => {
      void flushHeaderAutosave()
      void flushProsedurAutosave()
    }
    const flushBothAwaited = (): void => {
      void Promise.all([flushHeaderAutosave(), flushProsedurAutosave()])
    }
    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        flushBothAwaited()
      }
    }
    window.addEventListener('beforeunload', flushBothFireAndForget)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', flushBothAwaited)
    return () => {
      window.removeEventListener('beforeunload', flushBothFireAndForget)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', flushBothAwaited)
      flushBothAwaited()
    }
  }, [flushHeaderAutosave, flushProsedurAutosave, isReadOnly])

  const editorContextValue = useMemo<SopEditorContextValue>(
    () => ({
      sopDetailId: id,
      metadata,
      setMetadata,
      handleMetadataChange,
      implementers,
      setImplementers,
      masterPelaksanaOptions,
      peraturanList,
      relatedSopOptions,
      prosedurRows,
      setProsedurRows,
      autosaveStatus,
      autosaveError,
      flushHeaderAutosave,
      prosedurAutosaveStatus,
      prosedurAutosaveError,
      flushProsedurAutosave,
      komentarList: komentarList ?? [],
      isKomentarLoading,
      resolveKomentar: resolveKomentarAsync,
      isResolvingKomentar,
      isReadOnly,
    }),
    [
      id,
      metadata,
      setMetadata,
      handleMetadataChange,
      implementers,
      setImplementers,
      masterPelaksanaOptions,
      peraturanList,
      relatedSopOptions,
      prosedurRows,
      setProsedurRows,
      autosaveStatus,
      autosaveError,
      flushHeaderAutosave,
      prosedurAutosaveStatus,
      prosedurAutosaveError,
      flushProsedurAutosave,
      komentarList,
      isKomentarLoading,
      resolveKomentarAsync,
      isResolvingKomentar,
      isReadOnly,
    ],
  )

  /* Status gabungan header + prosedur untuk satu indikator autosave di header.
     Prioritas: error > saving > pending > saved > idle. */
  const combinedAutosaveStatus = useMemo(() => combineAutosaveStatus(autosaveStatus, prosedurAutosaveStatus), [
    autosaveStatus,
    prosedurAutosaveStatus,
  ])
  const combinedFlushAutosave = useCallback(async () => {
    await Promise.all([flushHeaderAutosave(), flushProsedurAutosave()])
  }, [flushHeaderAutosave, flushProsedurAutosave])

  return (
    <SopEditorProvider value={editorContextValue}>
      <DetailPageLayout
        breadcrumb={[
          { label: 'Manajemen SOP', to: ROUTES.PENYUSUN.SOP },
          { label: isReadOnly ? 'Lihat SOP' : 'Edit SOP' },
        ]}
        title={isReadOnly ? 'Lihat Dokumen SOP' : 'Edit Dokumen SOP'}
        description={metadata.nama ?? metadata.judul ?? ''}
        backTo={ROUTES.PENYUSUN.SOP}
        backSize="icon"
        workspaceClassName="print:hidden"
        header={
          <DetailSOPPenyusunHeader
            metadata={metadata}
            currentSopStatus={currentSopStatus}
            currentSopStatusLabel={currentSopStatusLabel}
            isRevisionFlow={isRevisionFlow}
            primaryActionLabel={primaryActionLabel}
            autosaveStatus={combinedAutosaveStatus}
            onRetryAutosave={combinedFlushAutosave}
            onComplete={() => handleComplete(id, role ?? null, navigate)}
            onPrint={() => window.print()}
            isReadOnly={isReadOnly}
            isPrimaryActionPending={isKirimUlangKeEvaluatorPending}
            kirimUlangBlockingReason={kirimUlangBlockingReason}
            canBuatVersiBaru={canBuatVersiBaru}
            buatVersiBaruBlockingReason={
              currentSopStatus === 'BERLAKU' ? buatVersiBaruBlockingReason : null
            }
            onBuatVersiBaru={() => setIsBuatVersiDialogOpen(true)}
            isBuatVersiBaruPending={isBuatVersiBaruPending}
          />
        }
        main={
          <DetailSOPPenyusunMain
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
            isEditingSteps={isEditingSteps}
            setIsEditingSteps={setIsEditingSteps}
            diagramVersion={diagramVersion}
            onDiagramVersionChange={() => setDiagramVersion((v) => v + 1)}
          />
        }
        rightPanel={
          <DetailSOPPenyusunSidePanel
            collapsed={isEditPanelCollapsed}
            onCollapsedChange={setIsEditPanelCollapsed}
            rightPanelTab={rightPanelTab}
            onTabChange={setRightPanelTab}
            auditEntries={auditLogs ?? []}
            editTabLabel={isReadOnly ? 'Informasi' : 'Edit'}
            isRevisionFlow={isRevisionFlow}
            umpanBalik={umpanBalik ?? null}
            isUmpanBalikLoading={isUmpanBalikLoading}
            isReadOnly={isReadOnly}
            detailSopId={id}
            sopId={sopHeaderId}
          />
        }
      />
      <BuatVersiBaruDialog
        open={isBuatVersiDialogOpen}
        onOpenChange={setIsBuatVersiDialogOpen}
        judulSop={metadata.nama ?? metadata.judul ?? 'SOP'}
        versiSaatIni={metadata.version ?? 1}
        isPending={isBuatVersiBaruPending}
        onConfirm={async () => {
          const workbench = await buatVersiBaru(id)
          setIsBuatVersiDialogOpen(false)
          void navigate({
            to: ROUTES.PENYUSUN.DETAIL_SOP,
            params: { id: workbench.detail.id },
          })
        }}
      />
    </SopEditorProvider>
  )
}

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { useAppRole } from '@/hooks/useAppRole'
import { useToast } from '@/hooks/useToast'
import type { StatusSOP } from "@/types/dto/sop.dto";
import { ROUTES } from '@/utils/constants'
import { useDetailSopPenyusun, useResolveSopKomentar, useSopKomentar } from '@/api/sop'
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
  const location = useLocation()
  const { showToast } = useToast()
  const detailMetaState = location.state as { sopStatus?: StatusSOP } | undefined

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
    isRevisionFlow,
    primaryActionLabel,
    handleMetadataChange,
    handleComplete,
    autosaveStatus,
    autosaveError,
    flushHeaderAutosave,
    prosedurAutosaveStatus,
    prosedurAutosaveError,
    flushProsedurAutosave,
    canEditDetail,
  } = useDetailSopPenyusun(id, detailMetaState?.sopStatus, undefined)

  const isReadOnly = !canEditDetail

  useEffect(() => {
    if (isReadOnly) {
      setIsEditingSteps(false)
    }
  }, [isReadOnly, setIsEditingSteps])
  /* `setMetadata` perlu di-cast karena hook mengembalikan dispatcher yang sama persis
     bentuknya dengan tipe context — alias ini hanya untuk memenuhi naming convention. */
  const setMetadata = _setMetadata

  const { data: komentarList, isLoading: isKomentarLoading } = useSopKomentar(id)
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
            isRevisionFlow={isRevisionFlow}
            primaryActionLabel={primaryActionLabel}
            autosaveStatus={combinedAutosaveStatus}
            onRetryAutosave={combinedFlushAutosave}
            onComplete={() => handleComplete(id, role ?? null, navigate)}
            onPrint={() => window.print()}
            isReadOnly={isReadOnly}
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
          />
        }
      />
    </SopEditorProvider>
  )
}

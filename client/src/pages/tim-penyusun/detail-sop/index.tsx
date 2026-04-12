import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { useAppRole } from '@/features/auth'
import type { StatusSOP } from '@/features/sop'
import { ROUTES } from '@/utils/constants'
import { useDetailSopPenyusun } from '@/features/sop/hooks/useDetailSopPenyusun'
import { DetailSOPPenyusunHeader } from './components/DetailSOPPenyusunHeader'
import { DetailSOPPenyusunMain } from './components/DetailSOPPenyusunMain'
import { DetailSOPPenyusunSidePanel } from './components/DetailSOPPenyusunSidePanel'

export function DetailSOPPenyusun() {
  const { role } = useAppRole()
  const { id } = useParams({ from: '/tim-penyusun/detail-sop/$id' })
  const navigate = useNavigate()
  const location = useLocation()
  const detailMetaState = location.state as { sopStatus?: StatusSOP } | undefined

  // Extracted hook - all state and logic
  const {
    metadata,
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
    peraturanList,
    auditLogs,
    currentSopStatus,
    isRevisionFlow,
    primaryActionLabel,
    handleMetadataChange,
    handleSaveDraft,
    handleComplete,
    komentarDisplay,
  } = useDetailSopPenyusun(id, detailMetaState?.sopStatus, undefined)

  return (
    <DetailPageLayout
      breadcrumb={[
        { label: 'Manajemen SOP', to: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP },
        { label: 'Edit SOP' },
      ]}
      title="Edit Dokumen SOP"
      description={metadata.name}
      backTo={ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP}
      backSize="icon"
      workspaceClassName="print:hidden"
      header={
        <DetailSOPPenyusunHeader
          metadata={metadata}
          currentSopStatus={currentSopStatus}
          isRevisionFlow={isRevisionFlow}
          primaryActionLabel={primaryActionLabel}
          onSaveDraft={() => handleSaveDraft(id, role ?? null)}
          onComplete={() => handleComplete(id, role ?? null, navigate)}
          onPrint={() => window.print()}
        />
      }
      main={
        <DetailSOPPenyusunMain
          metadata={metadata}
          prosedurRows={prosedurRows}
          setProsedurRows={setProsedurRows}
          implementers={implementers}
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
          metadata={metadata}
          onMetadataChange={handleMetadataChange}
          implementers={implementers}
          onImplementersChange={setImplementers}
          masterPelaksanaOptions={masterPelaksanaOptions}
          peraturanList={peraturanList}
          auditEntries={auditLogs ?? []}
          komentarDisplay={komentarDisplay}
        />
      }
    />
  )
}

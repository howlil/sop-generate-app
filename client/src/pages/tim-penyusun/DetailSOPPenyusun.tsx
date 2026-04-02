import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { useToast } from '@/utils/ui'
import { useAppRole } from '@/features/auth'
import { useSopStatus, type StatusSOP } from '@/features/sop'
import { formatDateIdLong } from '@/utils/format-date'
import { ROUTES } from '@/utils/constants'
import { useDetailSOPPenyusun } from '@/features/sop/hooks/useDetailSOPPenyusun'
import { DetailSOPPenyusunHeader } from './detail-sop/DetailSOPPenyusunHeader'
import { DetailSOPPenyusunMain } from './detail-sop/DetailSOPPenyusunMain'
import { DetailSOPPenyusunSidePanel } from './detail-sop/DetailSOPPenyusunSidePanel'

export function DetailSOPPenyusun() {
  const { showToast } = useToast()
  const { role } = useAppRole()
  const { id } = useParams({ from: '/tim-penyusun/detail-sop/$id' })
  const navigate = useNavigate()
  const location = useLocation()
  const detailMetaState = location.state as { sopStatus?: StatusSOP } | undefined

  // Extracted hook - all state and logic
  const {
    metadata,
    setMetadata,
    prosedurRows,
    setProsedurRows,
    implementers,
    setImplementers,
    versions,
    diagramVersion,
    setDiagramVersion,
    activeTab,
    setActiveTab,
    isEditingSteps,
    setIsEditingSteps,
    isHistoryOpen,
    setIsHistoryOpen,
    isEditPanelCollapsed,
    setIsEditPanelCollapsed,
    rightPanelTab,
    setRightPanelTab,
    viewingVersion,
    setViewingVersion,
    masterPelaksanaOptions,
    versionDiffItems,
    currentSopStatus,
    isRevisionFlow,
    primaryActionLabel,
    handleMetadataChange,
    handleSaveDraft,
    handleComplete,
    handleResolveComment,
    komentarDisplay,
  } = useDetailSOPPenyusun(id, detailMetaState?.sopStatus, undefined, navigate, role)

  const createdBy = versions.length > 0 ? versions[versions.length - 1]?.author : undefined
  const editedBy = metadata.dieditOlehNamaLengkap

  return (
    <>
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
            versions={versions}
            createdBy={createdBy}
            editedBy={editedBy}
            onSaveDraft={() => handleSaveDraft(id, role)}
            onComplete={() => handleComplete(id, role)}
            onPrint={() => window.print()}
          />
        }
        main={
          <DetailSOPPenyusunMain
            metadata={metadata}
            prosedurRows={prosedurRows}
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
            versions={versions}
            viewingVersion={viewingVersion}
            setViewingVersion={setViewingVersion}
            versionDiffItems={versionDiffItems}
            auditEntries={[]}
            komentarDisplay={komentarDisplay}
            onResolveComment={handleResolveComment}
          />
        }
      />

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-sm">Riwayat Versi</DialogTitle>
            <DialogDescription className="text-xs">{versions.length} versi terdokumentasi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {versions.map((version, _index) => (
              <div
                key={version.id}
                className="bg-gray-50 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-900">Versi {version.version}</p>
                  <p className="text-xs text-gray-500">{formatDateIdLong(version.date)}</p>
                </div>
                <p className="text-xs text-gray-700 mb-2">{version.changes}</p>
                <p className="text-xs text-gray-600">Author: {version.author}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsHistoryOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

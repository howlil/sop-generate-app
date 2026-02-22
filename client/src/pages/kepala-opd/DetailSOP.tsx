import { useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import {
  MessageSquare,
  History,
  Calendar,
  Building2,
  Users,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { DetailWorkspace } from '@/components/layout/DetailWorkspace'
import { KomentarPanel } from '@/components/sop/KomentarPanel'
import { VersionHistoryPanel } from '@/components/sop/VersionHistoryPanel'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { PageHeader } from '@/components/layout/PageHeader'
import { InfoField } from '@/components/ui/info-field'
import { showToast } from '@/lib/stores'
import { PinVerificationDialog } from '@/components/tte/PinVerificationDialog'
import { getSopStatusOverride, setSopStatusOverride } from '@/lib/stores/sop-status-store'
import type { StatusSOP } from '@/lib/types/sop'
import {
  SEED_IMPLEMENTERS,
  SEED_DETAIL_SOP_VIEW_METADATA,
  SEED_SOP_DETAIL_PROSEDUR_ROWS,
  SEED_DETAIL_SOP_KOMENTAR_INITIAL,
  SEED_DETAIL_SOP_VERSIONS,
  SEED_DETAIL_SOP_CURRENT_USER,
} from '@/lib/seed/sop-detail-seed'
import type { DetailSOPVersionSeed } from '@/lib/types/version'
import { formatDateIdLong } from '@/utils/format-date'
import { computeVersionDiff } from '@/utils/version-diff'
import { useKomentar } from '@/hooks/useKomentar'
import { useTTESignature } from '@/hooks/useTTESignature'
import { isSopEligibleForSigning } from '@/lib/domain/sop-status'
import { ROUTES } from '@/lib/constants/routes'

type Version = DetailSOPVersionSeed

export function DetailSOP() {
  const params = useParams({ strict: false })
  const id = 'id' in params ? params.id : undefined
  const navigate = useNavigate()
  const location = useLocation()
  const penugasanState = location.state as {
    sopStatus?: StatusSOP
    waktuPenugasan?: string
    unitTerkait?: string
    timPenyusun?: string
    terakhirDiperbarui?: string
    deskripsiProyek?: string
  } | undefined
  const sopStatus: StatusSOP =
    (id ? getSopStatusOverride(id) : undefined) ??
    penugasanState?.sopStatus ??
    'Draft'

  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'komentar' | 'riwayat'>('komentar')
  const [viewingVersion, setViewingVersion] = useState<Version | null>(null)
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')

  const implementers = SEED_IMPLEMENTERS
  const metadata = SEED_DETAIL_SOP_VIEW_METADATA
  const prosedurRows = SEED_SOP_DETAIL_PROSEDUR_ROWS

  const {
    displayList: komentarTampil,
    openCount: openComments,
    resolvedCount: resolvedComments,
    newComment,
    setNewComment,
    handleAddComment,
    handleResolveComment,
  } = useKomentar({
    initialData: SEED_DETAIL_SOP_KOMENTAR_INITIAL,
    currentUser: SEED_DETAIL_SOP_CURRENT_USER,
    excludeRoles: ['Tim Penyusun'],
  })

  const tte = useTTESignature({ role: 'kepala-opd', documentId: id })

  const handlePinConfirm = tte.createPinConfirmHandler(
    { documentLabel: metadata.name, referenceId: metadata.number || id || '' },
    () => {
      if (id) setSopStatusOverride(id, 'Berlaku')
      showToast('SOP berhasil disahkan dengan TTE BSRE.')
    }
  )

  const versions: Version[] = SEED_DETAIL_SOP_VERSIONS as Version[]

  const versionDiff = useMemo(
    () => computeVersionDiff(metadata, prosedurRows, viewingVersion?.snapshot),
    [viewingVersion, metadata, prosedurRows]
  )

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0 gap-3">
      <PageHeader
        breadcrumb={[
          { label: 'Daftar SOP', to: ROUTES.KEPALA_OPD.DAFTAR_SOP },
          { label: 'Detail SOP' },
        ]}
        title="Detail Dokumen SOP"
        description={metadata.name}
        leading={
          <BackButton size="icon" onClick={() => navigate({ to: ROUTES.KEPALA_OPD.DAFTAR_SOP })} />
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
              Versi {versions[0]?.version || '1.0'}
            </Badge>
            <Badge className="bg-green-100 text-green-700 text-xs border-0">{sopStatus}</Badge>
            {isSopEligibleForSigning(sopStatus) && (
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={tte.openPinDialog}
                disabled={!tte.canSign}
                title={!tte.canSign ? 'Setup TTE terlebih dahulu' : 'Mengesahkan SOP dengan TTE BSRE'}
              >
                Mengesahkan
              </Button>
            )}
          </div>
        }
      />

      <DetailWorkspace
        className="print:hidden"
        header={
          (penugasanState?.waktuPenugasan ?? penugasanState?.unitTerkait ?? penugasanState?.timPenyusun ?? penugasanState?.deskripsiProyek) ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-gray-900">Informasi penugasan</h2>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-2">
                {penugasanState.waktuPenugasan && (
                  <InfoField label="Waktu" icon={<Calendar />}>
                    {penugasanState.waktuPenugasan.includes('-')
                      ? formatDateIdLong(penugasanState.waktuPenugasan + 'T00:00:00')
                      : penugasanState.waktuPenugasan}
                  </InfoField>
                )}
                {penugasanState.unitTerkait && (
                  <InfoField label="Unit" icon={<Building2 />}>
                    {penugasanState.unitTerkait}
                  </InfoField>
                )}
                {penugasanState.timPenyusun && (
                  <InfoField label="Tim" icon={<Users />}>
                    {penugasanState.timPenyusun}
                  </InfoField>
                )}
                {penugasanState.terakhirDiperbarui && (
                  <InfoField label="Diperbarui" icon={<RefreshCw />}>
                    {penugasanState.terakhirDiperbarui}
                  </InfoField>
                )}
              </div>
              {penugasanState.deskripsiProyek && (
                <p className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 leading-relaxed max-w-full" title={penugasanState.deskripsiProyek}>
                  {penugasanState.deskripsiProyek}
                </p>
              )}
            </>
          ) : undefined
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
            widthExpanded="w-[min(320px,28%)] min-w-[220px]"
            collapseButtonLabel="Komentar"
            collapseButtonIcon={<MessageSquare className="w-4 h-4 text-gray-500" />}
            tabs={[
              {
                id: 'komentar',
                label: 'Komentar',
                icon: <MessageSquare className="w-3.5 h-3.5" />,
                badge: openComments > 0 || resolvedComments > 0 ? `(${openComments}/${resolvedComments})` : undefined,
              },
              { id: 'riwayat', label: 'Riwayat', icon: <History className="w-3.5 h-3.5" /> },
            ]}
            activeTab={rightPanelTab}
            onTabChange={(id) => setRightPanelTab(id as 'komentar' | 'riwayat')}
          >
            {rightPanelTab === 'komentar' && (
              <KomentarPanel
                comments={komentarTampil.map((k) => ({
                  id: k.id,
                  user: k.user,
                  role: k.role,
                  status: k.status,
                  bagian: k.bagian,
                  isi: k.isi,
                  timestamp: k.timestamp,
                }))}
                onResolve={handleResolveComment}
                addForm={{
                  value: newComment,
                  onChange: setNewComment,
                  onSubmit: handleAddComment,
                  submitLabel: 'Kirim Komentar',
                }}
                avatarVariant="orange"
                showFilters={false}
              />
            )}
            {rightPanelTab === 'riwayat' && (
              <VersionHistoryPanel
                variant="cards"
                versions={versions.map((v: Version) => ({
                  id: v.id,
                  version: v.version,
                  date: v.date,
                  author: v.author,
                  changes: v.changes,
                  eventLabel: v.eventLabel,
                  revisionType: v.revisionType,
                  snapshot: v.snapshot,
                }))}
                viewingVersion={viewingVersion}
                setViewingVersion={(v) => setViewingVersion(v as Version | null)}
                versionDiff={versionDiff}
              />
            )}
          </CollapsibleSidePanel>
        }
      />

      <PinVerificationDialog
        open={tte.pinDialogOpen}
        onOpenChange={tte.setPinDialogOpen}
        title="Verifikasi PIN TTE"
        description="Masukkan PIN TTE BSRE untuk mengesahkan SOP ini."
        onConfirm={handlePinConfirm}
        confirmLabel="Mengesahkan"
      />
    </div>
  )
}

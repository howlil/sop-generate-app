import { useState, useMemo } from 'react'
import { useParams, useLocation } from '@tanstack/react-router'
import {
  History,
  Calendar,
  Building2,
  Users,
  RefreshCw,
  Printer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { VersionHistoryPanel } from '@/components/sop/VersionHistoryPanel'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { InfoField } from '@/components/ui/info-field'
import { showToast } from '@/lib/stores/app-store'
import { PinVerificationDialog } from '@/components/tte/PinVerificationDialog'
import { getSopStatusOverride, setSopStatusOverride } from '@/lib/stores/sop-status-store'
import type { StatusSOP } from '@/lib/types/sop'
import {
  getInitialSopDetailImplementers,
  getInitialSopDetailProsedurRows,
  getSopViewMetadata,
  getSopViewVersions,
} from '@/lib/data/sop-detail'
import type { DetailSOPVersionSeed } from '@/lib/types/version'
import { formatDateIdLong } from '@/utils/format-date'
import * as versionDiff from '@/utils/version-diff'
import { useTTESignature } from '@/hooks/useTTESignature'
import { isSopEligibleForSigning } from '@/lib/domain/sop-status'
import { ROUTES } from '@/lib/constants/routes'

type Version = DetailSOPVersionSeed

export function DetailSOP() {
  const params = useParams({ strict: false })
  const id = 'id' in params ? params.id : undefined
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
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [viewingVersion, setViewingVersion] = useState<Version | null>(null)

  const implementers = getInitialSopDetailImplementers()
  const metadata = getSopViewMetadata()
  const prosedurRows = getInitialSopDetailProsedurRows()

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

  /** Kepala OPD hanya menandatangani SOP (TTE). Tanpa tugas Setuju/Tolak atau pemeriksaan. */
  const versions: Version[] = getSopViewVersions() as Version[]

  return (
    <>
    <DetailPageLayout
      breadcrumb={[
        { label: 'Daftar SOP', to: ROUTES.TIM_PENYUSUN.DAFTAR_SOP },
        { label: 'Detail SOP' },
      ]}
      title="Detail Dokumen SOP"
      description={metadata.name}
      backTo={ROUTES.TIM_PENYUSUN.DAFTAR_SOP}
      backSize="icon"
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5" /> Print SOP
          </Button>
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
      header={
          (penugasanState?.waktuPenugasan ?? penugasanState?.unitTerkait ?? penugasanState?.timPenyusun ?? penugasanState?.deskripsiProyek) ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-gray-900">Informasi proyek</h2>
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
  </>
  )
}

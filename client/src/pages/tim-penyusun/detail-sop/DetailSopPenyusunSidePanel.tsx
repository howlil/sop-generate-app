import { PenLine, MessageSquare, History, Activity } from 'lucide-react'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { KomentarPanel, VersionHistoryPanel, RiwayatStatusPanel } from '@/features/sop'
import { DetailSOPMetadataPanel } from './DetailSOPMetadataPanel'
import type { SOPDetailMetadata, VersionHistoryItem } from '@/features/sop'
import type { Peraturan } from '@/features/organisasi'

export interface DetailSOPPenyusunSidePanelProps {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  rightPanelTab: 'edit' | 'komentar' | 'riwayat' | 'aktivitas'
  onTabChange: (tab: 'edit' | 'komentar' | 'riwayat' | 'aktivitas') => void
  metadata: SOPDetailMetadata
  onMetadataChange: <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => void
  implementers: { id: string; name: string }[]
  onImplementersChange: (implementers: { id: string; name: string }[]) => void
  masterPelaksanaOptions: { id: string; name: string }[]
  peraturanList: Peraturan[]
  versions: VersionHistoryItem[]
  viewingVersion: VersionHistoryItem | null
  setViewingVersion: (version: VersionHistoryItem | null) => void
  versionDiffItems: any[]
  auditEntries: any[]
  komentarDisplay: any[]
  onResolveComment: (komentarId: string) => void
}

export function DetailSOPPenyusunSidePanel({
  collapsed,
  onCollapsedChange,
  rightPanelTab,
  onTabChange,
  metadata,
  onMetadataChange,
  implementers,
  onImplementersChange,
  masterPelaksanaOptions,
  peraturanList,
  versions,
  viewingVersion,
  setViewingVersion,
  versionDiffItems,
  auditEntries = [],
  komentarDisplay,
  onResolveComment,
}: DetailSOPPenyusunSidePanelProps) {
  return (
    <CollapsibleSidePanel
      side="right"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      widthCollapsed="w-10"
      widthExpanded="w-full"
      tabs={[
        { id: 'edit', label: 'Edit', icon: <PenLine className="w-3.5 h-3.5" /> },
        { id: 'komentar', label: 'Komentar', icon: <MessageSquare className="w-3.5 h-3.5" /> },
        { id: 'riwayat', label: 'Versi', icon: <History className="w-3.5 h-3.5" /> },
        { id: 'aktivitas', label: 'Aktivitas', icon: <Activity className="w-3.5 h-3.5" /> },
      ]}
      activeTab={rightPanelTab}
      onTabChange={onTabChange}
    >
      {rightPanelTab === 'komentar' && (
        <KomentarPanel
          comments={komentarDisplay}
          onResolve={onResolveComment}
          avatarVariant="blue"
        />
      )}
      {rightPanelTab === 'edit' && (
        <DetailSOPMetadataPanel
          metadata={metadata}
          onMetadataChange={onMetadataChange}
          implementers={implementers}
          onImplementersChange={onImplementersChange}
          implementersFromMaster
          masterPelaksanaOptions={masterPelaksanaOptions}
          peraturanList={peraturanList}
        />
      )}
      {rightPanelTab === 'riwayat' && (
        <VersionHistoryPanel
          variant="cards"
          versions={versions}
          summary={`${versions.length} versi terdokumentasi`}
          viewingVersion={viewingVersion}
          setViewingVersion={setViewingVersion}
          versionDiff={versionDiffItems}
        />
      )}
      {rightPanelTab === 'aktivitas' && (
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-3">
            Riwayat perubahan status SOP — siapa mengubah, dari status apa ke apa, kapan.
          </p>
          <RiwayatStatusPanel entries={auditEntries} />
        </div>
      )}
    </CollapsibleSidePanel>
  )
}

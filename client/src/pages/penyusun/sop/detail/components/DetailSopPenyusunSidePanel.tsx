import { PenLine, MessageSquare, Activity } from 'lucide-react'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { KomentarPanel } from '@/pages/penyusun/sop/components/KomentarPanel'
import { RiwayatStatusPanel } from '@/pages/penyusun/sop/components/RiwayatStatusPanel'
import { DetailSOPMetadataPanel } from './DetailSopMetadataPanel'
import type { PenyusunWorkbenchLogEdit } from '@/types/dto/sop.dto'

export interface DetailSOPPenyusunSidePanelProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  rightPanelTab: "edit" | "komentar" | "aktivitas";
  onTabChange: (tab: "edit" | "komentar" | "aktivitas") => void;
  auditEntries: PenyusunWorkbenchLogEdit[];
  /** Label tab pertama (Edit vs Informasi saat mode lihat). */
  editTabLabel?: string;
}

export function DetailSOPPenyusunSidePanel({
  collapsed,
  onCollapsedChange,
  rightPanelTab,
  onTabChange,
  auditEntries = [],
  editTabLabel = 'Edit',
}: DetailSOPPenyusunSidePanelProps) {
  return (
    <CollapsibleSidePanel
      side="right"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      widthCollapsed="w-10"
      widthExpanded="w-full"
      tabs={[
        { id: 'edit', label: editTabLabel, icon: <PenLine className="w-3.5 h-3.5" /> },
        { id: 'komentar', label: 'Umpan balik', icon: <MessageSquare className="w-3.5 h-3.5" /> },
        { id: 'aktivitas', label: 'Aktivitas', icon: <Activity className="w-3.5 h-3.5" /> },
      ]}
      activeTab={rightPanelTab}
      onTabChange={onTabChange as (tabId: string) => void}
    >
      {rightPanelTab === 'edit' && <DetailSOPMetadataPanel />}
      {rightPanelTab === 'komentar' && (
        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 min-h-0 overflow-auto">
            <KomentarPanel />
          </div>
        </div>
      )}
      {rightPanelTab === 'aktivitas' && (
        <div className="p-3">
          <RiwayatStatusPanel entries={auditEntries} />
        </div>
      )}
    </CollapsibleSidePanel>
  )
}

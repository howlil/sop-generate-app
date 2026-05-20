import { PenLine, MessageSquare, Activity, History } from 'lucide-react'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { UmpanBalikEvaluasiPanel } from '@/pages/penyusun/sop/components/UmpanBalikEvaluasiPanel'
import type { UmpanBalikEvaluasiDetail } from '@/types/dto/evaluasi.dto'
import { RiwayatStatusPanel } from '@/pages/penyusun/sop/components/RiwayatStatusPanel'
import { RiwayatVersiPanel } from '@/pages/penyusun/sop/components/RiwayatVersiPanel'
import { DetailSOPMetadataPanel } from './DetailSopMetadataPanel'
import type { PenyusunWorkbenchLogEdit } from '@/types/dto/sop.dto'

export interface DetailSOPPenyusunSidePanelProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  rightPanelTab: "edit" | "komentar" | "versi" | "aktivitas";
  onTabChange: (tab: "edit" | "komentar" | "versi" | "aktivitas") => void;
  auditEntries: PenyusunWorkbenchLogEdit[];
  /** Label tab pertama (Edit vs Informasi saat mode lihat). */
  editTabLabel?: string;
  umpanBalik?: UmpanBalikEvaluasiDetail | null;
  isUmpanBalikLoading?: boolean;
  isReadOnly?: boolean;
  detailSopId: string;
  sopId?: string;
}

export function DetailSOPPenyusunSidePanel({
  collapsed,
  onCollapsedChange,
  rightPanelTab,
  onTabChange,
  auditEntries = [],
  editTabLabel = 'Edit',
  umpanBalik = null,
  isUmpanBalikLoading = false,
  isReadOnly = false,
  detailSopId,
  sopId,
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
        { id: 'komentar', label: 'Komentar evaluasi', icon: <MessageSquare className="w-3.5 h-3.5" /> },
        { id: 'versi', label: 'Versi', icon: <History className="w-3.5 h-3.5" /> },
        { id: 'aktivitas', label: 'Aktivitas', icon: <Activity className="w-3.5 h-3.5" /> },
      ]}
      activeTab={rightPanelTab}
      onTabChange={onTabChange as (tabId: string) => void}
    >
      {rightPanelTab === 'edit' && <DetailSOPMetadataPanel />}
      {rightPanelTab === 'komentar' && (
        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 min-h-0 overflow-auto">
            <UmpanBalikEvaluasiPanel
              detailSopId={detailSopId}
              umpanBalik={umpanBalik}
              isLoading={isUmpanBalikLoading}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>
      )}
      {rightPanelTab === 'versi' && sopId ? (
        <RiwayatVersiPanel
          sopId={sopId}
          activeDetailSopId={detailSopId}
          isReadOnly={isReadOnly}
        />
      ) : null}
      {rightPanelTab === 'aktivitas' && (
        <div className="p-3">
          <RiwayatStatusPanel entries={auditEntries} />
        </div>
      )}
    </CollapsibleSidePanel>
  )
}

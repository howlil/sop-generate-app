import { PenLine, MessageSquare, Activity, History } from 'lucide-react'
import {
  CollapsedStripButton,
  CollapsibleSidePanel,
  CollapsibleSidePanelContent,
  CollapsibleSidePanelHeader,
  PanelTabStrip,
} from '@/components/ui/collapsible-side-panel'
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
  const tabs = [
    { id: 'edit', label: editTabLabel, icon: <PenLine className="w-3.5 h-3.5" /> },
    { id: 'komentar', label: 'Komentar evaluasi', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'versi', label: 'Versi', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'aktivitas', label: 'Aktivitas', icon: <Activity className="w-3.5 h-3.5" /> },
  ]

  return (
    <CollapsibleSidePanel
      side="right"
      collapsed={collapsed}
      widthCollapsed="w-10"
      widthExpanded="w-full"
    >
      {collapsed ? (
        <CollapsedStripButton
          label={tabs[0].label}
          icon={tabs[0].icon}
          onClick={() => onCollapsedChange(false)}
        />
      ) : (
        <>
          <CollapsibleSidePanelHeader side="right" onCollapse={() => onCollapsedChange(true)}>
            <PanelTabStrip
              tabs={tabs}
              activeTab={rightPanelTab}
              onTabChange={(tab) => onTabChange(tab as DetailSOPPenyusunSidePanelProps['rightPanelTab'])}
            />
          </CollapsibleSidePanelHeader>
          <CollapsibleSidePanelContent className="px-2 pb-2 pt-1 sm:px-2">
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
          </CollapsibleSidePanelContent>
        </>
      )}
    </CollapsibleSidePanel>
  )
}

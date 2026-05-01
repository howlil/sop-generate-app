import type React from 'react'
import { PenLine, MessageSquare, Activity } from 'lucide-react'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import { KomentarPanel } from "@/components/sop/KomentarPanel";
import { RiwayatStatusPanel } from "@/components/sop/RiwayatStatusPanel";
import { DetailSOPMetadataPanel } from './DetailSopMetadataPanel'
import type { SOPDetailMetadata } from "@/types/ui/sop";
import type { Peraturan } from "@/types/dto/peraturan.dto";
import type { KomentarDisplayItem } from "@/api/sop";
import type { LogEditSOP } from "@/types/dto/audit.dto";

export interface DetailSOPPenyusunSidePanelProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  rightPanelTab: "edit" | "komentar" | "aktivitas";
  onTabChange: (tab: "edit" | "komentar" | "aktivitas") => void;
  metadata: SOPDetailMetadata;
  onMetadataChange: <K extends keyof SOPDetailMetadata>(
    field: K,
    value: SOPDetailMetadata[K],
  ) => void;
  implementers: { id: string; name: string }[];
  onImplementersChange: (implementers: { id: string; name: string }[]) => void;
  masterPelaksanaOptions: { id: string; name: string }[];
  peraturanList: Peraturan[];
  auditEntries: LogEditSOP[];
  komentarDisplay: KomentarDisplayItem[];
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
  auditEntries = [],
  komentarDisplay,
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
        { id: 'aktivitas', label: 'Aktivitas', icon: <Activity className="w-3.5 h-3.5" /> },
      ]}
      activeTab={rightPanelTab}
      onTabChange={onTabChange as (tabId: string) => void}
    >
      {rightPanelTab === 'komentar' && (
        <KomentarPanel
          comments={komentarDisplay}
          avatarVariant="blue"
        />
      )}
      {rightPanelTab === 'edit' && (
        <DetailSOPMetadataPanel
          metadata={metadata}
          onMetadataChange={onMetadataChange}
          implementers={implementers}
          onImplementersChange={onImplementersChange as React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>}
          implementersFromMaster
          masterPelaksanaOptions={masterPelaksanaOptions}
          peraturanList={peraturanList}
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

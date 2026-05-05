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
          <p className="text-xs text-gray-500 px-3 pt-3 pb-2 border-b border-gray-100 flex-shrink-0 leading-snug">
            Riwayat umpan balik Tim Evaluasi. Catatan formal saat dokumen dikembalikan untuk revisi muncul di sini secara otomatis; Anda dapat menandai entri sebagai selesai setelah ditindaklanjuti.
          </p>
          <div className="flex-1 min-h-0 overflow-auto">
            <KomentarPanel />
          </div>
        </div>
      )}
      {rightPanelTab === 'aktivitas' && (
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-3">
            Riwayat aktivitas SOP — siapa mengubah bagian apa, kapan. Edit beruntun dalam 10 menit
            digabung jadi satu baris (gaya Google Docs).
          </p>
          <RiwayatStatusPanel entries={auditEntries} />
        </div>
      )}
    </CollapsibleSidePanel>
  )
}

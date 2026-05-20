import { useState } from 'react'
import { Building2, FileText } from 'lucide-react'
import { CollapsibleSidePanel } from '@/components/ui/collapsible-side-panel'
import type { PublicOpdItem, PublicSopItem } from '@/types/dto/sop-public.dto'
import type { PaginationMetaDto } from '@/types/dto/evaluasi.dto'
import { ArsipOpdSidebar } from './ArsipOpdSidebar'
import { ArsipSopPanel } from './ArsipSopPanel'
import { ArsipSopPreviewPane } from './ArsipSopPreviewPane'

export interface ArsipBrowseWorkspaceProps {
  isGlobalMode: boolean
  opdId?: string
  detailSopId?: string
  opdItems: PublicOpdItem[]
  opdFilter: string
  onOpdFilterChange: (value: string) => void
  onSelectOpd: (opdId: string) => void
  opdLoading: boolean
  opdError: boolean
  opdFetching: boolean
  sopPanelTitle: string
  sopPanelSubtitle?: string
  sopItems: PublicSopItem[]
  sopPagination?: PaginationMetaDto
  sopPage: number
  onSopPageChange: (page: number) => void
  sopLoading: boolean
  sopError: boolean
  sopFetching: boolean
  showOpdColumn: boolean
  onSelectSop: (sop: PublicSopItem) => void
  onClosePreview: () => void
  sopEmptyTitle: string
  sopEmptyHint: string
}

export function ArsipBrowseWorkspace({
  isGlobalMode,
  opdId,
  detailSopId,
  opdItems,
  opdFilter,
  onOpdFilterChange,
  onSelectOpd,
  opdLoading,
  opdError,
  opdFetching,
  sopPanelTitle,
  sopPanelSubtitle,
  sopItems,
  sopPagination,
  sopPage,
  onSopPageChange,
  sopLoading,
  sopError,
  sopFetching,
  showOpdColumn,
  onSelectSop,
  onClosePreview,
  sopEmptyTitle,
  sopEmptyHint,
}: ArsipBrowseWorkspaceProps) {
  const [opdCollapsed, setOpdCollapsed] = useState(false)
  const [sopListCollapsed, setSopListCollapsed] = useState(false)
  const showSopList = isGlobalMode || Boolean(opdId)

  return (
    <div
      className="hidden min-h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:flex"
      aria-label="Workspace arsip SOP"
    >
      {!isGlobalMode ? (
        <CollapsibleSidePanel
          side="left"
          collapsed={opdCollapsed}
          onCollapsedChange={setOpdCollapsed}
          widthCollapsed="w-12"
          widthExpanded="w-[260px]"
          collapseButtonLabel="OPD"
          collapseButtonIcon={<Building2 className="h-4 w-4 text-slate-500" />}
          className="h-full max-h-none shrink-0"
        >
          <ArsipOpdSidebar
            embedded
            items={opdItems}
            selectedOpdId={opdId}
            opdFilter={opdFilter}
            onOpdFilterChange={onOpdFilterChange}
            onSelectOpd={onSelectOpd}
            isLoading={opdLoading}
            isError={opdError}
            isFetching={opdFetching}
          />
        </CollapsibleSidePanel>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-slate-200 bg-white">
        {detailSopId ? (
          <ArsipSopPreviewPane
            detailSopId={detailSopId}
            onClose={onClosePreview}
            variant="inline"
            embedded
          />
        ) : (
          <PreviewEmptyState showSopList={showSopList} />
        )}
      </div>
      <CollapsibleSidePanel
        side="right"
        collapsed={sopListCollapsed}
        onCollapsedChange={setSopListCollapsed}
        widthCollapsed="w-12"
        widthExpanded="w-[min(360px,32vw)]"
        title="Daftar SOP"
        subtitle={sopPanelSubtitle}
        collapseButtonLabel="SOP"
        collapseButtonIcon={<FileText className="h-4 w-4 text-slate-500" />}
        className="h-full max-h-none shrink-0"
      >
        {showSopList ? (
          <ArsipSopPanel
            embedded
            hideHeader
            title={sopPanelTitle}
            subtitle={sopPanelSubtitle}
            items={sopItems}
            pagination={sopPagination}
            page={sopPage}
            onPageChange={onSopPageChange}
            isLoading={sopLoading}
            isError={sopError}
            isFetching={sopFetching}
            showOpdColumn={showOpdColumn}
            selectedDetailSopId={detailSopId}
            onSelectSop={onSelectSop}
            emptyTitle={sopEmptyTitle}
            emptyHint={sopEmptyHint}
          />
        ) : (
          <SopListPickOpdHint />
        )}
      </CollapsibleSidePanel>
    </div>
  )
}

function PreviewEmptyState({ showSopList }: { showSopList: boolean }) {
  return (
    <section className="flex h-full flex-col items-center justify-center p-8 text-center">
      <p className="text-base font-medium text-slate-800">Pratinjau dokumen</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {showSopList
          ? 'Pilih salah satu SOP di daftar kanan untuk membaca dokumen lengkap di sini.'
          : 'Pilih OPD di panel kiri, lalu pilih SOP di daftar kanan.'}
      </p>
    </section>
  )
}

function SopListPickOpdHint() {
  return (
    <p className="p-4 text-center text-sm text-slate-500">
      Pilih OPD di panel kiri untuk menampilkan daftar SOP.
    </p>
  )
}

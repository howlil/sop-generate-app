import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { usePublicOpdList, usePublicSopGlobalList, usePublicSopList } from '@/api/sop-public'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn } from '@/utils/cn'
import type { PublicSopItem } from '@/types/dto/sop-public.dto'
import { ArsipBrowseWorkspace } from './ArsipBrowseWorkspace'
import { ArsipHeroSearch } from './ArsipHeroSearch'
import { ArsipOpdSidebar } from './ArsipOpdSidebar'
import { ArsipSopPanel } from './ArsipSopPanel'
import { ArsipSopPreviewPane } from './ArsipSopPreviewPane'
import { ArsipSopShell } from './ArsipSopShell'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ArsipBrowseSearch } from './arsip-search-schema'

const arsipRoute = getRouteApi('/arsip/')
const OPD_PAGE_SIZE = 50
const SOP_PAGE_SIZE = 15

export function ArsipBrowsePage() {
  const search = arsipRoute.useSearch()
  const navigate = arsipRoute.useNavigate()
  const opdId = search.opdId
  const detailSopId = search.detailSopId
  const q = search.q?.trim() ?? ''
  const opdPage = search.opdPage ?? 1
  const sopPage = search.sopPage ?? 1
  const isGlobalMode = q.length > 0
  const showMobileOpd = !isGlobalMode && !opdId && !detailSopId
  const showMobileSopList = (isGlobalMode || Boolean(opdId)) && !detailSopId
  const showMobilePreview = Boolean(detailSopId)

  const [globalInput, setGlobalInput] = useState(q)
  const [opdFilter, setOpdFilter] = useState('')
  const debouncedGlobal = useDebouncedValue(globalInput, 350)
  const debouncedOpdFilter = useDebouncedValue(opdFilter, 350)

  useEffect(() => {
    setGlobalInput(q)
  }, [q])

  useEffect(() => {
    const next = debouncedGlobal.trim()
    if (next === q) {
      return
    }
    void navigate({
      search: (prev: ArsipBrowseSearch) => ({
        ...prev,
        q: next || undefined,
        opdId: next ? undefined : prev.opdId,
        detailSopId: undefined,
        sopPage: 1,
      }),
    })
  }, [debouncedGlobal, q, navigate])

  const opdQuery = usePublicOpdList({
    page: opdPage,
    limit: OPD_PAGE_SIZE,
    search: debouncedOpdFilter || undefined,
  })

  const sopByOpdQuery = usePublicSopList(opdId ?? '', {
    page: sopPage,
    limit: SOP_PAGE_SIZE,
  })

  const globalSopQuery = usePublicSopGlobalList({
    page: sopPage,
    limit: SOP_PAGE_SIZE,
    search: q,
  })

  useDocumentTitle('Arsip SOP — Telusuri Dokumen')

  const opdItems = opdQuery.data?.items ?? []
  const selectedOpdName =
    sopByOpdQuery.data?.opd.nama ?? opdItems.find((o) => o.opdId === opdId)?.nama

  const sopItems = isGlobalMode
    ? (globalSopQuery.data?.items ?? [])
    : (sopByOpdQuery.data?.items ?? [])

  const sopPagination = isGlobalMode
    ? globalSopQuery.data?.pagination
    : sopByOpdQuery.data?.pagination

  const sopLoading = isGlobalMode
    ? globalSopQuery.isLoading
    : Boolean(opdId) && sopByOpdQuery.isLoading

  const sopError = isGlobalMode
    ? globalSopQuery.isError
    : Boolean(opdId) && sopByOpdQuery.isError

  const sopFetching = isGlobalMode
    ? globalSopQuery.isFetching
    : Boolean(opdId) && sopByOpdQuery.isFetching

  const sopListReady = isGlobalMode
    ? globalSopQuery.isSuccess
    : Boolean(opdId) && sopByOpdQuery.isSuccess

  useEffect(() => {
    if (detailSopId || isGlobalMode || !opdId || !sopListReady || sopItems.length === 0) {
      return
    }
    const first = sopItems[0]
    if (!first) {
      return
    }
    void navigate({
      search: (prev: ArsipBrowseSearch) => ({
        ...prev,
        detailSopId: first.detailSopId,
      }),
      replace: true,
    })
  }, [detailSopId, isGlobalMode, opdId, sopListReady, sopItems, navigate])

  function handleSelectOpd(id: string) {
    setGlobalInput('')
    void navigate({
      search: (prev: ArsipBrowseSearch) => ({
        ...prev,
        opdId: id,
        q: undefined,
        detailSopId: undefined,
        sopPage: 1,
      }),
    })
  }

  function handleSelectSop(sop: PublicSopItem) {
    void navigate({
      search: (prev: ArsipBrowseSearch) => ({
        ...prev,
        opdId: sop.opdId,
        detailSopId: sop.detailSopId,
      }),
    })
  }

  function handleClosePreview() {
    void navigate({
      search: (prev: ArsipBrowseSearch) => {
        const next = { ...prev }
        delete next.detailSopId
        return next
      },
    })
  }

  function handleMobileBackToOpd() {
    setGlobalInput('')
    void navigate({
      search: { opdPage },
    })
  }

  function handleSopPageChange(page: number) {
    void navigate({
      search: (prev: ArsipBrowseSearch) => ({ ...prev, sopPage: page }),
    })
  }

  const panelTitle = isGlobalMode
    ? 'Hasil pencarian'
    : opdId
      ? (selectedOpdName ?? 'Daftar SOP')
      : 'Daftar SOP'

  const panelSubtitle = isGlobalMode
    ? `Kata kunci: “${q}”`
    : opdId
      ? 'Dokumen berstatus Berlaku'
      : undefined

  const workspaceProps = {
    isGlobalMode,
    opdId,
    detailSopId,
    opdItems,
    opdFilter,
    onOpdFilterChange: (v: string) => {
      setOpdFilter(v)
      void navigate({ search: (prev: ArsipBrowseSearch) => ({ ...prev, opdPage: 1 }) })
    },
    onSelectOpd: handleSelectOpd,
    opdLoading: opdQuery.isLoading,
    opdError: opdQuery.isError,
    opdFetching: opdQuery.isFetching,
    sopPanelTitle: panelTitle,
    sopPanelSubtitle: panelSubtitle,
    sopItems,
    sopPagination,
    sopPage,
    onSopPageChange: handleSopPageChange,
    sopLoading,
    sopError,
    sopFetching,
    showOpdColumn: isGlobalMode,
    onSelectSop: handleSelectSop,
    onClosePreview: handleClosePreview,
    sopEmptyTitle: isGlobalMode ? 'Tidak ada SOP ditemukan' : 'Tidak ada SOP berlaku',
    sopEmptyHint: isGlobalMode
      ? 'Coba kata kunci lain atau pilih OPD di daftar.'
      : 'Belum ada dokumen berlaku pada OPD ini.',
  }

  return (
    <ArsipSopShell>
      <section className="mb-5 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Arsip SOP yang telah disahkan
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Pilih OPD di kiri, dokumen di kanan, baca pratinjau di tengah — panel bisa disembunyikan
          untuk ruang baca lebih luas.
        </p>
      </section>
      <div className="mb-5">
        <ArsipHeroSearch value={globalInput} onChange={setGlobalInput} />
      </div>
      <ArsipBrowseWorkspace {...workspaceProps} />
      <div className={cn('mt-4 space-y-4 lg:hidden', showMobilePreview && 'hidden')}>
        {showMobileOpd ? (
          <ArsipOpdSidebar
            items={opdItems}
            selectedOpdId={opdId}
            opdFilter={opdFilter}
            onOpdFilterChange={workspaceProps.onOpdFilterChange}
            onSelectOpd={handleSelectOpd}
            isLoading={opdQuery.isLoading}
            isError={opdQuery.isError}
            isFetching={opdQuery.isFetching}
          />
        ) : null}
        {showMobileSopList ? (
          <>
            {!isGlobalMode ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 px-0 text-blue-700 hover:bg-transparent hover:underline"
                onClick={handleMobileBackToOpd}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Kembali ke daftar OPD
              </Button>
            ) : null}
            <ArsipSopPanel
              title={panelTitle}
              subtitle={panelSubtitle}
              items={sopItems}
              pagination={sopPagination}
              page={sopPage}
              onPageChange={handleSopPageChange}
              isLoading={sopLoading}
              isError={sopError}
              isFetching={sopFetching}
              showOpdColumn={isGlobalMode}
              selectedDetailSopId={detailSopId}
              onSelectSop={handleSelectSop}
              emptyTitle={workspaceProps.sopEmptyTitle}
              emptyHint={workspaceProps.sopEmptyHint}
            />
          </>
        ) : null}
      </div>
      {showMobilePreview && detailSopId ? (
        <div className="lg:hidden">
          <ArsipSopPreviewPane
            detailSopId={detailSopId}
            onClose={handleClosePreview}
            variant="overlay"
          />
        </div>
      ) : null}
    </ArsipSopShell>
  )
}

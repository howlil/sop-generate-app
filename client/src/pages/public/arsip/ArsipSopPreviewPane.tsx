import { useMemo, useState } from 'react'
import { Loader2, Printer, X } from 'lucide-react'
import { usePublicSopDokumen } from '@/api/sop-public'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SopStatusBadge } from '@/components/status/sop-status-badge'
import { mapPenyusunWorkbenchToPreviewProps } from '@/lib/sop/detailSop.mappers'
import type { PenyusunWorkbenchData } from '@/types/dto/sop.dto'
import { cn } from '@/utils/cn'
import { SOPPreviewTemplate } from '@/pages/penyusun/sop/components/SOPPreviewTemplate'

export interface ArsipSopPreviewPaneProps {
  detailSopId: string
  onClose: () => void
  variant: 'inline' | 'overlay'
  embedded?: boolean
}

export function ArsipSopPreviewPane({
  detailSopId,
  onClose,
  variant,
  embedded = false,
}: ArsipSopPreviewPaneProps) {
  const { data, isLoading, isError } = usePublicSopDokumen(detailSopId)
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const judul = data?.detail.sop?.judul ?? 'Dokumen SOP'

  const previewProps = useMemo(() => {
    if (!data) {
      return null
    }
    const workbench: PenyusunWorkbenchData = {
      detail: data.detail,
      langkah: data.langkah,
      logEdit: [],
    }
    return mapPenyusunWorkbenchToPreviewProps(workbench)
  }, [data])

  const shellClass = cn(
    'flex flex-col bg-white',
    variant === 'overlay' && 'fixed inset-0 z-40 pt-[env(safe-area-inset-top)]',
    variant === 'inline' && embedded && 'h-full min-h-0',
    variant === 'inline' && !embedded && 'h-full min-h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] rounded-xl border border-slate-200 shadow-sm',
  )

  return (
    <section className={shellClass} aria-label="Pratinjau dokumen SOP">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 lg:px-5">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pratinjau dokumen</p>
          <h2 className="mt-0.5 line-clamp-2 text-base font-semibold text-slate-900 sm:text-lg">{judul}</h2>
          {data?.opd.nama ? <p className="mt-1 text-sm text-slate-600">{data.opd.nama}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {data ? <SopStatusBadge status="BERLAKU" label="Berlaku" showDomain={false} /> : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => window.print()}
            disabled={!previewProps}
          >
            <Printer className="h-4 w-4" aria-hidden />
            Cetak
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onClose}
            aria-label="Tutup pratinjau"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-5 print:overflow-visible">
        {isLoading ? (
          <Card className="flex min-h-[240px] items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-label="Memuat dokumen" />
          </Card>
        ) : null}
        {isError ? (
          <Card className="border-red-200 bg-red-50 p-8 text-center text-sm text-red-800">
            Dokumen tidak ditemukan atau belum berstatus Berlaku.
          </Card>
        ) : null}
        {previewProps ? (
          <Card className="overflow-hidden border-slate-200 p-3 sm:p-4 print:border-0 print:shadow-none">
            <SOPPreviewTemplate
              {...previewProps}
              previewOptions={{ editable: false, showScrollbar: true }}
              diagramState={{
                activeTab,
                onActiveTabChange: setActiveTab,
              }}
            />
          </Card>
        ) : null}
      </div>
    </section>
  )
}

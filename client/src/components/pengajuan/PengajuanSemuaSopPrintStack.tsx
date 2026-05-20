import { useEffect, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { evaluasiApi } from '@/api/evaluasi'
import { queryKeys } from '@/config/query-keys'
import { STALE_TIME } from '@/utils/constants'
import { mapPenyusunWorkbenchToPreviewProps } from '@/lib/sop/detailSop.mappers'
import { parseTTESignaturePayload } from '@/lib/tte/parse-tte-signature-payload'
import { SOPPreviewTemplate, type SOPPreviewTemplateProps } from '@/pages/penyusun/sop/components/SOPPreviewTemplate'

const WORKBENCH_LOGS_LIMIT = 100

export interface PengajuanSemuaSopPrintItem {
  sopDetailId: string
  nama: string
  nomor: string
}

interface PengajuanSemuaSopPrintStackProps {
  pengajuanId: string
  sopItems: PengajuanSemuaSopPrintItem[]
  /** Prefetch workbench saat pengajuan siap dicetak. */
  prefetchEnabled: boolean
  onAllLoadedChange?: (loaded: boolean) => void
}

export function PengajuanSemuaSopPrintStack({
  pengajuanId,
  sopItems,
  prefetchEnabled,
  onAllLoadedChange,
}: PengajuanSemuaSopPrintStackProps) {
  const queries = useQueries({
    queries: sopItems.map((item) => ({
      queryKey: queryKeys.evaluasiPengajuanSopDokumen(
        pengajuanId,
        item.sopDetailId,
        WORKBENCH_LOGS_LIMIT,
      ),
      queryFn: () =>
        evaluasiApi.findPengajuanSopDokumen(
          pengajuanId,
          item.sopDetailId,
          WORKBENCH_LOGS_LIMIT,
          { arsip: true },
        ),
      enabled: prefetchEnabled && sopItems.length > 0,
      staleTime: STALE_TIME.MEDIUM,
    })),
  })

  const allLoaded = useMemo(() => {
    if (sopItems.length === 0) return false
    return queries.every((q) => q.isSuccess && q.data !== undefined)
  }, [queries, sopItems.length])

  useEffect(() => {
    onAllLoadedChange?.(allLoaded)
  }, [allLoaded, onAllLoadedChange])

  if (!prefetchEnabled || sopItems.length === 0) {
    return null
  }

  return (
    <div data-print-area="sop-all" className="hidden" aria-hidden>
      {sopItems.map((item, index) => {
        const q = queries[index]
        const data = q?.data
        const previewProps =
          data?.workbench !== undefined
            ? mapPenyusunWorkbenchToPreviewProps(data.workbench)
            : null
        const ttePayload = parseTTESignaturePayload(data?.tteSignaturePayloadKepalaOpd)

        return (
          <div
            key={item.sopDetailId}
            className={index < sopItems.length - 1 ? 'print-break-after-page' : ''}
          >
            {previewProps !== null ? (
              <SOPPreviewTemplate
                name={previewProps.name}
                number={previewProps.number}
                metadata={previewProps.metadata as SOPPreviewTemplateProps['metadata']}
                prosedurRows={previewProps.prosedurRows}
                implementers={previewProps.implementers}
                tteSignaturePayload={ttePayload ?? null}
                previewOptions={{ editable: false, showScrollbar: false }}
              />
            ) : (
              <SOPPreviewTemplate
                name={item.nama}
                number={item.nomor}
                previewOptions={{ editable: false, showScrollbar: false }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

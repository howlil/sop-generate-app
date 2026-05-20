import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { evaluasiApi } from '@/api/evaluasi'
import { queryKeys } from '@/config/query-keys'
import { useToast } from '@/hooks/useToast'
import { schedulePengajuanPrint, type PengajuanPrintTarget } from '@/lib/print/pengajuan-print'

const WORKBENCH_LOGS_LIMIT = 100

interface UsePengajuanCetakArsipParams {
  pengajuanId: string
  effectiveSopDetailId: string | null
  semuaSopReady: boolean
}

function waitForPrintPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

async function schedulePengajuanPrintAfterPaint(target: PengajuanPrintTarget): Promise<void> {
  await waitForPrintPaint()
  schedulePengajuanPrint(target)
}

export function usePengajuanCetakArsip({
  pengajuanId,
  effectiveSopDetailId,
  semuaSopReady,
}: UsePengajuanCetakArsipParams) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [cetakLoading, setCetakLoading] = useState(false)
  const [pendingSopAll, setPendingSopAll] = useState(false)

  const prefetchBeritaAcaraArsip = useCallback(async () => {
    const data = await evaluasiApi.findPengajuanBeritaAcara(pengajuanId, { arsip: true })
    queryClient.setQueryData(queryKeys.evaluasiPengajuanBeritaAcara(pengajuanId), data)
    return data
  }, [pengajuanId, queryClient])

  const prefetchSopDokumenArsip = useCallback(
    async (detailSopId: string) => {
      const data = await evaluasiApi.findPengajuanSopDokumen(
        pengajuanId,
        detailSopId,
        WORKBENCH_LOGS_LIMIT,
        { arsip: true },
      )
      queryClient.setQueryData(
        queryKeys.evaluasiPengajuanSopDokumen(
          pengajuanId,
          detailSopId,
          WORKBENCH_LOGS_LIMIT,
        ),
        data,
      )
      return data
    },
    [pengajuanId, queryClient],
  )

  const handleCetak = useCallback(
    async (target: PengajuanPrintTarget) => {
      if (target === 'sop-all') {
        if (!semuaSopReady) {
          setPendingSopAll(true)
          return
        }
        await schedulePengajuanPrintAfterPaint('sop-all')
        return
      }
      setCetakLoading(true)
      try {
        if (target === 'ba') {
          await prefetchBeritaAcaraArsip()
          await schedulePengajuanPrintAfterPaint('ba')
          return
        }
        if (effectiveSopDetailId === null) {
          return
        }
        await prefetchSopDokumenArsip(effectiveSopDetailId)
        await schedulePengajuanPrintAfterPaint('sop')
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Gagal memuat dokumen untuk dicetak'
        showToast(message, 'error')
      } finally {
        setCetakLoading(false)
      }
    },
    [
      effectiveSopDetailId,
      prefetchBeritaAcaraArsip,
      prefetchSopDokumenArsip,
      semuaSopReady,
      showToast,
    ],
  )

  useEffect(() => {
    if (!pendingSopAll || !semuaSopReady) {
      return
    }
    setPendingSopAll(false)
    void schedulePengajuanPrintAfterPaint('sop-all')
  }, [pendingSopAll, semuaSopReady])

  const semuaSopLoading = pendingSopAll && !semuaSopReady

  return {
    handleCetak,
    cetakLoading,
    semuaSopLoading,
  }
}

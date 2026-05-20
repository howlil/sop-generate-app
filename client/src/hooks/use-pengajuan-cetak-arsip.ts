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
  setPreviewMainTab: (tab: 'sop' | 'ba') => void
}

export function usePengajuanCetakArsip({
  pengajuanId,
  effectiveSopDetailId,
  semuaSopReady,
  setPreviewMainTab,
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
        schedulePengajuanPrint('sop-all')
        return
      }
      setCetakLoading(true)
      try {
        if (target === 'ba') {
          setPreviewMainTab('ba')
          await prefetchBeritaAcaraArsip()
          schedulePengajuanPrint('ba')
          return
        }
        if (effectiveSopDetailId === null) {
          return
        }
        setPreviewMainTab('sop')
        await prefetchSopDokumenArsip(effectiveSopDetailId)
        schedulePengajuanPrint('sop')
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
      setPreviewMainTab,
      showToast,
    ],
  )

  useEffect(() => {
    if (!pendingSopAll || !semuaSopReady) {
      return
    }
    setPendingSopAll(false)
    schedulePengajuanPrint('sop-all')
  }, [pendingSopAll, semuaSopReady])

  const semuaSopLoading = pendingSopAll && !semuaSopReady

  return {
    handleCetak,
    cetakLoading,
    semuaSopLoading,
  }
}

import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { evaluasiApi } from '@/api/evaluasi'
import type { BeritaAcaraTemplateProps } from '@/components/pengajuan/berita-acara-template'
import { queryKeys } from '@/config/query-keys'
import { useToast } from '@/hooks/useToast'
import { downloadBeritaAcaraPdf } from '@/lib/print/download-berita-acara-pdf'
import { schedulePengajuanPrint, type PengajuanPrintTarget } from '@/lib/print/pengajuan-print'
import { mapPenyusunWorkbenchToPreviewProps } from '@/lib/sop/detailSop.mappers'
import { parseTTESignaturePayload } from '@/lib/tte/parse-tte-signature-payload'
import { useAuthStore } from '@/stores/authStore'
import type { TTESignaturePayload } from '@/types/dto/tte.dto'

const WORKBENCH_LOGS_LIMIT = 100

interface UsePengajuanCetakArsipParams {
  pengajuanId: string
  effectiveSopDetailId: string | null
  baTemplateProps: BeritaAcaraTemplateProps | null
}

function waitForPrintPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

async function scheduleSopPrintAfterPaint(
  props: Parameters<typeof schedulePengajuanPrint>[1],
): Promise<void> {
  await waitForPrintPaint()
  await schedulePengajuanPrint('sop', props)
}

function resolveCurrentUserBaSigningPayload(
  props: BeritaAcaraTemplateProps | null,
  userId: string | undefined,
): TTESignaturePayload | null {
  if (!props || !userId) {
    return null
  }
  const candidates = [
    props.tteSignaturePayloadPjEvaluator,
    props.tteSignaturePayloadPjPenyusun,
  ]
  return candidates.find((payload) => payload?.userId === userId) ?? null
}

export function usePengajuanCetakArsip({
  pengajuanId,
  effectiveSopDetailId,
  baTemplateProps,
}: UsePengajuanCetakArsipParams) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const [cetakLoading, setCetakLoading] = useState(false)

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
      setCetakLoading(true)
      try {
        if (target === 'ba') {
          await prefetchBeritaAcaraArsip()
          if (baTemplateProps === null) {
            showToast('Data Berita Acara belum siap untuk diunduh.', 'error')
            return
          }
          await downloadBeritaAcaraPdf(baTemplateProps, {
            signingPayload: resolveCurrentUserBaSigningPayload(baTemplateProps, currentUserId),
          })
          return
        }
        if (effectiveSopDetailId === null) {
          return
        }
        const sopDokumen = await prefetchSopDokumenArsip(effectiveSopDetailId)
        await scheduleSopPrintAfterPaint({
          ...mapPenyusunWorkbenchToPreviewProps(sopDokumen.workbench),
          tteSignaturePayload:
            parseTTESignaturePayload(sopDokumen.tteSignaturePayloadKepalaOpd) ?? null,
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Gagal memuat dokumen untuk dicetak'
        showToast(message, 'error')
      } finally {
        setCetakLoading(false)
      }
    },
    [
      baTemplateProps,
      currentUserId,
      effectiveSopDetailId,
      prefetchBeritaAcaraArsip,
      prefetchSopDokumenArsip,
      showToast,
    ],
  )

  return {
    handleCetak,
    cetakLoading,
  }
}

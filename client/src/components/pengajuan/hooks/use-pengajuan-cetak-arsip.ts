import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { evaluasiApi } from '@/api/evaluasi'
import { tteApi } from '@/api/tte'
import type { BeritaAcaraTemplateProps } from '@/components/pengajuan/berita-acara-template'
import type { SopPreviewWorkbenchProps } from '@/components/pengajuan/sop-document-preview-pane'
import { queryKeys } from '@/config/query-keys'
import { useToast } from '@/hooks/useToast'
import {
  downloadBeritaAcaraPdf,
  type BeritaAcaraPdfSigningMode,
} from '@/lib/print/download-berita-acara-pdf'
import { ApiError } from '@/lib/api/api-client'
import { PdfSigningNotAppliedError } from '@/lib/print/berita-acara-pdf-signing.util'
import {
  printSopFromPreviewProps,
  type PengajuanPrintTarget,
} from '@/lib/print/pengajuan-print'
import {
  mapBeritaAcaraTemplateProps,
  type MapBeritaAcaraPengajuanInput,
} from '@/lib/pengajuan/map-berita-acara-template-props'
import { useAuthStore } from '@/stores/authStore'
import type { TTESignaturePayload } from '@/types/dto/tte.dto'

const WORKBENCH_LOGS_LIMIT = 100

interface UsePengajuanCetakArsipParams {
  pengajuanId: string
  pengajuan: MapBeritaAcaraPengajuanInput | null
  effectiveSopDetailId: string | null
  baTemplateProps: BeritaAcaraTemplateProps | null
  sopPreviewProps: SopPreviewWorkbenchProps | null
  tteSignaturePayload?: TTESignaturePayload | null
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

function resolveBeritaAcaraPdfSigningMode(
  pdfSigningEnabled: boolean,
  userPeran: string | undefined,
  pengajuanId: string,
  signingPayload: TTESignaturePayload | null,
): BeritaAcaraPdfSigningMode {
  if (!pdfSigningEnabled) {
    return { mode: 'none' }
  }
  if (userPeran === 'KEPALA_OPD') {
    return { mode: 'arsip', pengajuanEvaluasiId: pengajuanId }
  }
  if (signingPayload) {
    return { mode: 'pj', payload: signingPayload }
  }
  return { mode: 'none' }
}

export function usePengajuanCetakArsip({
  pengajuanId,
  pengajuan,
  effectiveSopDetailId,
  baTemplateProps,
  sopPreviewProps,
  tteSignaturePayload = null,
}: UsePengajuanCetakArsipParams) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const currentUserPeran = useAuthStore((state) => state.user?.peran)
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
          const [baView, pdfSigningStatus] = await Promise.all([
            prefetchBeritaAcaraArsip(),
            queryClient.fetchQuery({
              queryKey: queryKeys.ttePdfSigningStatus,
              queryFn: () => tteApi.getPdfSigningStatus(),
            }),
          ])
          const freshBaTemplateProps =
            pengajuan !== null
              ? mapBeritaAcaraTemplateProps({ pengajuan, baView })
              : baTemplateProps
          if (freshBaTemplateProps === null) {
            showToast('Data Berita Acara belum siap untuk diunduh.', 'error')
            return
          }
          const signingPayload = resolveCurrentUserBaSigningPayload(
            freshBaTemplateProps,
            currentUserId,
          )
          const signing = resolveBeritaAcaraPdfSigningMode(
            pdfSigningStatus.enabled,
            currentUserPeran,
            pengajuanId,
            signingPayload,
          )
          if (
            pdfSigningStatus.enabled &&
            signing.mode === 'none' &&
            currentUserPeran !== 'KEPALA_OPD'
          ) {
            showToast(
              'PDF diunduh tanpa tanda tangan digital: riwayat TTE Anda belum tersedia pada dokumen ini.',
              'error',
            )
          }
          await downloadBeritaAcaraPdf(freshBaTemplateProps, {
            pdfSigningEnabled: pdfSigningStatus.enabled,
            signing,
          })
          return
        }
        if (effectiveSopDetailId === null) {
          return
        }
        if (sopPreviewProps === null) {
          showToast('Data SOP belum siap untuk dicetak.', 'error')
          return
        }
        await prefetchSopDokumenArsip(effectiveSopDetailId)
        const pdfSigningStatus = await queryClient.fetchQuery({
          queryKey: queryKeys.ttePdfSigningStatus,
          queryFn: () => tteApi.getPdfSigningStatus(),
        })
        const { diagramExportFailed } = await printSopFromPreviewProps(
          sopPreviewProps,
          tteSignaturePayload,
          {
            includeHeader: false,
            printMode: 'diagrams_only',
            signPdf: pdfSigningStatus.enabled && Boolean(tteSignaturePayload),
          },
        )
        if (diagramExportFailed) {
          showToast(
            'Diagram tidak dapat diekspor; PDF dicetak dengan tabel langkah sebagai cadangan.',
            'error',
          )
        }
      } catch (err) {
        if (err instanceof PdfSigningNotAppliedError) {
          showToast(err.message, 'error')
          return
        }
        if (err instanceof ApiError) {
          showToast(err.message, 'error')
          return
        }
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
      currentUserPeran,
      effectiveSopDetailId,
      pengajuan,
      pengajuanId,
      prefetchBeritaAcaraArsip,
      prefetchSopDokumenArsip,
      queryClient,
      showToast,
      sopPreviewProps,
      tteSignaturePayload,
    ],
  )

  return {
    handleCetak,
    cetakLoading,
  }
}

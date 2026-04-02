/**
 * useTTESignature Hook - TanStack Query Implementation
 */

import { useMutation } from '@tanstack/react-query'
import { tteApi } from '@/services/tte.api'
import { showToast } from '@/stores/uiStore'
import type { TandaTanganiBaDto, TandaTanganiSopDto } from '@/services/tte.api'

interface UseTTESignatureParams {
  role: 'biro-organisasi' | 'koordinator-tim-penyusun' | 'kepala-opd'
}

export function useTTESignature(params: UseTTESignatureParams) {
  const signBAMutation = useMutation({
    mutationFn: ({ pengajuanId, pin, nomorDokumen, judulDokumen }: { pengajuanId: string } & TandaTanganiBaDto) =>
      tteApi.tandaTanganiBA(pengajuanId, { pin, nomorDokumen, judulDokumen }),
    onSuccess: () => showToast('Berita Acara berhasil ditandatangani dengan TTE', 'success'),
    onError: (error: Error) => showToast(error.message || 'Gagal menandatangani BA', 'error'),
  })

  const koordinatorSignBAMutation = useMutation({
    mutationFn: ({ pengajuanId, pin, nomorDokumen, judulDokumen }: { pengajuanId: string } & TandaTanganiBaDto) =>
      tteApi.koordinatorTandaTanganiBA(pengajuanId, { pin, nomorDokumen, judulDokumen }),
    onSuccess: () => showToast('Berita Acara berhasil ditandatangani (Koordinator)', 'success'),
    onError: (error: Error) => showToast(error.message || 'Gagal menandatangani BA', 'error'),
  })

  const signSOPMutation = useMutation({
    mutationFn: ({ sopDetailId, pin, nomorDokumen, judulDokumen }: { sopDetailId: string } & TandaTanganiSopDto) =>
      tteApi.tandaTanganiSOP(sopDetailId, { pin, nomorDokumen, judulDokumen }),
    onSuccess: () => showToast('SOP berhasil disahkan dengan TTE', 'success'),
    onError: (error: Error) => showToast(error.message || 'Gagal mengesahkan SOP', 'error'),
  })

  const sign = async (documentId: string, pin: string, nomorDokumen: string, judulDokumen: string) => {
    if (params.role === 'biro-organisasi') {
      return signBAMutation.mutateAsync({ pengajuanId: documentId, pin, nomorDokumen, judulDokumen })
    }
    if (params.role === 'koordinator-tim-penyusun') {
      return koordinatorSignBAMutation.mutateAsync({ pengajuanId: documentId, pin, nomorDokumen, judulDokumen })
    }
    if (params.role === 'kepala-opd') {
      return signSOPMutation.mutateAsync({ sopDetailId: documentId, pin, nomorDokumen, judulDokumen })
    }
    throw new Error('Invalid role')
  }

  return {
    signature: null,
    loading: signBAMutation.isPending || koordinatorSignBAMutation.isPending || signSOPMutation.isPending,
    error: signBAMutation.error || koordinatorSignBAMutation.error || signSOPMutation.error,
    canSign: true,
    sign,
    signBA: signBAMutation.mutateAsync,
    koordinatorSignBA: koordinatorSignBAMutation.mutateAsync,
    signSOP: signSOPMutation.mutateAsync,
  }
}

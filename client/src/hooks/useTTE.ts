/**
 * useTTE hook dengan TanStack Query
 * Matches server: TTEService endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tteApi } from '@/services/tte.api'
import { queryKeys } from '@/services/queryKeys'
import { showToast } from '@/stores/uiStore'
import type {
  KredensialTTE,
  RegisterTteDto,
  VerifikasiEmailDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
} from '@/types/tte'

/**
 * Hook untuk get kredensial TTE user (TTE-01)
 */
export function useTTEProfil() {
  return useQuery({
    queryKey: queryKeys.tteProfil,
    queryFn: () => tteApi.getProfil(),
    retry: false, // Don't retry if not found (user may not have kredensial yet)
  })
}

/**
 * Hook untuk register kredensial TTE (TTE-01)
 */
export function useRegisterTTE() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterTteDto) => tteApi.registerProfil(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tteProfil })
      showToast('Kredensial TTE berhasil didaftarkan', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal mendaftarkan kredensial TTE', 'error')
    },
  })
}

/**
 * Hook untuk request token verifikasi email (TTE-02)
 */
export function useMintTokenVerifikasi() {
  return useMutation({
    mutationFn: () => tteApi.mintTokenVerifikasi(),
    onSuccess: (data) => {
      showToast(`Token verifikasi: ${data.token}`, 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal membuat token verifikasi', 'error')
    },
  })
}

/**
 * Hook untuk konfirmasi email dengan token (TTE-02)
 */
export function useKonfirmasiEmail() {
  return useMutation({
    mutationFn: (payload: VerifikasiEmailDto) => tteApi.konfirmasiEmail(payload),
    onSuccess: () => {
      showToast('Email berhasil diverifikasi', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Token tidak valid atau sudah kadaluarsa', 'error')
    },
  })
}

/**
 * Hook untuk get riwayat tanda tangan user (TTE-13)
 */
export function useRiwayatTandaTangan() {
  return useQuery({
    queryKey: queryKeys.tteRiwayat,
    queryFn: () => tteApi.getSigningHistory(),
  })
}

/**
 * Hook untuk tanda tangan Berita Acara - Biro Organisasi (TTE-05)
 */
export function useTandaTanganiBA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TandaTanganiBaDto) => tteApi.tandaTanganiBA(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
      showToast('Berita Acara berhasil ditandatangani', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menandatangani Berita Acara', 'error')
    },
  })
}

/**
 * Hook untuk tanda tangan Berita Acara - Koordinator (TTE-06)
 */
export function useKoordinatorTandaTanganiBA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TandaTanganiBaDto) => tteApi.koordinatorTandaTanganiBA(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
      showToast('Berita Acara berhasil ditandatangani', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menandatangani Berita Acara', 'error')
    },
  })
}

/**
 * Hook untuk tanda tangan SOP - Kepala OPD (TTE-07)
 */
export function useTandaTanganiSOP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TandaTanganiSopDto) => tteApi.tandaTanganiSOP(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
      showToast('SOP berhasil disahkan', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal mengesahkan SOP', 'error')
    },
  })
}

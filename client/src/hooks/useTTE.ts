/**
 * useTTE hook - TanStack Query
 * Matches server: TTEService endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tteApi } from '@/services/tte.api'
import { queryKeys } from '@/services/queryKeys'
import { showToast } from '@/stores/uiStore'
import type {
  RegisterTteDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
} from '@/types/tte'

const TTE_STALE_TIME = 5 * 60 * 1000 // 5 minutes

// ==================== TTE Domain Logic (DEPRECATED - Use server-side verification) ====================
/**
 * @deprecated Use server-side PIN hashing instead
 */
export function hashPin(pin: string): string {
  return btoa(pin)
}

/**
 * @deprecated Use server-side PIN verification instead
 */
export function verifyPin(pin: string, pinHash: string): boolean {
  return hashPin(pin) === pinHash
}

/**
 * @deprecated Use server-side storage instead
 */
export function getTTEProfile(_role: string): null {
  return null
}

/**
 * @deprecated Use server-side storage instead
 */
export function setTTEProfile(_role: string, _profile: any): void {
  // no-op
}

/**
 * @deprecated Use server-side storage instead
 */
export function addTTESignature(_id: string, _signature: any): void {
  // no-op
}

/**
 * @deprecated Use server-side validation instead
 */
export function getValidasiPengesahanUrl(_id: string): string {
  return '#'
}

/**
 * @deprecated Use server-side validation instead
 */
export function getTTEVerificationSuccessUrl(): string {
  return '#'
}

export function useTTEProfil() {
  return useQuery({
    queryKey: queryKeys.tteProfil,
    queryFn: () => tteApi.getProfil(),
    staleTime: TTE_STALE_TIME,
    retry: false,
  })
}

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

export function useKonfirmasiEmail() {
  return useMutation({
    mutationFn: (token: string) => tteApi.konfirmasiEmail(token),
    onSuccess: () => {
      showToast('Email berhasil diverifikasi', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Token tidak valid atau sudah kadaluarsa', 'error')
    },
  })
}

export function useRiwayatTandaTangan() {
  return useQuery({
    queryKey: queryKeys.tteRiwayat,
    queryFn: () => tteApi.getSigningHistory(),
    staleTime: TTE_STALE_TIME,
  })
}

export function useTandaTanganiBA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pengajuanId, payload }: { pengajuanId: string; payload: TandaTanganiBaDto }) =>
      tteApi.tandaTanganiBA(pengajuanId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
      showToast('Berita Acara berhasil ditandatangani', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menandatangani Berita Acara', 'error')
    },
  })
}

export function useKoordinatorTandaTanganiBA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pengajuanId, payload }: { pengajuanId: string; payload: TandaTanganiBaDto }) =>
      tteApi.koordinatorTandaTanganiBA(pengajuanId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
      showToast('Berita Acara berhasil ditandatangani', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menandatangani Berita Acara', 'error')
    },
  })
}

export function useTandaTanganiSOP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sopDetailId, payload }: { sopDetailId: string; payload: TandaTanganiSopDto }) =>
      tteApi.tandaTanganiSOP(sopDetailId, payload),
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

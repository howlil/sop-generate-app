/**
 * useTTE hook - TanStack Query
 * Matches server: TTEService endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tteApi } from '@/services/tte.api'
import { queryKeys } from '@/utils/query-keys'
import { withMutationToast } from '@/utils/handleApi'
import { showToast } from '@/stores/uiStore'
import type {
  RegisterTteDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
} from '@/types/tte'

const TTE_STALE_TIME = 5 * 60 * 1000 // 5 minutes

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
    ...withMutationToast('Kredensial TTE berhasil didaftarkan', 'Gagal mendaftarkan kredensial TTE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tteProfil })
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
    ...withMutationToast('Email berhasil diverifikasi', 'Token tidak valid atau sudah kadaluarsa'),
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
    ...withMutationToast('Berita Acara berhasil ditandatangani', 'Gagal menandatangani Berita Acara'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
    },
  })
}

export function useKoordinatorTandaTanganiBA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pengajuanId, payload }: { pengajuanId: string; payload: TandaTanganiBaDto }) =>
      tteApi.koordinatorTandaTanganiBA(pengajuanId, payload),
    ...withMutationToast('Berita Acara berhasil ditandatangani', 'Gagal menandatangani Berita Acara'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
    },
  })
}

export function useTandaTanganiSOP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sopDetailId, payload }: { sopDetailId: string; payload: TandaTanganiSopDto }) =>
      tteApi.tandaTanganiSOP(sopDetailId, payload),
    ...withMutationToast('SOP berhasil disahkan', 'Gagal mengesahkan SOP'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluasi })
    },
  })
}

// ==================== Role-based Signing (unified) ====================
interface UseTTESignatureParams {
  role: 'biro-organisasi' | 'koordinator-tim-penyusun' | 'kepala-opd'
}

/** Unified signing hook with role-based routing */
export function useTTESignature(params: UseTTESignatureParams) {
  const signBAMutation = useMutation({
    mutationFn: ({ pengajuanId, pin, nomorDokumen, judulDokumen }: { pengajuanId: string } & TandaTanganiBaDto) =>
      tteApi.tandaTanganiBA(pengajuanId, { pin, nomorDokumen, judulDokumen }),
    ...withMutationToast('Berita Acara berhasil ditandatangani dengan TTE', 'Gagal menandatangani BA'),
  })

  const koordinatorSignBAMutation = useMutation({
    mutationFn: ({ pengajuanId, pin, nomorDokumen, judulDokumen }: { pengajuanId: string } & TandaTanganiBaDto) =>
      tteApi.koordinatorTandaTanganiBA(pengajuanId, { pin, nomorDokumen, judulDokumen }),
    ...withMutationToast('Berita Acara berhasil ditandatangani (Koordinator)', 'Gagal menandatangani BA'),
  })

  const signSOPMutation = useMutation({
    mutationFn: ({ sopDetailId, pin, nomorDokumen, judulDokumen }: { sopDetailId: string } & TandaTanganiSopDto) =>
      tteApi.tandaTanganiSOP(sopDetailId, { pin, nomorDokumen, judulDokumen }),
    ...withMutationToast('SOP berhasil disahkan dengan TTE', 'Gagal mengesahkan SOP'),
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

  const createPinConfirmHandler = (
    config: { documentLabel: string; referenceId: string },
    onSuccess?: () => void
  ) => {
    return async (pin: string): Promise<boolean> => {
      try {
        await sign(config.referenceId, pin, config.documentLabel, config.documentLabel)
        onSuccess?.()
        return true
      } catch (error) {
        return false
      }
    }
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
    createPinConfirmHandler,
  }
}

// ==================== Legacy Stubs (for backward compatibility) ====================
/** @internal Legacy stub - use useTTEProfil instead */
export function getTTEProfile(_role: string): null {
  return null
}

/** @internal Legacy stub - PIN verification is now server-side */
export function verifyPin(_pin: string, _hash?: string): boolean {
  return true
}

/** @internal Legacy stub - signatures are now managed server-side */
export function addTTESignature(
  _role: string,
  _nip: string,
  _nama: string,
  _jabatan: string,
  _pangkat: string,
  _sopId: string,
  _sopNama: string,
  _sopNomor: string
): void {}

/** @internal Legacy stub - use useRegisterTTE mutation instead */
export function setTTEProfile(
  _role: string,
  _profile: {
    nip: string
    namaLengkap: string
    email: string
    jabatan: string
    pangkat: string
    nohp: string
    pinHash: string
    emailVerified: boolean
    role: string
    verificationToken: string
  }
): void {}

/** @internal Legacy stub - hash PIN helper (client-side simulation) */
export function hashPin(pin: string): string {
  // Simple hash simulation (in production, this should be server-side)
  return 'hash_' + btoa(pin).slice(0, 20)
}

/** @internal Legacy stub - get verification URL */
export function getTTEVerificationSuccessUrl(token: string): string {
  return `/validasi/ttd-berhasil?token=${token}`
}

/** @internal Legacy stub - get validation URL for QR code */
export function getValidasiPengesahanUrl(id: string): string {
  return `${window.location.origin}/validasi/pengesahan/${id}`
}

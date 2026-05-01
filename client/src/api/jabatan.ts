/**
 * Jabatan API service — Kepala OPD jabatan management
 */

import { apiClient } from '@/lib/api/api-client'
import type {
  JabatanUser,
} from '@/types/dto/jabatan.dto'
import type {
  PindahJabatanDto,
  RiwayatJabatanQueryParams,
  SetKepalaAktifDto,
} from '@/types/dto/jabatan.dto'

export const jabatanApi = {
  /** Set a user as Kepala OPD (deactivates current one if any) */
  setKepalaAktif: (payload: SetKepalaAktifDto) =>
    apiClient.post<JabatanUser>('/users/jabatan/set-kepala-aktif', payload),

  /** End a Kepala OPD's tenure */
  akhiriJabatan: (userId: string) =>
    apiClient.post<JabatanUser>(`/users/jabatan/akhiri/${userId}`, {}),

  /** Move Kepala OPD to different OPD */
  pindahJabatan: (userId: string, payload: PindahJabatanDto) =>
    apiClient.post<JabatanUser>(`/users/jabatan/pindah/${userId}`, payload),

  /** Get list of Kepala OPD (current + history) */
  getRiwayat: (params?: RiwayatJabatanQueryParams) => {
    const query = params?.opdId ? `?opdId=${params.opdId}` : ''
    return apiClient.get<JabatanUser[]>(`/users/jabatan/riwayat${query}`)
  },
}

/**
 * useJabatan hook — Kepala OPD jabatan management
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/config/query-keys'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { STALE_TIME } from '@/utils/constants'
import type {
  PindahJabatanMutationDto,
  RiwayatJabatanQueryParams,
  SetKepalaAktifDto,
} from '@/types/dto/jabatan.dto'

export function useRiwayatJabatan(opdId?: string) {
  const params: RiwayatJabatanQueryParams | undefined = opdId ? { opdId } : undefined
  return useQuery({
    queryKey: queryKeys.jabatanRiwayat(opdId),
    queryFn: () => jabatanApi.getRiwayat(params),
    staleTime: STALE_TIME.MEDIUM,
    enabled: true,
  })
}

export function useSetKepalaAktif() {
  return useMutationWithToast({
    mutationFn: (payload: SetKepalaAktifDto) => jabatanApi.setKepalaAktif(payload),
    invalidateKeys: [queryKeys.users, queryKeys.jabatan, queryKeys.timPenyusun, queryKeys.timEvaluasi],
    successMessage: 'Kepala OPD berhasil ditetapkan',
    errorMessagePrefix: 'Gagal menetapkan Kepala OPD',
  })
}

export function useAkhiriJabatan() {
  return useMutationWithToast({
    mutationFn: (userId: string) => jabatanApi.akhiriJabatan(userId),
    invalidateKeys: [queryKeys.users, queryKeys.jabatan, queryKeys.timPenyusun, queryKeys.timEvaluasi],
    successMessage: 'Jabatan Kepala OPD berhasil diakhiri',
    errorMessagePrefix: 'Gagal mengakhiri jabatan',
  })
}

export function usePindahJabatan() {
  return useMutationWithToast({
    mutationFn: ({ userId, opdId }: PindahJabatanMutationDto) =>
      jabatanApi.pindahJabatan(userId, { opdId }),
    invalidateKeys: [queryKeys.users, queryKeys.jabatan, queryKeys.timPenyusun, queryKeys.timEvaluasi],
    successMessage: 'Jabatan berhasil dipindah',
    errorMessagePrefix: 'Gagal memindah jabatan',
  })
}

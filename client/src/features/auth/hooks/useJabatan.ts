/**
 * useJabatan hook — Kepala OPD jabatan management
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/config/query-keys'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { STALE_TIME } from '@/utils/constants'
import { jabatanApi } from '../services/jabatan.api'

export function useRiwayatJabatan(opdId?: string) {
  return useQuery({
    queryKey: queryKeys.jabatanRiwayat(opdId),
    queryFn: () => jabatanApi.getRiwayat(opdId),
    staleTime: STALE_TIME.MEDIUM,
    enabled: true,
  })
}

export function useSetKepalaAktif() {
  return useMutationWithToast({
    mutationFn: ({ userId, opdId }: { userId: string; opdId: string }) =>
      jabatanApi.setKepalaAktif(userId, opdId),
    invalidateKeys: [queryKeys.users, queryKeys.jabatan],
    successMessage: 'Kepala OPD berhasil ditetapkan',
    errorMessagePrefix: 'Gagal menetapkan Kepala OPD',
  })
}

export function useAkhiriJabatan() {
  return useMutationWithToast({
    mutationFn: (userId: string) => jabatanApi.akhiriJabatan(userId),
    invalidateKeys: [queryKeys.users, queryKeys.jabatan],
    successMessage: 'Jabatan Kepala OPD berhasil diakhiri',
    errorMessagePrefix: 'Gagal mengakhiri jabatan',
  })
}

export function usePindahJabatan() {
  return useMutationWithToast({
    mutationFn: ({ userId, opdId }: { userId: string; opdId: string }) =>
      jabatanApi.pindahJabatan(userId, opdId),
    invalidateKeys: [queryKeys.users, queryKeys.jabatan],
    successMessage: 'Jabatan berhasil dipindah',
    errorMessagePrefix: 'Gagal memindah jabatan',
  })
}

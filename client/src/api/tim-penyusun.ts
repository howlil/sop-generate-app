/**
 * Tim Penyusun API service
 * Matches server: TimPenyusunController
 */

import { apiClient, buildQueryString } from '@/lib/api/api-client'
import type {
  AnggotaTimPenyusun,
} from '@/types/dto/tim.dto'
import type {
  CreateTimPenyusunDto,
  PindahTimPenyusunDto,
  PaginatedTimPenyusunResponse,
  TimPenyusunQueryParams,
} from '@/types/dto/tim.dto'

export const timPenyusunApi = {
  findAll: (params: TimPenyusunQueryParams = {}) => {
    const { page = 1, limit = 20, ...filters } = params
    const query = buildQueryString({ page, limit, ...filters })
    return apiClient.get<PaginatedTimPenyusunResponse<AnggotaTimPenyusun>>(`/tim-penyusun${query}`)
  },

  findById: (id: string) =>
    apiClient.get<AnggotaTimPenyusun>(`/tim-penyusun/${id}`),

  tambah: (payload: CreateTimPenyusunDto) =>
    apiClient.post<AnggotaTimPenyusun>('/tim-penyusun', payload),

  nonaktifkan: (id: string) =>
    apiClient.patch<AnggotaTimPenyusun>(`/tim-penyusun/${id}/nonaktifkan`),

  pindah: (id: string, payload: PindahTimPenyusunDto) =>
    apiClient.patch<AnggotaTimPenyusun>(`/tim-penyusun/${id}/pindah`, payload),
}

/**
 * useTimPenyusun hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  CreateTimPenyusunDto as CreateTimPenyusunRequest,
  PindahTimPenyusunMutationDto,
  TimPenyusunQueryParams,
} from "@/types/dto/tim.dto";

export function useTimPenyusun(params: TimPenyusunQueryParams = {}) {
  const { opdId, page = 1, limit = 20 } = params;
  
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.timPenyusunList(opdId, page, limit),
    queryFn: () => timPenyusunApi.findAll({ opdId, page, limit }),
    staleTime: STALE_TIME.MEDIUM,
  });

  const tambahMutation = useMutationWithToast({
    mutationFn: (payload: CreateTimPenyusunRequest) =>
      timPenyusunApi.tambah(payload),
    invalidateKeys: [queryKeys.timPenyusun],
    successMessage: "Anggota Tim Penyusun berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambahkan anggota",
  });

  const nonaktifkanMutation = useMutationWithToast({
    mutationFn: (id: string) => timPenyusunApi.nonaktifkan(id),
    invalidateKeys: [queryKeys.timPenyusun],
    successMessage: "Anggota Tim Penyusun dinonaktifkan",
    errorMessagePrefix: "Gagal menonaktifkan anggota",
  });

  const pindahMutation = useMutationWithToast({
    mutationFn: ({ id, opdId }: PindahTimPenyusunMutationDto) =>
      timPenyusunApi.pindah(id, { opdId }),
    invalidateKeys: [queryKeys.timPenyusun],
    successMessage: "Anggota Tim Penyusun dipindah",
    errorMessagePrefix: "Gagal memindah anggota",
  });

  return {
    list: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    tambah: tambahMutation.mutateAsync,
    nonaktifkan: nonaktifkanMutation.mutateAsync,
    pindah: pindahMutation.mutateAsync,
    isAdding: tambahMutation.isPending,
    isNonaktifkan: nonaktifkanMutation.isPending,
    isPindah: pindahMutation.isPending,
  };
}

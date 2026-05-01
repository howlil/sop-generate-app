/**
 * Peraturan API service
 * Matches server: PeraturanController
 */

import { apiClient, buildQueryString } from '@/lib/api/api-client'
import type {
  PeraturanResponse,
} from '@/types/dto/peraturan.dto'
import type {
  CreatePeraturanDto,
  PeraturanListQueryParams,
  UpdatePeraturanDto,
} from '@/types/dto/peraturan.dto'

export const peraturanApi = {
  /**
   * PRT-01: Get all peraturan
   * Filter by OPD for non-BIRO roles
   */
  findAll: (params?: PeraturanListQueryParams) =>
    apiClient.get<PeraturanResponse[]>(`/peraturan${buildQueryString(params)}`),

  /**
   * PRT-06: Get peraturan by ID
   */
  findById: (id: string) =>
    apiClient.get<PeraturanResponse>(`/peraturan/${id}`),

  /**
   * PRT-02: Create new peraturan (Tim Penyusun / Koordinator Tim Penyusun)
   */
  create: (payload: CreatePeraturanDto) =>
    apiClient.post<PeraturanResponse>('/peraturan', payload),

  /**
   * PRT-03: Update peraturan
   */
  update: (id: string, payload: UpdatePeraturanDto) =>
    apiClient.patch<PeraturanResponse>(`/peraturan/${id}`, payload),

  /**
   * PRT-09: Delete peraturan
   * Fails if still used as DasarHukum
   */
  delete: (id: string) =>
    apiClient.delete(`/peraturan/${id}`),
}

/**
 * usePeraturan hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  CreatePeraturanDto,
  PeraturanListQueryParams,
  UpdatePeraturanMutationDto,
  UpdatePeraturanDto,
} from "@/types/dto/peraturan.dto";

export function usePeraturan(opdId?: string) {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.peraturanList(opdId),
    queryFn: () => peraturanApi.findAll(opdId ? ({ opdId } as PeraturanListQueryParams) : undefined),
    staleTime: STALE_TIME.MEDIUM,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreatePeraturanDto) => peraturanApi.create(payload),
    invalidateKeys: [queryKeys.peraturanList(opdId)],
    successMessage: "Peraturan berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambahkan peraturan",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({
      id,
      payload,
    }: UpdatePeraturanMutationDto) => peraturanApi.update(id, payload),
    invalidateKeys: [queryKeys.peraturanList(opdId)],
    successMessage: "Peraturan berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui peraturan",
  });

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: string) => peraturanApi.delete(id),
    invalidateKeys: [queryKeys.peraturanList(opdId)],
    successMessage: "Peraturan berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus peraturan",
  });

  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

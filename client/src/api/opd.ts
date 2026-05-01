/**
 * OPD API service
 * Matches server: OpdController
 */

import { apiClient } from '@/lib/api/api-client'
import type { OpdResponse } from '@/types/dto/opd.dto'
import type { CreateOpdDto, UpdateOpdDto } from '@/types/dto/opd.dto'

export const opdApi = {
  /**
   * OPD-01/OPD-05: Get all OPD
   * BIRO_ORGANISASI: see all OPD
   * Other roles: see only their own OPD
   */
  findAll: () =>
    apiClient.get<OpdResponse[]>('/opd'),

  /**
   * OPD-05: Get OPD by ID
   */
  findById: (id: string) =>
    apiClient.get<OpdResponse>(`/opd/${id}`),

  /**
   * OPD-02: Create new OPD (Biro Organisasi only)
   */
  create: (payload: CreateOpdDto) =>
    apiClient.post<OpdResponse>('/opd', payload),

  /**
   * OPD-03: Update OPD (Biro Organisasi only)
   */
  update: (id: string, payload: UpdateOpdDto) =>
    apiClient.patch<OpdResponse>(`/opd/${id}`, payload),

  /**
   * OPD-04: Soft-delete OPD (Biro Organisasi only)
   * Validates no active pengajuan evaluasi
   */
  delete: (id: string) =>
    apiClient.delete(`/opd/${id}`),
}

/**
 * useOpd hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  CreateOpdDto,
  UpdateOpdMutationDto,
} from "@/types/dto/opd.dto";

export function useOpd() {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.opdList(),
    queryFn: () => opdApi.findAll(),
    staleTime: STALE_TIME.MEDIUM,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateOpdDto) => opdApi.create(payload),
    invalidateKeys: [queryKeys.opd],
    successMessage: "OPD berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambahkan OPD",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, payload }: UpdateOpdMutationDto) =>
      opdApi.update(id, payload),
    invalidateKeys: [queryKeys.opd],
    successMessage: "OPD berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui OPD",
  });

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: string) => opdApi.delete(id),
    invalidateKeys: [queryKeys.opd],
    successMessage: "OPD berhasil dinonaktifkan",
    errorMessagePrefix: "Gagal menonaktifkan OPD",
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

export function useOpdDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.opdById(id),
    queryFn: () => opdApi.findById(id),
    enabled: !!id,
    staleTime: STALE_TIME.MEDIUM,
  });
}

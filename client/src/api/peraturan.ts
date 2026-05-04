/**
 * Peraturan API service
 * Matches server: PeraturanController (bungkus ApiSuccessResponse)
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient, buildQueryString } from '@/lib/api/api-client'
import { queryKeys } from '@/config/query-keys'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { STALE_TIME } from '@/utils/constants'
import type { ApiSuccessResponse } from '@/types/dto/auth.dto'
import type {
  CreatePeraturanDto,
  PeraturanListQueryParams,
  PeraturanResponse,
  UpdatePeraturanDto,
  UpdatePeraturanMutationDto,
} from '@/types/dto/peraturan.dto'

async function unwrap<T>(promise: Promise<ApiSuccessResponse<T>>): Promise<T> {
  const envelope = await promise
  return envelope.data as T
}

export const peraturanApi = {
  findAll: (params?: PeraturanListQueryParams): Promise<PeraturanResponse[]> =>
    unwrap(
      apiClient.get<ApiSuccessResponse<PeraturanResponse[]>>(
        `/peraturan${buildQueryString(params as Record<string, unknown> | undefined)}`,
      ),
    ),

  findById: (id: string): Promise<PeraturanResponse> =>
    unwrap(apiClient.get<ApiSuccessResponse<PeraturanResponse>>(`/peraturan/${id}`)),

  /** Buat master peraturan + tautan ke OPD pengguna (opdId dari JWT di server). */
  create: (payload: CreatePeraturanDto): Promise<PeraturanResponse> =>
    unwrap(apiClient.post<ApiSuccessResponse<PeraturanResponse>>('/peraturan', payload)),

  update: (id: string, payload: UpdatePeraturanDto): Promise<PeraturanResponse> =>
    unwrap(apiClient.patch<ApiSuccessResponse<PeraturanResponse>>(`/peraturan/${id}`, payload)),

  delete: (id: string): Promise<void> =>
    unwrap(apiClient.delete<ApiSuccessResponse<null>>(`/peraturan/${id}`)),
}

export function usePeraturan(opdId?: string) {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.peraturanList(opdId),
    queryFn: () => peraturanApi.findAll(opdId ? ({ opdId } as PeraturanListQueryParams) : undefined),
    staleTime: STALE_TIME.MEDIUM,
  })

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreatePeraturanDto) => peraturanApi.create(payload),
    invalidateKeys: [queryKeys.peraturanList(opdId)],
    successMessage: 'Peraturan berhasil ditambahkan',
    errorMessagePrefix: 'Gagal menambahkan peraturan',
  })

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, payload }: UpdatePeraturanMutationDto) => peraturanApi.update(id, payload),
    invalidateKeys: [queryKeys.peraturanList(opdId)],
    successMessage: 'Peraturan berhasil diperbarui',
    errorMessagePrefix: 'Gagal memperbarui peraturan',
  })

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: string) => peraturanApi.delete(id),
    invalidateKeys: [queryKeys.peraturanList(opdId)],
    successMessage: 'Peraturan berhasil dihapus',
    errorMessagePrefix: 'Gagal menghapus peraturan',
  })

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
  }
}

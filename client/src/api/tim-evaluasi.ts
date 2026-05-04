/**
 * Tim Evaluasi API — relatif ke base `/api/v1` → `EvaluatorController` di `/evaluator`.
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient, buildQueryString } from '@/lib/api/api-client'
import { queryKeys } from '@/config/query-keys'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { STALE_TIME } from '@/utils/constants'
import type { ApiSuccessResponse } from '@/types/dto/auth.dto'
import type {
  AnggotaTimEvaluasi,
  CreateTimEvaluasiDto,
  EvaluatorOpdGrup,
  UpdateTimEvaluasiAnggotaDto,
  UpdateTimEvaluasiMutationDto,
} from '@/types/dto/tim.dto'

async function unwrap<T>(promise: Promise<ApiSuccessResponse<T>>): Promise<T> {
  const envelope = await promise
  return envelope.data as T
}

export const timEvaluasiApi = {
  findAll: async (params?: { search?: string }): Promise<AnggotaTimEvaluasi[]> => {
    const s = params?.search?.trim()
    const qs = buildQueryString(s ? { search: s } : undefined)
    const grup = await unwrap(
      apiClient.get<ApiSuccessResponse<EvaluatorOpdGrup[]>>(
        `/evaluator${qs}`,
      ),
    )
    return grup.flatMap((g) => g.evaluator)
  },

  tambah: (payload: CreateTimEvaluasiDto) =>
    unwrap(
      apiClient.post<ApiSuccessResponse<AnggotaTimEvaluasi>>('/evaluator', payload),
    ),

  update: (id: string, payload: UpdateTimEvaluasiAnggotaDto) =>
    unwrap(
      apiClient.patch<ApiSuccessResponse<AnggotaTimEvaluasi>>(
        `/evaluator/${id}`,
        payload,
      ),
    ),

  hapus: async (id: string): Promise<void> => {
    await unwrap(apiClient.delete<ApiSuccessResponse<null>>(`/evaluator/${id}`))
  },
}

export function useTimEvaluasi(search?: string) {
  const searchKey = search?.trim() ?? ''
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.timEvaluasiList(searchKey || undefined),
    queryFn: () =>
      timEvaluasiApi.findAll(searchKey ? { search: searchKey } : undefined),
    staleTime: STALE_TIME.MEDIUM,
  })

  const tambahMutation = useMutationWithToast({
    mutationFn: (payload: CreateTimEvaluasiDto) => timEvaluasiApi.tambah(payload),
    invalidateKeys: [queryKeys.timEvaluasi],
    successMessage: 'Anggota Tim Evaluasi berhasil ditambahkan',
    errorMessagePrefix: 'Gagal menambahkan anggota',
  })

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, payload }: UpdateTimEvaluasiMutationDto) =>
      timEvaluasiApi.update(id, payload),
    invalidateKeys: [queryKeys.timEvaluasi],
    successMessage: 'Data anggota berhasil diperbarui',
    errorMessagePrefix: 'Gagal memperbarui anggota',
  })

  const hapusMutation = useMutationWithToast({
    mutationFn: (id: string) => timEvaluasiApi.hapus(id),
    invalidateKeys: [queryKeys.timEvaluasi],
    successMessage: 'Anggota Tim Evaluasi berhasil dinonaktifkan',
    errorMessagePrefix: 'Gagal menonaktifkan anggota',
  })

  return {
    list: data ?? [],
    isLoading,
    error,
    tambah: tambahMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    hapus: hapusMutation.mutateAsync,
    isAdding: tambahMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: hapusMutation.isPending,
  }
}

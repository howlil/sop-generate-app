/**
 * OPD API service — selaras server OpdController (/opd).
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient, buildQueryString } from '@/lib/api/api-client'
import { queryKeys } from '@/config/query-keys'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { STALE_TIME } from '@/utils/constants'
import type { ApiSuccessResponse } from '@/types/dto/auth.dto'
import type {
  CreateOpdDto,
  OpdEvaluasiRingkas,
  OpdMutasi,
  OpdRingkas,
  UpdateOpdDto,
  UpdateOpdMutationDto,
} from '@/types/dto/opd.dto'

async function unwrap<T>(promise: Promise<ApiSuccessResponse<T>>): Promise<T> {
  const envelope = await promise
  return envelope.data
}

/** Respons bisa berupa array langsung (legacy) atau bungkus ApiSuccessResponse — penting untuk cache lama. */
function coerceOpdRingkasList(raw: unknown): OpdRingkas[] {
  if (Array.isArray(raw)) {
    return raw as OpdRingkas[]
  }
  if (
    raw !== null &&
    typeof raw === 'object' &&
    'data' in raw &&
    Array.isArray((raw as ApiSuccessResponse<OpdRingkas[]>).data)
  ) {
    return (raw as ApiSuccessResponse<OpdRingkas[]>).data
  }
  return []
}

export const opdApi = {
  /** Daftar OPD ringkas (peran menentukan ruang lingkup). */
  findAll: async (params?: { search?: string }): Promise<OpdRingkas[]> => {
    const s = params?.search?.trim()
    const qs = buildQueryString(s ? { search: s } : undefined)
    const raw = await apiClient.get<unknown>(`/opd${qs}`)
    return coerceOpdRingkasList(raw)
  },

  /** Buat OPD (PJ_EVALUATOR). */
  create: (payload: CreateOpdDto): Promise<OpdMutasi> =>
    unwrap(apiClient.post<ApiSuccessResponse<OpdMutasi>>('/opd', payload)),

  /** Perbarui nama OPD (PJ_EVALUATOR). */
  update: (id: string, payload: UpdateOpdDto): Promise<OpdMutasi> =>
    unwrap(apiClient.patch<ApiSuccessResponse<OpdMutasi>>(`/opd/${id}`, payload)),

  /** Soft-delete OPD (PJ_EVALUATOR). */
  delete: async (id: string): Promise<void> => {
    await unwrap(apiClient.delete<ApiSuccessResponse<null>>(`/opd/${id}`))
  },

  /** GET `/opd/evaluasi-ringkas` — peran EVALUATOR / PJ_EVALUATOR. */
  findEvaluasiRingkas: async (params?: {
    search?: string
  }): Promise<OpdEvaluasiRingkas[]> => {
    const s = params?.search?.trim()
    const qs = buildQueryString(s ? { search: s } : undefined)
    return unwrap(
      apiClient.get<ApiSuccessResponse<OpdEvaluasiRingkas[]>>(
        `/opd/evaluasi-ringkas${qs}`,
      ),
    )
  },
}

export interface UseOpdOptions {
  /** Filter nama OPD (substring); relevan untuk PJ_EVALUATOR. */
  readonly search?: string
}

export function useOpdEvaluasiRingkas(search?: string) {
  const searchKey = search?.trim() ?? ''
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.opdEvaluasiRingkas(searchKey || undefined),
    queryFn: () =>
      opdApi.findEvaluasiRingkas(
        searchKey ? { search: searchKey } : undefined,
      ),
    staleTime: STALE_TIME.MEDIUM,
  })
  return {
    list: data ?? [],
    isLoading,
    error,
  }
}

export function useOpd(options?: UseOpdOptions) {
  const searchKey = options?.search?.trim() ?? ''
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.opdList(searchKey || undefined),
    queryFn: () =>
      opdApi.findAll(searchKey ? { search: searchKey } : undefined),
    staleTime: STALE_TIME.MEDIUM,
  })
  /** Normalisasi jika cache masih menyimpan envelope penuh dari queryFn versi lama. */
  const list = coerceOpdRingkasList(data)

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateOpdDto) => opdApi.create(payload),
    invalidateKeys: [queryKeys.opd],
    successMessage: 'OPD berhasil ditambahkan',
    errorMessagePrefix: 'Gagal menambahkan OPD',
  })

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, payload }: UpdateOpdMutationDto) =>
      opdApi.update(id, payload),
    invalidateKeys: [queryKeys.opd],
    successMessage: 'OPD berhasil diperbarui',
    errorMessagePrefix: 'Gagal memperbarui OPD',
  })

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: string) => opdApi.delete(id),
    invalidateKeys: [queryKeys.opd],
    successMessage: 'OPD berhasil dinonaktifkan',
    errorMessagePrefix: 'Gagal menonaktifkan OPD',
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

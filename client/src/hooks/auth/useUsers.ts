/**
 * useUsers hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/services/users.api'
import { queryKeys } from '@/services/queryKeys'
import { withMutationToast } from '@/utils/handleApi'
import type { CreateUserDto, UpdateUserDto } from '@/types/users'

const USERS_STALE_TIME = 3 * 60 * 1000 // 3 minutes

export function useUsers(page: number = 1, limit: number = 10) {
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.usersList(page, limit),
    queryFn: () => usersApi.findAll(page, limit),
    staleTime: USERS_STALE_TIME,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserDto) => usersApi.create(payload),
    ...withMutationToast('User berhasil dibuat', 'Gagal membuat user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserDto }) =>
      usersApi.update(id, payload),
    ...withMutationToast('User berhasil diperbarui', 'Gagal memperbarui user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    ...withMutationToast('User berhasil dihapus', 'Gagal menghapus user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })

  return {
    data,
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

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => usersApi.findById(id),
    enabled: !!id,
    staleTime: USERS_STALE_TIME,
  })
}

/**
 * useUsers hook - TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/services/users.api'
import { queryKeys } from '@/services/queryKeys'
import { showToast } from '@/stores/uiStore'
import type { CreateUserDto, UpdateUserDto } from '@/services/users.api'

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      showToast('User berhasil dibuat', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal membuat user', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserDto }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      showToast('User berhasil diperbarui', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal memperbarui user', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      showToast('User berhasil dihapus', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Gagal menghapus user', 'error')
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

/**
 * Users API service
 * Matches server: UserController
 */

import { apiClient, buildQueryString } from '@/lib/api/api-client'
import type { User, PaginatedResponse } from '@/types/dto/users.dto'
import type { CreateUserDto, UpdateUserDto, UsersQueryParams } from '@/types/dto/users.dto'

export const usersApi = {
  /**
   * AUTH-05: Create new user (Biro Organisasi only)
   */
  create: (payload: CreateUserDto) =>
    apiClient.post<User>('/users', payload),

  /**
   * Get all users with pagination (Biro Organisasi only)
   */
  findAll: (params: UsersQueryParams = {}) => {
    const { page = 1, limit = 10, ...filters } = params
    const query = buildQueryString({ page, limit, ...filters })
    return apiClient.get<PaginatedResponse<User>>(`/users${query}`)
  },

  /**
   * Get user by ID
   */
  findById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),

  /**
   * Update user
   */
  update: (id: string, payload: UpdateUserDto) =>
    apiClient.patch<User>(`/users/${id}`, payload),

  /**
   * Delete user (soft-delete) (Biro Organisasi only)
   */
  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),
}

/**
 * useUsers hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  CreateUserDto,
  UpdateUserMutationDto,
  UsersQueryParams,
} from "@/types/dto/users.dto";

export function useUsers(params: UsersQueryParams = {}) {
  const { page = 1, limit = 10, ...filters } = params;
  const queryParams = { page, limit, ...filters };
  
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.usersList(queryParams),
    queryFn: () => usersApi.findAll(queryParams),
    staleTime: STALE_TIME.MEDIUM,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateUserDto) => usersApi.create(payload),
    invalidateKeys: [queryKeys.users],
    successMessage: "User berhasil dibuat",
    errorMessagePrefix: "Gagal membuat user",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, payload }: UpdateUserMutationDto) =>
      usersApi.update(id, payload),
    invalidateKeys: [queryKeys.users],
    successMessage: "User berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui user",
  });

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: string) => usersApi.delete(id),
    invalidateKeys: [queryKeys.users],
    successMessage: "User berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus user",
  });

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
  };
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => usersApi.findById(id),
    enabled: !!id,
    staleTime: STALE_TIME.MEDIUM,
  });
}

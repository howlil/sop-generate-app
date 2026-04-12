/**
 * useUsers hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../services/users.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type { CreateUserDto, UpdateUserDto } from "../types/users";

export function useUsers(page: number = 1, limit: number = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.usersList(page, limit),
    queryFn: () => usersApi.findAll(page, limit),
    staleTime: STALE_TIME.MEDIUM,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateUserDto) => usersApi.create(payload),
    invalidateKeys: [queryKeys.users],
    successMessage: "User berhasil dibuat",
    errorMessagePrefix: "Gagal membuat user",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserDto }) =>
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

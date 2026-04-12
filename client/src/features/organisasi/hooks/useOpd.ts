/**
 * useOpd hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { opdApi } from "@/features/organisasi/services/opd.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  CreateOpdDto,
  UpdateOpdDto,
} from "@/features/organisasi/types/opd";

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
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOpdDto }) =>
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

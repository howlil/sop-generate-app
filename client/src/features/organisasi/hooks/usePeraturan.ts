/**
 * usePeraturan hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { peraturanApi } from "../services/peraturan.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  CreatePeraturanDto,
  UpdatePeraturanDto,
} from "../types/peraturan";

export function usePeraturan(opdId?: string) {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.peraturanList(opdId),
    queryFn: () => peraturanApi.findAll(opdId ? { opdId } : undefined),
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
    }: {
      id: string;
      payload: UpdatePeraturanDto;
    }) => peraturanApi.update(id, payload),
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

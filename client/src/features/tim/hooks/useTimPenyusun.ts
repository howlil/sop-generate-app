/**
 * useTimPenyusun hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { timPenyusunApi } from "../services/tim-penyusun.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type { CreateTimPenyusunDto as CreateTimPenyusunRequest } from "../types/tim";

export interface UseTimPenyusunParams {
  opdId?: string
  page?: number
  limit?: number
}

export function useTimPenyusun(params: UseTimPenyusunParams = {}) {
  const { opdId, page = 1, limit = 20 } = params;
  
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.timPenyusunList(opdId, page, limit),
    queryFn: () => timPenyusunApi.findAll({ opdId, page, limit }),
    staleTime: STALE_TIME.MEDIUM,
  });

  const tambahMutation = useMutationWithToast({
    mutationFn: (payload: CreateTimPenyusunRequest) =>
      timPenyusunApi.tambah(payload),
    invalidateKeys: [queryKeys.timPenyusun],
    successMessage: "Anggota Tim Penyusun berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambahkan anggota",
  });

  const nonaktifkanMutation = useMutationWithToast({
    mutationFn: (id: string) => timPenyusunApi.nonaktifkan(id),
    invalidateKeys: [queryKeys.timPenyusun],
    successMessage: "Anggota Tim Penyusun dinonaktifkan",
    errorMessagePrefix: "Gagal menonaktifkan anggota",
  });

  const pindahMutation = useMutationWithToast({
    mutationFn: ({ id, opdId }: { id: string; opdId: string }) =>
      timPenyusunApi.pindah(id, { opdId }),
    invalidateKeys: [queryKeys.timPenyusun],
    successMessage: "Anggota Tim Penyusun dipindah",
    errorMessagePrefix: "Gagal memindah anggota",
  });

  return {
    list: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    tambah: tambahMutation.mutateAsync,
    nonaktifkan: nonaktifkanMutation.mutateAsync,
    pindah: pindahMutation.mutateAsync,
    isAdding: tambahMutation.isPending,
    isNonaktifkan: nonaktifkanMutation.isPending,
    isPindah: pindahMutation.isPending,
  };
}

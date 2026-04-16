/**
 * useTimEvaluasi hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { timEvaluasiApi } from "../services/tim-evaluasi.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type { CreateTimEvaluasiDto } from "../types/tim";

export function useTimEvaluasi() {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.timEvaluasiList(),
    queryFn: () => timEvaluasiApi.findAll(),
    staleTime: STALE_TIME.MEDIUM,
  });

  const tambahMutation = useMutationWithToast({
    mutationFn: (payload: CreateTimEvaluasiDto) =>
      timEvaluasiApi.tambah(payload),
    invalidateKeys: [queryKeys.timEvaluasi],
    successMessage: "Anggota Tim Evaluasi berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambahkan anggota",
  });

  const nonaktifkanMutation = useMutationWithToast({
    mutationFn: (id: string) => timEvaluasiApi.nonaktifkan(id),
    invalidateKeys: [queryKeys.timEvaluasi],
    successMessage: "Anggota Tim Evaluasi dinonaktifkan",
    errorMessagePrefix: "Gagal menonaktifkan anggota",
  });

  return {
    list,
    isLoading,
    error,
    tambah: tambahMutation.mutateAsync,
    nonaktifkan: nonaktifkanMutation.mutateAsync,
    isAdding: tambahMutation.isPending,
    isNonaktifkan: nonaktifkanMutation.isPending,
  };
}

export function useTimEvaluasiDetail(id?: string) {
  return useQuery({
    queryKey: ['timEvaluasi', 'detail', id],
    queryFn: () => timEvaluasiApi.findById(id!),
    staleTime: STALE_TIME.MEDIUM,
    enabled: !!id,
  });
}

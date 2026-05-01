/**
 * Tim Evaluasi API service
 * Matches server: TimEvaluasiController
 */

import { apiClient } from "@/lib/api/api-client";
import type {
  AnggotaTimEvaluasi,
} from "@/types/dto/tim.dto";
import type { CreateTimEvaluasiDto } from "@/types/dto/tim.dto";

export const timEvaluasiApi = {
  findAll: () =>
    apiClient.get<AnggotaTimEvaluasi[]>("/tim-evaluasi"),

  findById: (id: string) =>
    apiClient.get<AnggotaTimEvaluasi>(`/tim-evaluasi/${id}`),

  tambah: (payload: CreateTimEvaluasiDto) =>
    apiClient.post<AnggotaTimEvaluasi>("/tim-evaluasi", payload),

  nonaktifkan: (id: string) =>
    apiClient.patch<AnggotaTimEvaluasi>(`/tim-evaluasi/${id}/nonaktifkan`),
};

/**
 * useTimEvaluasi hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";

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

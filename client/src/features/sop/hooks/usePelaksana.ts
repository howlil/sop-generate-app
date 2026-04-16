/**
 * usePelaksana Hook - TanStack Query Implementation
 */

import { useQuery } from "@tanstack/react-query";
import { sopApi } from "../services/sop.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { useAuthStore } from "@/stores/authStore";
import { STALE_TIME } from "@/utils/constants";

export function usePelaksana(opdId?: string) {
  const user = useAuthStore((s) => s.user);
  const effectiveOpdId = opdId || user?.opdId;

  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.pelaksanaByOpd(effectiveOpdId || ""),
    queryFn: () => sopApi.findPelaksana(effectiveOpdId || ""),
    enabled: !!effectiveOpdId,
    staleTime: STALE_TIME.MEDIUM,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (data: { namaPelaksana: string; opdId?: string }) => {
      const targetOpdId = data.opdId || effectiveOpdId;
      if (!targetOpdId) throw new Error("opdId is required - Pelaksana harus memiliki OPD");
      return sopApi.createPelaksana({
        opdId: targetOpdId,
        namaPelaksana: data.namaPelaksana,
      });
    },
    invalidateKeys: [queryKeys.pelaksanaByOpd(effectiveOpdId || "")],
    successMessage: "Pelaksana SOP berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambah pelaksana",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, namaPelaksana }: { id: string; namaPelaksana: string }) =>
      sopApi.updatePelaksana(id, namaPelaksana),
    invalidateKeys: [queryKeys.pelaksanaByOpd(effectiveOpdId || "")],
    successMessage: "Pelaksana SOP berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui pelaksana",
  });

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: string) => sopApi.deletePelaksana(id),
    invalidateKeys: [queryKeys.pelaksanaByOpd(effectiveOpdId || "")],
    successMessage: "Pelaksana SOP berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus pelaksana",
  });

  return {
    list,
    isLoading,
    error,
    addPelaksana: createMutation.mutateAsync,
    updatePelaksana: updateMutation.mutateAsync,
    removePelaksana: deleteMutation.mutateAsync,
  };
}

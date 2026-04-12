/**
 * useSop hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { sopApi } from "../services/sop.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type { StatusSOP } from "@/types/common";
import type { CreateSopRequest } from "../types/sop";

// ==================== SOP Domain Logic ====================
export function canEditSop(status: StatusSOP): boolean {
  return status === "DRAFT" || status === "REVISI_DARI_TIM_EVALUASI";
}

export function canKepalaOpdSignSop(status: string): boolean {
  return status === "DITANDATANGANI_KOORDINATOR";
}

export function isSopEligibleForSigning(sop: { status: string }): boolean {
  return sop.status === "DITANDATANGANI_KOORDINATOR";
}

// ==================== Tim Penyusun Access ====================
export function canTimPenyusunRunCoordinatorActions(role: string): boolean {
  return role === "KOORDINATOR_TIM_PENYUSUN";
}

export function useSop(params?: { opdId?: string; status?: string }) {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.sopList(params),
    queryFn: () => sopApi.findAll(params),
    staleTime: STALE_TIME.MEDIUM,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateSopRequest) => sopApi.create(payload),
    invalidateKeys: [queryKeys.sop],
    successMessage: "SOP berhasil dibuat",
    errorMessagePrefix: "Gagal membuat SOP",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, judul }: { id: string; judul: string }) =>
      sopApi.update(id, judul),
    invalidateKeys: [queryKeys.sop],
    successMessage: "Judul SOP berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui SOP",
  });

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: string) => sopApi.delete(id),
    invalidateKeys: [queryKeys.sop],
    successMessage: "SOP berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus SOP",
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

export function useSopDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.sopById(id),
    queryFn: () => sopApi.findById(id),
    enabled: !!id,
    staleTime: STALE_TIME.MEDIUM,
  });
}

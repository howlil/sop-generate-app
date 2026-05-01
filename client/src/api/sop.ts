import { useCallback, useEffect, useMemo, useState } from "react";
import type { NavigateOptions } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
import { STALE_TIME, ROUTES } from "@/utils/constants";
import { apiClient, buildQueryString } from '@/lib/api/api-client'
import { usePeraturan } from "@/api/peraturan";
import { isTempId, transformLangkahToProsedurRow, transformProsedurRowToCreateLangkah, transformProsedurRowToUpdateLangkah, transformSopDetailToMetadata } from "@/lib/sop/detailSop.mappers";
import { DEFAULT_SOP_STATUS } from "@/types/dto/sop.dto";
import type {
  DasarHukum,
  DetailSOPPelaksana,
  LampiranTeks,
  LangkahSOP,
  Pelaksana,
  Sop,
  SopDetail,
  SopTerkait,
  StatusSOP,
} from '@/types/dto/sop.dto'
import type { Peraturan } from "@/types/dto/peraturan.dto";
import type {
  CreateDasarHukumDto,
  CreateDetailSOPPelaksanaDto,
  CreateLampiranTeksDto,
  CreateLangkahSOPDto,
  CreatePelaksanaDto,
  CreateSopRequestDto,
  CreateSopTerkaitDto,
  DetailSopListQueryParams,
  SopListQueryParams,
  UpdateLangkahSOPDto,
  UpdateMetadataDto,
  UpdateMetadataMutationDto,
  UpdateSopMutationDto,
  UpdateLampiranMutationDto,
  UpdateSopJudulDto,
  SetSopStatusOverrideMutationDto,
  CreatePelaksanaMutationDto,
  UpdatePelaksanaMutationDto,
  UpdateLangkahMutationDto,
  UpdateStatusDto,
  UpdateStatusMutationDto,
} from '@/types/dto/sop.dto'
import type { LogEditSOP } from '@/types/dto/audit.dto'
import type { ProsedurRow, SOPDetailMetadata } from "@/types/ui/sop";

export const sopApi = {
  // ================= SOP (Header) =================

  findAll: (params?: SopListQueryParams) => {
    const query = buildQueryString(params as Record<string, unknown> | undefined)
    return apiClient.get<Sop[]>(`/sop${query}`)
  },

  findById: (id: string) =>
    apiClient.get<Sop>(`/sop/${id}`),

  create: (payload: CreateSopRequestDto) =>
    apiClient.post<Sop>('/sop', payload),

  update: (id: string, payload: UpdateSopJudulDto) =>
    apiClient.patch<Sop>(`/sop/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete(`/sop/${id}`),

  // ================= DetailSOP =================

  findDetailAll: (params?: DetailSopListQueryParams) => {
    const query = buildQueryString(params as Record<string, unknown> | undefined)
    return apiClient.get<SopDetail[]>(`/detail-sop${query}`)
  },

  findDetailById: (id: string) =>
    apiClient.get<SopDetail>(`/detail-sop/${id}`),

  updateMetadata: (id: string, payload: UpdateMetadataDto) =>
    apiClient.patch<SopDetail>(`/detail-sop/${id}/metadata`, payload),

  updateStatus: (id: string, payload: UpdateStatusDto) =>
    apiClient.patch<SopDetail>(`/detail-sop/${id}/status`, payload),

  cabut: (id: string) =>
    apiClient.patch<SopDetail>(`/detail-sop/${id}/cabut`, {}),

  // ================= LangkahSOP =================

  findLangkah: (sopDetailId: string) =>
    apiClient.get<LangkahSOP[]>(`/detail-sop/${sopDetailId}/langkah`),

  createLangkah: (sopDetailId: string, payload: CreateLangkahSOPDto) =>
    apiClient.post<LangkahSOP>(`/detail-sop/${sopDetailId}/langkah`, payload),

  updateLangkah: (sopDetailId: string, id: string, payload: UpdateLangkahSOPDto) =>
    apiClient.patch<LangkahSOP>(`/detail-sop/${sopDetailId}/langkah/${id}`, payload),

  deleteLangkah: (sopDetailId: string, id: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/langkah/${id}`),

  // ================= Pelaksana =================

  findPelaksana: (opdId: string) =>
    apiClient.get<Pelaksana[]>(`/pelaksana?opdId=${opdId}`),

  createPelaksana: (payload: CreatePelaksanaDto) =>
    apiClient.post<Pelaksana>('/pelaksana', payload),

  updatePelaksana: (id: string, namaPelaksana: string) =>
    apiClient.patch<Pelaksana>(`/pelaksana/${id}`, { namaPelaksana }),

  deletePelaksana: (id: string) =>
    apiClient.delete(`/pelaksana/${id}`),

  // ================= Swimlane =================

  getSwimlane: (sopDetailId: string) =>
    apiClient.get<DetailSOPPelaksana[]>(`/pelaksana/${sopDetailId}/swimlane`),

  addSwimlane: (sopDetailId: string, payload: CreateDetailSOPPelaksanaDto) =>
    apiClient.post<DetailSOPPelaksana>(`/pelaksana/${sopDetailId}/swimlane`, payload),

  removeSwimlane: (sopDetailId: string, pelaksanaId: string) =>
    apiClient.delete(`/pelaksana/${sopDetailId}/swimlane/${pelaksanaId}`),

  // ================= Lampiran =================

  findLampiran: (sopDetailId: string, jenis?: string) => {
    const query = jenis ? `?jenis=${jenis}` : ''
    return apiClient.get<LampiranTeks[]>(`/detail-sop/${sopDetailId}/lampiran${query}`)
  },

  createLampiran: (sopDetailId: string, payload: CreateLampiranTeksDto) =>
    apiClient.post<LampiranTeks>(`/detail-sop/${sopDetailId}/lampiran`, payload),

  updateLampiran: (sopDetailId: string, lampiranId: string, teks: string) =>
    apiClient.patch<LampiranTeks>(`/detail-sop/${sopDetailId}/lampiran/${lampiranId}`, { teks }),

  deleteLampiran: (sopDetailId: string, lampiranId: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/lampiran/${lampiranId}`),

  // ================= Dasar Hukum =================

  getDasarHukum: (sopDetailId: string) =>
    apiClient.get<DasarHukum[]>(`/detail-sop/${sopDetailId}/dasar-hukum`),

  addDasarHukum: (sopDetailId: string, payload: CreateDasarHukumDto) =>
    apiClient.post<DasarHukum>(`/detail-sop/${sopDetailId}/dasar-hukum`, payload),

  removeDasarHukum: (sopDetailId: string, peraturanId: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/dasar-hukum/${peraturanId}`),

  // ================= SOP Terkait =================

  getSopTerkait: (sopDetailId: string) =>
    apiClient.get<SopTerkait[]>(`/detail-sop/${sopDetailId}/sop-terkait`),

  addSopTerkait: (sopDetailId: string, payload: CreateSopTerkaitDto) =>
    apiClient.post<SopTerkait>(`/detail-sop/${sopDetailId}/sop-terkait`, payload),

  removeSopTerkait: (sopDetailId: string, sopTerkaitDetailId: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/sop-terkait/${sopTerkaitDetailId}`),

  // ================= Edit History =================

  getEditHistory: (sopDetailId: string) =>
    apiClient.get<LogEditSOP[]>(`/audit/detail-sop/${sopDetailId}`),
}

/**
 * useSop hook - TanStack Query
 */

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

function sopListQueryOptions(params?: SopListQueryParams) {
  return {
    queryKey: queryKeys.sopList(params),
    queryFn: () => sopApi.findAll(params),
    staleTime: STALE_TIME.MEDIUM,
  } as const;
}

export function useSop(params?: SopListQueryParams) {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    ...sopListQueryOptions(params),
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateSopRequestDto) => sopApi.create(payload),
    invalidateKeys: [queryKeys.sop],
    successMessage: "SOP berhasil dibuat",
    errorMessagePrefix: "Gagal membuat SOP",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, judul }: UpdateSopMutationDto) =>
      sopApi.update(id, { judul }),
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

export function useSopSuspense(params?: SopListQueryParams) {
  const { data: list } = useSuspenseQuery({
    ...sopListQueryOptions(params),
  });
  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateSopRequestDto) => sopApi.create(payload),
    invalidateKeys: [queryKeys.sop],
    successMessage: "SOP berhasil dibuat",
    errorMessagePrefix: "Gagal membuat SOP",
  });
  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, judul }: UpdateSopMutationDto) =>
      sopApi.update(id, { judul }),
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
    isLoading: false,
    error: undefined,
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

/**
 * useSopStatus hook - TanStack Query
 * Replaces localStorage-based status simulation with real API calls
 */

/**
 * Hook to update SOP status via real API
 * Replaces previous localStorage-based simulation
 */
export function useSopStatus() {
  const updateStatusMutation = useMutationWithToast({
    mutationFn: ({ sopId, status }: SetSopStatusOverrideMutationDto) =>
      sopApi.updateStatus(sopId, { status }),
    invalidateKeys: [queryKeys.detailSop, queryKeys.sop],
    successMessage: "Status SOP berhasil diubah",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal mengubah status SOP",
  });

  return {
    /**
     * Update SOP status via API
     * @param sopId - SOP Detail ID
     * @param status - New status (StatusSOP)
     */
    setSopStatusOverride: (sopId: string, status: SetSopStatusOverrideMutationDto["status"]) => {
      updateStatusMutation.mutate({ sopId, status });
    },

    /**
     * Cabut SOP via endpoint khusus (status DICABUT)
     * @param sopId - SOP Detail ID
     */
    cabutSopAsync: (sopId: string) => {
      return updateStatusMutation.mutateAsync({ sopId, status: 'DICABUT' });
    },

    /**
     * Update SOP status via API (async)
     * @param sopId - SOP Detail ID
     * @param status - New status (StatusSOP)
     */
    setSopStatusOverrideAsync: updateStatusMutation.mutateAsync,

    /**
     * Check if status update is in progress
     */
    isUpdating: updateStatusMutation.isPending,

    /**
     * Error from last status update attempt
     */
    error: updateStatusMutation.error,
  };
}

/**
 * usePelaksana Hook - TanStack Query Implementation
 */

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
    mutationFn: (data: CreatePelaksanaMutationDto) => {
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
    mutationFn: ({ id, namaPelaksana }: UpdatePelaksanaMutationDto) =>
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

export function useDetailSopList(params?: DetailSopListQueryParams) {
  return useQuery({
    queryKey: queryKeys.detailSopList(params),
    queryFn: () => sopApi.findDetailAll(params),
    staleTime: STALE_TIME.SHORT,
  });
}

export function useDetailSopById(id: string) {
  return useQuery({
    queryKey: queryKeys.detailSopById(id),
    queryFn: () => sopApi.findDetailById(id),
    enabled: !!id,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useUpdateMetadata() {
  return useMutationWithToast({
    mutationFn: ({ id, payload }: UpdateMetadataMutationDto) =>
      sopApi.updateMetadata(id, payload),
    invalidateKeys: [queryKeys.detailSop],
    successMessage: "Metadata SOP berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui metadata",
  });
}

export function useUpdateStatus() {
  return useMutationWithToast({
    mutationFn: ({ id, payload }: UpdateStatusMutationDto) =>
      sopApi.updateStatus(id, payload),
    invalidateKeys: [queryKeys.detailSop, queryKeys.sop],
    successMessage: "Status SOP berhasil diubah",
    errorMessagePrefix: "Gagal mengubah status",
  });
}

export function useLangkahSop(sopDetailId: string) {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.langkahSopByDetail(sopDetailId),
    queryFn: () => sopApi.findLangkah(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateLangkahSOPDto) =>
      sopApi.createLangkah(sopDetailId, payload),
    invalidateKeys: [queryKeys.langkahSopByDetail(sopDetailId)],
    successMessage: "Langkah berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambah langkah",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, payload }: UpdateLangkahMutationDto) =>
      sopApi.updateLangkah(sopDetailId, id, payload),
    invalidateKeys: [queryKeys.langkahSopByDetail(sopDetailId)],
    successMessage: "Langkah berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui langkah",
  });

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: string) => sopApi.deleteLangkah(sopDetailId, id),
    invalidateKeys: [queryKeys.langkahSopByDetail(sopDetailId)],
    successMessage: "Langkah berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus langkah",
  });

  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  };
}

export function useSwimlane(sopDetailId: string) {
  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.swimlane(sopDetailId),
    queryFn: () => sopApi.getSwimlane(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const addMutation = useMutationWithToast({
    mutationFn: (payload: CreateDetailSOPPelaksanaDto) =>
      sopApi.addSwimlane(sopDetailId, payload),
    invalidateKeys: [queryKeys.swimlane(sopDetailId)],
    successMessage: "Pelaksana berhasil ditambahkan ke swimlane",
    errorMessagePrefix: "Gagal menambah pelaksana ke swimlane",
  });

  const removeMutation = useMutationWithToast({
    mutationFn: (pelaksanaId: string) =>
      sopApi.removeSwimlane(sopDetailId, pelaksanaId),
    invalidateKeys: [queryKeys.swimlane(sopDetailId)],
    successMessage: "Pelaksana berhasil dihapus dari swimlane",
    errorMessagePrefix: "Gagal menghapus pelaksana dari swimlane",
  });

  return {
    list,
    isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}

export function useLampiran(sopDetailId: string, jenis?: string) {
  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.lampiran(sopDetailId),
    queryFn: () => sopApi.findLampiran(sopDetailId, jenis),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateLampiranTeksDto) =>
      sopApi.createLampiran(sopDetailId, payload),
    invalidateKeys: [queryKeys.lampiran(sopDetailId)],
    successMessage: "Lampiran berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambah lampiran",
  });

  const updateMutation = useMutationWithToast({
    mutationFn: ({ lampiranId, teks }: UpdateLampiranMutationDto) =>
      sopApi.updateLampiran(sopDetailId, lampiranId, teks),
    invalidateKeys: [queryKeys.lampiran(sopDetailId)],
    successMessage: "Lampiran berhasil diperbarui",
    errorMessagePrefix: "Gagal memperbarui lampiran",
  });

  const deleteMutation = useMutationWithToast({
    mutationFn: (lampiranId: string) =>
      sopApi.deleteLampiran(sopDetailId, lampiranId),
    invalidateKeys: [queryKeys.lampiran(sopDetailId)],
    successMessage: "Lampiran berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus lampiran",
  });

  return {
    list,
    isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
  };
}

export function useDasarHukum(sopDetailId: string) {
  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.dasarHukum(sopDetailId),
    queryFn: () => sopApi.getDasarHukum(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const addMutation = useMutationWithToast({
    mutationFn: (payload: CreateDasarHukumDto) =>
      sopApi.addDasarHukum(sopDetailId, payload),
    invalidateKeys: [queryKeys.dasarHukum(sopDetailId)],
    successMessage: "Dasar hukum berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambah dasar hukum",
  });

  const removeMutation = useMutationWithToast({
    mutationFn: (peraturanId: string) =>
      sopApi.removeDasarHukum(sopDetailId, peraturanId),
    invalidateKeys: [queryKeys.dasarHukum(sopDetailId)],
    successMessage: "Dasar hukum berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus dasar hukum",
  });

  return {
    list,
    isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}

export function useSopTerkait(sopDetailId: string) {
  const { data: list = [], isLoading } = useQuery({
    queryKey: queryKeys.sopTerkait(sopDetailId),
    queryFn: () => sopApi.getSopTerkait(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });

  const addMutation = useMutationWithToast({
    mutationFn: (payload: CreateSopTerkaitDto) =>
      sopApi.addSopTerkait(sopDetailId, payload),
    invalidateKeys: [queryKeys.sopTerkait(sopDetailId)],
    successMessage: "SOP terkait berhasil ditambahkan",
    errorMessagePrefix: "Gagal menambah SOP terkait",
  });

  const removeMutation = useMutationWithToast({
    mutationFn: (terkaitId: string) =>
      sopApi.removeSopTerkait(sopDetailId, terkaitId),
    invalidateKeys: [queryKeys.sopTerkait(sopDetailId)],
    successMessage: "SOP terkait berhasil dihapus",
    errorMessagePrefix: "Gagal menghapus SOP terkait",
  });

  return {
    list,
    isLoading,
    add: addMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
  };
}

export function useEditHistory(sopDetailId: string) {
  return useQuery({
    queryKey: queryKeys.detailSopLogs(sopDetailId),
    queryFn: () => sopApi.getEditHistory(sopDetailId),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });
}

interface UseDetailSopPenyusunActionsParams {
  metadata: SOPDetailMetadata;
  prosedurRows: ProsedurRow[];
  langkahList: Array<{ id: string }>;
  createLangkah: (payload: CreateLangkahSOPDto) => Promise<unknown>;
  updateLangkah: (args: {
    id: string;
    payload: UpdateLangkahSOPDto;
  }) => Promise<unknown>;
  updateMetadataMutation: {
    mutateAsync: (args: UpdateMetadataMutationDto) => Promise<unknown>;
  };
  setSopStatusOverrideAsync: (payload: {
    sopId: string;
    status: UpdateStatusDto["status"];
  }) => Promise<unknown>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  isRevisionFlow: boolean;
}

export function useDetailSopPenyusunActions({
  metadata,
  prosedurRows,
  langkahList,
  createLangkah,
  updateLangkah,
  updateMetadataMutation,
  setSopStatusOverrideAsync,
  showToast,
  isRevisionFlow,
}: UseDetailSopPenyusunActionsParams) {
  const persistAllChanges = useCallback(
    async (sopDetailId: string) => {
      await updateMetadataMutation.mutateAsync({
        id: sopDetailId,
        payload: {
          logoInstansi: metadata.logoUrl,
          namaLembaga: metadata.lembaga,
          tanggalEfektif: metadata.tanggalEfektif || undefined,
          tanggalRevisi: metadata.tanggalRevisi || undefined,
        } satisfies UpdateMetadataDto,
      });

      const existingIds = new Set(langkahList?.map((item) => item.id) ?? []);
      const currentIds = new Set(prosedurRows.map((row) => row.id).filter((id) => !isTempId(id)));

      for (const row of prosedurRows) {
        if (isTempId(row.id)) {
          const dto = transformProsedurRowToCreateLangkah(row, sopDetailId);
          if (dto.kegiatan && dto.pelaksanaId) {
            await createLangkah(dto);
          }
        }
      }

      for (const row of prosedurRows) {
        if (!isTempId(row.id) && existingIds.has(row.id)) {
          const dto = transformProsedurRowToUpdateLangkah(row);
          await updateLangkah({ id: row.id, payload: dto });
        }
      }

      for (const existingId of existingIds) {
        if (!currentIds.has(existingId)) {
          await sopApi.deleteLangkah(sopDetailId, existingId);
        }
      }
    },
    [
      createLangkah,
      langkahList,
      metadata.lembaga,
      metadata.logoUrl,
      metadata.tanggalEfektif,
      metadata.tanggalRevisi,
      prosedurRows,
      updateLangkah,
      updateMetadataMutation,
    ],
  );

  const handleSaveDraft = useCallback(
    async (id: string | undefined, role: string | null) => {
      if (!id || !role) {
        showToast("ID SOP tidak tersedia", "error");
        return;
      }

      try {
        await persistAllChanges(id);
        await setSopStatusOverrideAsync({ sopId: id, status: "SEDANG_DISUSUN" });
        showToast("Draft berhasil disimpan, status diubah menjadi Sedang Disusun");
      } catch {
        showToast("Gagal menyimpan draft. Periksa data yang diisi.", "error");
      }
    },
    [persistAllChanges, setSopStatusOverrideAsync, showToast],
  );

  const handleComplete = useCallback(
    async (
      id: string | undefined,
      role: string | null,
      navigateFn?: (opts: NavigateOptions) => void,
    ) => {
      if (!id || !role) {
        showToast("ID SOP tidak tersedia", "error");
        return;
      }

      try {
        await persistAllChanges(id);
        await setSopStatusOverrideAsync({ sopId: id, status: "SIAP_DIEVALUASI" });
        showToast(
          isRevisionFlow
            ? "Revisi selesai. Kembali ke Manajemen SOP untuk kirim ulang ke evaluasi."
            : "SOP berhasil disimpan dan siap diajukan ke evaluasi.",
        );
        if (navigateFn) {
          navigateFn({ to: ROUTES.TIM_PENYUSUN.SOP });
        }
      } catch {
        showToast("Gagal menyelesaikan SOP. Periksa data yang diisi.", "error");
      }
    },
    [isRevisionFlow, persistAllChanges, setSopStatusOverrideAsync, showToast],
  );

  return {
    handleSaveDraft,
    handleComplete,
  };
}

export interface KomentarDisplayItem {
  id: string;
  userName: string;
  role: string | undefined;
  text: string;
  timestamp: string;
}

export interface UseDetailSopPenyusunDataResult {
  metadata: SOPDetailMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<SOPDetailMetadata>>;
  prosedurRows: ProsedurRow[];
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>;
  implementers: { id: string; name: string }[];
  setImplementers: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
  auditLogs: LogEditSOP[];
  diagramVersion: number;
  setDiagramVersion: React.Dispatch<React.SetStateAction<number>>;
  activeTab: "flowchart" | "bpmn";
  setActiveTab: React.Dispatch<React.SetStateAction<"flowchart" | "bpmn">>;
  isEditingSteps: boolean;
  setIsEditingSteps: React.Dispatch<React.SetStateAction<boolean>>;
  isEditPanelCollapsed: boolean;
  setIsEditPanelCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  rightPanelTab: "edit" | "komentar" | "aktivitas";
  setRightPanelTab: React.Dispatch<React.SetStateAction<"edit" | "komentar" | "aktivitas">>;
  komentarDisplay: KomentarDisplayItem[];
  isLoading: boolean;
  masterPelaksanaOptions: { id: string; name: string }[];
  peraturanList: Peraturan[];
  currentSopStatus: StatusSOP;
  isRevisionFlow: boolean;
  primaryActionLabel: string;
  langkahList: Array<{ id: string }>;
  createLangkah: (payload: import("@/types/dto/sop.dto").CreateLangkahSOPDto) => Promise<unknown>;
  updateLangkah: (args: {
    id: string;
    payload: import("@/types/dto/sop.dto").UpdateLangkahSOPDto;
  }) => Promise<unknown>;
  updateMetadataMutation: ReturnType<typeof useUpdateMetadata>;
  setSopStatusOverrideAsync: ReturnType<typeof useSopStatus>["setSopStatusOverrideAsync"];
}

export function useDetailSopPenyusunData(
  sopDetailId: string | undefined,
  sopStatusOverride: StatusSOP | undefined,
): UseDetailSopPenyusunDataResult {
  const { setSopStatusOverrideAsync } = useSopStatus();
  const { list: peraturanList } = usePeraturan();
  const { list: pelaksanaList } = usePelaksana();
  const { data: sopDetail, isLoading: isLoadingDetail } = useDetailSopById(sopDetailId ?? "");
  const {
    list: langkahList,
    isLoading: isLoadingLangkah,
    create: createLangkah,
    update: updateLangkah,
  } = useLangkahSop(sopDetailId ?? "");
  const { data: auditLogs = [] } = useEditHistory(sopDetailId ?? "");
  const updateMetadataMutation = useUpdateMetadata();

  const [metadata, setMetadata] = useState<SOPDetailMetadata>({});
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>([]);
  const [implementers, setImplementers] = useState<{ id: string; name: string }[]>([]);
  const [diagramVersion, setDiagramVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<"flowchart" | "bpmn">("flowchart");
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [isEditPanelCollapsed, setIsEditPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"edit" | "komentar" | "aktivitas">("edit");

  useEffect(() => {
    if (sopDetail) {
      setMetadata(transformSopDetailToMetadata(sopDetail));
    }
    if (langkahList && langkahList.length > 0) {
      const rows = langkahList.sort((a, b) => a.urutan - b.urutan).map(transformLangkahToProsedurRow);
      setProsedurRows(rows);
      const implementerIds = new Set(rows.map((row) => row.pelaksana).filter(Boolean));
      const mappedImplementers = Array.from(implementerIds).map((id) => {
        const pelaksana = pelaksanaList.find((item) => item.id === id);
        return { id, name: pelaksana?.namaPelaksana ?? id };
      });
      setImplementers(mappedImplementers);
    } else if (langkahList && langkahList.length === 0) {
      setProsedurRows([]);
    }
  }, [sopDetail, langkahList, pelaksanaList]);

  const komentarDisplay = useMemo(
    () =>
      auditLogs.map((log) => ({
        id: log.id,
        userName: log.userId ?? "Tidak diketahui",
        role: log.aktorRole ?? log.bagian,
        text: log.keterangan ?? "Tidak ada keterangan",
        timestamp: log.createdAt,
      })),
    [auditLogs],
  );

  const masterPelaksanaOptions = useMemo(
    () =>
      pelaksanaList.map((pelaksana) => ({
        id: pelaksana.id,
        name: pelaksana.namaPelaksana,
      })),
    [pelaksanaList],
  );

  const currentSopStatus: StatusSOP = (sopStatusOverride ?? DEFAULT_SOP_STATUS) as StatusSOP;
  const isRevisionFlow = currentSopStatus === "REVISI_DARI_TIM_EVALUASI";
  const primaryActionLabel = isRevisionFlow ? "Selesaikan revisi" : "Selesai";
  const isLoading = isLoadingDetail || isLoadingLangkah;

  return {
    metadata,
    setMetadata,
    prosedurRows,
    setProsedurRows,
    implementers,
    setImplementers,
    auditLogs,
    diagramVersion,
    setDiagramVersion,
    activeTab,
    setActiveTab,
    isEditingSteps,
    setIsEditingSteps,
    isEditPanelCollapsed,
    setIsEditPanelCollapsed,
    rightPanelTab,
    setRightPanelTab,
    komentarDisplay,
    isLoading,
    masterPelaksanaOptions,
    peraturanList,
    currentSopStatus,
    isRevisionFlow,
    primaryActionLabel,
    langkahList,
    createLangkah,
    updateLangkah,
    updateMetadataMutation,
    setSopStatusOverrideAsync,
  };
}

/**
 * Pure mutation hook for requesting evaluation.
 * UI state (dialog, selection) should be managed by the consuming component.
 */

export function useSubmitEvaluasiRequest() {
  return useMutationWithToast({
    mutationFn: async (sopIds: string[]) => {
      // Use Promise.allSettled to prevent partial state corruption
      const results = await Promise.allSettled(
        sopIds.map((sopId) =>
          sopApi.updateStatus(sopId, { status: "DIAJUKAN_EVALUASI" }),
        ),
      );

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        const failedCount = failed.length;
        const successCount = sopIds.length - failedCount;
        throw new Error(
          `${failedCount} SOP gagal diajukan (${successCount} berhasil). Periksa koneksi dan coba lagi.`,
        );
      }

      return results;
    },
    invalidateKeys: [queryKeys.sop],
    successMessage: "SOP berhasil diajukan ke evaluasi",
    errorMessagePrefix: "Gagal mengajukan SOP",
  });
}

export interface UseDetailSopPenyusunReturn {
  metadata: SOPDetailMetadata;
  prosedurRows: ProsedurRow[];
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>;
  implementers: { id: string; name: string }[];
  setImplementers: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
  auditLogs: LogEditSOP[];
  diagramVersion: number;
  setDiagramVersion: React.Dispatch<React.SetStateAction<number>>;
  activeTab: "flowchart" | "bpmn";
  setActiveTab: React.Dispatch<React.SetStateAction<"flowchart" | "bpmn">>;
  isEditingSteps: boolean;
  setIsEditingSteps: React.Dispatch<React.SetStateAction<boolean>>;
  isEditPanelCollapsed: boolean;
  setIsEditPanelCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  rightPanelTab: "edit" | "komentar" | "aktivitas";
  setRightPanelTab: React.Dispatch<React.SetStateAction<"edit" | "komentar" | "aktivitas">>;
  komentarDisplay: KomentarDisplayItem[];
  isLoading: boolean;
  masterPelaksanaOptions: { id: string; name: string }[];
  peraturanList: Peraturan[];
  currentSopStatus: StatusSOP;
  isRevisionFlow: boolean;
  primaryActionLabel: string;
  handleMetadataChange: <K extends keyof SOPDetailMetadata>(
    field: K,
    value: SOPDetailMetadata[K],
  ) => void;
  handleSaveDraft: (id: string | undefined, role: string | null) => Promise<void>;
  handleComplete: (
    id: string | undefined,
    role: string | null,
    navigate: (opts: NavigateOptions) => void,
  ) => Promise<void>;
}

export function useDetailSopPenyusun(
  sopDetailId: string | undefined,
  sopStatusOverride: StatusSOP | undefined,
  _isRevisionFlowOverride?: boolean,
): UseDetailSopPenyusunReturn {
  const { showToast } = useToast();
  const data = useDetailSopPenyusunData(sopDetailId, sopStatusOverride);

  const { handleSaveDraft, handleComplete } = useDetailSopPenyusunActions({
    metadata: data.metadata,
    prosedurRows: data.prosedurRows,
    langkahList: data.langkahList,
    createLangkah: data.createLangkah,
    updateLangkah: data.updateLangkah,
    updateMetadataMutation: data.updateMetadataMutation,
    setSopStatusOverrideAsync: data.setSopStatusOverrideAsync,
    showToast,
    isRevisionFlow: data.isRevisionFlow,
  });

  const handleMetadataChange = useCallback(
    <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => {
      data.setMetadata((prev) => ({ ...prev, [field]: value }));
    },
    [data.setMetadata],
  );

  return {
    metadata: data.metadata,
    prosedurRows: data.prosedurRows,
    setProsedurRows: data.setProsedurRows,
    implementers: data.implementers,
    setImplementers: data.setImplementers,
    auditLogs: data.auditLogs,
    diagramVersion: data.diagramVersion,
    setDiagramVersion: data.setDiagramVersion,
    activeTab: data.activeTab,
    setActiveTab: data.setActiveTab,
    isEditingSteps: data.isEditingSteps,
    setIsEditingSteps: data.setIsEditingSteps,
    isEditPanelCollapsed: data.isEditPanelCollapsed,
    setIsEditPanelCollapsed: data.setIsEditPanelCollapsed,
    rightPanelTab: data.rightPanelTab,
    setRightPanelTab: data.setRightPanelTab,
    komentarDisplay: data.komentarDisplay,
    isLoading: data.isLoading,
    masterPelaksanaOptions: data.masterPelaksanaOptions,
    peraturanList: data.peraturanList,
    currentSopStatus: data.currentSopStatus,
    isRevisionFlow: data.isRevisionFlow,
    primaryActionLabel: data.primaryActionLabel,
    handleMetadataChange,
    handleSaveDraft,
    handleComplete,
  };
}


export interface UseDaftarSopDataParams {
  searchQuery: string;
  filterStatus: string | null;
  filterPeraturan: string | null;
  filterTanggalDari: string | null;
  filterTanggalSampai: string | null;
  isFilterOpen: boolean;
}

export function useDaftarSopData(params: UseDaftarSopDataParams) {
  const { list = [] } = useSopSuspense();
  const filteredList = list.filter((sop) => {
    const q = params.searchQuery.trim().toLowerCase();
    const matchesSearch = !q || sop.judul.toLowerCase().includes(q) || (sop.nomorSOP ?? "").toLowerCase().includes(q);
    const matchesStatus = !params.filterStatus || params.filterStatus === "all" || sop.status === params.filterStatus;
    const matchesPeraturan = !params.filterPeraturan || params.filterPeraturan === "all" || sop.peraturanId === params.filterPeraturan;
    const updated = sop.terakhirDiperbarui ?? sop.updatedAt;
    const matchesDateFrom = !params.filterTanggalDari || !updated || updated >= params.filterTanggalDari;
    const matchesDateTo = !params.filterTanggalSampai || !updated || updated <= params.filterTanggalSampai;
    return matchesSearch && matchesStatus && matchesPeraturan && matchesDateFrom && matchesDateTo;
  });
  const eligibleSopsForEvaluasi = list.filter((sop) => sop.status === "SIAP_DIEVALUASI");
  return { filteredList, eligibleSopsForEvaluasi };
}

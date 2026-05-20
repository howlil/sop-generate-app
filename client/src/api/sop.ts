import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NavigateOptions } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
import { buildSopHeaderSnapshot, useSopHeaderAutosave, type SopHeaderAutosaveStatus } from "@/hooks/useSopHeaderAutosave";
import { buildSopProsedurSnapshot, useSopProsedurAutosave, type SopProsedurAutosaveStatus } from "@/hooks/useSopProsedurAutosave";
import { STALE_TIME, ROUTES } from "@/utils/constants";
import { apiClient, buildQueryString } from '@/lib/api/api-client'
import { unwrapApiData } from '@/lib/api/response'
import {
  canEditSop,
  canKirimUlangKeEvaluatorAfterRevisi,
  getKirimUlangRoleBlockingReason,
} from '@/lib/sop/sop-permissions'
import { useAppRole } from '@/hooks/useAppRole'
import { usePeraturan } from "@/api/peraturan";
import { transformLangkahToProsedurRow, transformSopDetailToMetadata } from "@/lib/sop/detailSop.mappers";
import { DEFAULT_SOP_STATUS } from "@/types/dto/sop.dto";
import type {
  Pelaksana,
  SopDaftarRow,
  StatusSOP,
} from '@/types/dto/sop.dto'
import type { Peraturan } from "@/types/dto/peraturan.dto";
import type {
  CreatePelaksanaDto,
  CreateSopRequestDto,
  SopListQueryParams,
  SopRiwayatVersiRow,
  SetSopStatusOverrideMutationDto,
  CreatePelaksanaMutationDto,
  UpdatePelaksanaMutationDto,
  UpdateStatusDto,
  UpdateSopHeaderDto,
  UpdateSopProsedurDto,
  PenyusunWorkbenchData,
  PenyusunWorkbenchLogEdit,
  PenyusunWorkbenchQueryParams,
} from '@/types/dto/sop.dto'
import type { ApiSuccessResponse } from '@/types/dto/auth.dto'
import type { ProsedurRow, SOPDetailMetadata } from "@/types/ui/sop";

export {
  canBuatVersiBaru,
  canEditSop,
  canHapusVersiDraft,
  canKepalaOpdSignSop,
  canPjPenyusunRunCoordinatorActions,
  isSopEligibleForSigning,
} from '@/lib/sop/sop-permissions'

/** Master pelaksana (`GET/POST/PATCH/DELETE /pelaksana`) memakai bungkus API Nest. */
async function unwrapPelaksanaMaster<T>(promise: Promise<ApiSuccessResponse<T>>): Promise<T> {
  return unwrapApiData(promise)
}

/** Daftar SOP (`GET /sop`) memakai bungkus ApiSuccessResponse. */
async function unwrapSopListEnvelope(
  promise: Promise<ApiSuccessResponse<SopDaftarRow[]>>,
): Promise<SopDaftarRow[]> {
  return unwrapApiData(promise)
}

async function unwrapSopCreateEnvelope(
  promise: Promise<ApiSuccessResponse<SopDaftarRow>>,
): Promise<SopDaftarRow> {
  return unwrapApiData(promise)
}

async function unwrapPenyusunWorkbench(
  promise: Promise<ApiSuccessResponse<PenyusunWorkbenchData>>,
): Promise<PenyusunWorkbenchData> {
  return unwrapApiData(promise)
}

export const sopApi = {
  // ================= SOP (Header) =================

  findAll: (params?: SopListQueryParams) => {
    const query = buildQueryString(params as Record<string, unknown> | undefined)
    return unwrapSopListEnvelope(
      apiClient.get<ApiSuccessResponse<SopDaftarRow[]>>(`/sop${query}`),
    )
  },

  create: (payload: CreateSopRequestDto) =>
    unwrapSopCreateEnvelope(
      apiClient.post<ApiSuccessResponse<SopDaftarRow>>('/sop', payload),
    ),

  getPenyusunWorkbench: (detailSopId: string, params?: PenyusunWorkbenchQueryParams) => {
    const query = buildQueryString(params as Record<string, unknown> | undefined)
    return unwrapPenyusunWorkbench(
      apiClient.get<ApiSuccessResponse<PenyusunWorkbenchData>>(
        `/sop/penyusun-workbench/${detailSopId}${query}`,
      ),
    )
  },

  /**
   * PATCH header SOP penyusun (`/sop/header/:detailSopId`). Param boleh detailSopId atau sopId.
   * Mengembalikan workbench terbaru sehingga klien bisa `setQueryData` tanpa GET ulang.
   */
  updateSopHeader: (detailSopId: string, payload: UpdateSopHeaderDto) =>
    unwrapPenyusunWorkbench(
      apiClient.patch<ApiSuccessResponse<PenyusunWorkbenchData>>(
        `/sop/header/${detailSopId}`,
        payload,
      ),
    ),

  /**
   * PATCH prosedur SOP penyusun (`/sop/langkah/:detailSopId`). Replace-all per section
   * (pelaksana/langkah) yang dikirim. Mengembalikan workbench terbaru, sejajar header.
   */
  updateSopProsedur: (detailSopId: string, payload: UpdateSopProsedurDto) =>
    unwrapPenyusunWorkbench(
      apiClient.patch<ApiSuccessResponse<PenyusunWorkbenchData>>(
        `/sop/langkah/${detailSopId}`,
        payload,
      ),
    ),

  /**
   * PATCH status DetailSOP (`/sop/status/:id`). Param boleh detailSopId atau sopId header.
   * Mengembalikan workbench terbaru (transisi divalidasi di server).
   *
   * Pengajuan evaluasi ke Biro: gunakan `POST /evaluasi` (modul evaluation), bukan
   * PATCH `DIAJUKAN_EVALUASI` per baris dari UI penyusun.
   */
  updateStatus: (id: string, payload: UpdateStatusDto) =>
    unwrapPenyusunWorkbench(
      apiClient.patch<ApiSuccessResponse<PenyusunWorkbenchData>>(`/sop/status/${id}`, payload),
    ),

  /**
   * POST cabut versi BERLAKU (`/sop/cabut/:id`). Param boleh detailSopId atau sopId header.
   * Hanya Kepala OPD; ditolak bila masih ada revisi in-flight.
   */
  cabutSop: (id: string, params?: PenyusunWorkbenchQueryParams) => {
    const query = buildQueryString(params as Record<string, unknown> | undefined)
    return unwrapPenyusunWorkbench(
      apiClient.post<ApiSuccessResponse<PenyusunWorkbenchData>>(`/sop/cabut/${id}${query}`),
    )
  },

  /**
   * POST setelah revisi evaluator: transaksi server SIAP_DIEVALUASI → DIAJUKAN_EVALUASI.
   * Param boleh detailSopId atau sopId header (sama seperti workbench).
   */
  kirimUlangEvaluasiSetelahRevisi: (detailSopId: string, params?: PenyusunWorkbenchQueryParams) => {
    const query = buildQueryString(params as Record<string, unknown> | undefined)
    return unwrapPenyusunWorkbench(
      apiClient.post<ApiSuccessResponse<PenyusunWorkbenchData>>(
        `/sop/penyusun-workbench/${detailSopId}/kirim-ulang-evaluasi${query}`,
      ),
    )
  },

  buatVersiBaru: (detailSopId: string, params?: PenyusunWorkbenchQueryParams) => {
    const query = buildQueryString(params as Record<string, unknown> | undefined)
    return unwrapPenyusunWorkbench(
      apiClient.post<ApiSuccessResponse<PenyusunWorkbenchData>>(
        `/sop/${detailSopId}/buat-versi-baru${query}`,
      ),
    )
  },

  getRiwayatVersi: (sopId: string) =>
    unwrapApiData(
      apiClient.get<ApiSuccessResponse<SopRiwayatVersiRow[]>>(`/sop/${sopId}/riwayat-versi`),
    ),

  hapusVersiDraft: (detailSopId: string) =>
    unwrapApiData(
      apiClient.delete<ApiSuccessResponse<null>>(`/sop/${detailSopId}/versi-draft`),
    ),

  // ================= Pelaksana (master per OPD) =================

  findPelaksana: (opdId: string) =>
    unwrapPelaksanaMaster(
      apiClient.get<ApiSuccessResponse<Pelaksana[]>>(`/pelaksana?opdId=${encodeURIComponent(opdId)}`),
    ),

  createPelaksana: (payload: CreatePelaksanaDto) =>
    unwrapPelaksanaMaster(apiClient.post<ApiSuccessResponse<Pelaksana>>('/pelaksana', payload)),

  updatePelaksana: (id: string, namaPelaksana: string) =>
    unwrapPelaksanaMaster(
      apiClient.patch<ApiSuccessResponse<Pelaksana>>(`/pelaksana/${id}`, { namaPelaksana }),
    ),

  deletePelaksana: (id: string) =>
    unwrapPelaksanaMaster(apiClient.delete<ApiSuccessResponse<null>>(`/pelaksana/${id}`)),

}

/**
 * useSop hook - TanStack Query
 */

/** Status yang mengizinkan penyuntingan dokumen (selaras BUSINESS-SPEC §5.2). */
function sopListQueryOptions(params?: SopListQueryParams) {
  return {
    queryKey: queryKeys.sopList(params),
    queryFn: () => sopApi.findAll(params),
    staleTime: STALE_TIME.MEDIUM,
  } as const;
}

/** Hanya data daftar SOP (Suspense); untuk kombinasi dengan filter terpisah tanpa duplikasi mutasi. */
export function useSopListSuspenseQuery(params?: SopListQueryParams) {
  return useSuspenseQuery<SopDaftarRow[]>({
    ...sopListQueryOptions(params),
  });
}

export function useSop(params?: SopListQueryParams) {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery<SopDaftarRow[]>({
    ...sopListQueryOptions(params),
  });

  return {
    list,
    isLoading,
    error,
  };
}

export function useSopSuspense(params?: SopListQueryParams) {
  const { data: list } = useSuspenseQuery<SopDaftarRow[]>({
    ...sopListQueryOptions(params),
  });
  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreateSopRequestDto) => sopApi.create(payload),
    invalidateKeys: [queryKeys.sop],
    successMessage: "SOP berhasil dibuat",
    errorMessagePrefix: "Gagal membuat SOP",
  });
  return {
    list,
    isLoading: false,
    error: undefined,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
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
  const queryClient = useQueryClient();
  const updateStatusMutation = useMutationWithToast({
    mutationFn: ({ sopId, status }: SetSopStatusOverrideMutationDto) =>
      sopApi.updateStatus(sopId, { status }),
    invalidateKeys: [queryKeys.detailSop, queryKeys.sop],
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.penyusunWorkbench(variables.sopId), data);
      if (data.detail.id !== variables.sopId) {
        queryClient.setQueryData(queryKeys.penyusunWorkbench(data.detail.id), data);
      }
    },
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
     * @param sopId - SOP Detail ID atau sopId header
     * @deprecated Prefer `useCabutSop().cabutSopAsync`
     */
    cabutSopAsync: (sopId: string) => {
      return sopApi.cabutSop(sopId);
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
 * Hook untuk mencabut SOP BERLAKU (Kepala OPD).
 */
export function useCabutSop() {
  const queryClient = useQueryClient();
  const mutation = useMutationWithToast({
    mutationFn: (sopOrDetailId: string) => sopApi.cabutSop(sopOrDetailId),
    invalidateKeys: [queryKeys.detailSop, queryKeys.sop],
    onSuccess: (data, sopOrDetailId) => {
      queryClient.setQueryData(queryKeys.penyusunWorkbench(sopOrDetailId), data);
      queryClient.setQueryData(queryKeys.penyusunWorkbench(data.detail.id), data);
    },
    successMessage: 'SOP berhasil dicabut',
    useDetailedErrors: true,
    errorMessagePrefix: 'Gagal mencabut SOP',
  });
  return {
    cabutSop: mutation.mutate,
    cabutSopAsync: mutation.mutateAsync,
    isCabutPending: mutation.isPending,
    error: mutation.error,
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

/**
 * GET `/sop/penyusun-workbench/:detailSopId` — agregat detail + langkah + log
 * untuk dipakai di pratinjau SOP (header + langkah). Cache key sejajar dengan
 * mutasi header/prosedur/status di file ini sehingga refresh otomatis sinkron.
 */
export function usePenyusunWorkbench(detailSopId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.penyusunWorkbench(detailSopId ?? ''),
    queryFn: () => sopApi.getPenyusunWorkbench(detailSopId!),
    enabled: !!detailSopId,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useRiwayatVersi(sopId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sopRiwayatVersi(sopId ?? ''),
    queryFn: () => sopApi.getRiwayatVersi(sopId!),
    enabled: !!sopId,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useBuatVersiBaru() {
  const queryClient = useQueryClient();
  return useMutationWithToast({
    mutationFn: (detailSopId: string) => sopApi.buatVersiBaru(detailSopId),
    invalidateKeys: [queryKeys.sop],
    successMessage: 'Versi baru berhasil dibuat',
    useDetailedErrors: true,
    errorMessagePrefix: 'Gagal membuat versi baru',
    onSuccess: (data, detailSopId) => {
      queryClient.setQueryData(queryKeys.penyusunWorkbench(data.detail.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.sopRiwayatVersi(data.detail.sopId) });
      if (data.detail.id !== detailSopId) {
        queryClient.setQueryData(queryKeys.penyusunWorkbench(detailSopId), data);
      }
    },
  });
}

export function useHapusVersiDraft(sopId: string) {
  return useMutationWithToast({
    mutationFn: (detailSopId: string) => sopApi.hapusVersiDraft(detailSopId),
    invalidateKeys: [queryKeys.sop, queryKeys.sopRiwayatVersi(sopId)],
    successMessage: 'Versi draft dihapus',
    useDetailedErrors: true,
    errorMessagePrefix: 'Gagal menghapus versi draft',
  });
}

/**
 * Mutation autosave PATCH header SOP. Tidak memunculkan toast (silent autosave),
 * tidak meng-invalidate cache; sebagai gantinya `setQueryData` workbench dengan response
 * agar panel main + side panel tetap sinkron tanpa GET ulang.
 */
export function useUpdateSopHeader(detailSopId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSopHeaderDto) => sopApi.updateSopHeader(detailSopId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.penyusunWorkbench(detailSopId), data);
      if (data.detail.id !== detailSopId) {
        queryClient.setQueryData(queryKeys.penyusunWorkbench(data.detail.id), data);
      }
    },
  });
}

/**
 * Mutation autosave PATCH prosedur SOP (swimlane + langkah) — silent, sejajar dengan
 * `useUpdateSopHeader`. Response = workbench terbaru → `setQueryData` agar main panel
 * & side panel sinkron tanpa GET ulang.
 */
export function useUpdateSopProsedur(detailSopId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSopProsedurDto) => sopApi.updateSopProsedur(detailSopId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.penyusunWorkbench(detailSopId), data);
      if (data.detail.id !== detailSopId) {
        queryClient.setQueryData(queryKeys.penyusunWorkbench(data.detail.id), data);
      }
    },
  });
}

interface UseDetailSopPenyusunActionsParams {
  setSopStatusOverrideAsync: (payload: {
    sopId: string;
    status: UpdateStatusDto["status"];
  }) => Promise<unknown>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  isRevisionFlow: boolean;
  canKirimUlangKeEvaluator: boolean;
  /** Flush autosave header SOP sebelum aksi besar (selesai) agar tidak ada perubahan tertinggal. */
  flushHeaderAutosave: () => Promise<void>;
  /** Flush autosave prosedur (swimlane + langkah) sebelum aksi besar. */
  flushProsedurAutosave: () => Promise<void>;
}

/**
 * Aksi tingkat halaman editor: Selesai → SIAP_DIEVALUASI; alur revisi → POST kirim ulang ke evaluator.
 * Persistensi data (header, swimlane, langkah) seluruhnya ditangani oleh autosave.
 */
export function useDetailSopPenyusunActions({
  setSopStatusOverrideAsync,
  showToast,
  isRevisionFlow,
  canKirimUlangKeEvaluator,
  flushHeaderAutosave,
  flushProsedurAutosave,
}: UseDetailSopPenyusunActionsParams) {
  const queryClient = useQueryClient();
  const flushAll = useCallback(async () => {
    await Promise.all([flushHeaderAutosave(), flushProsedurAutosave()]);
  }, [flushHeaderAutosave, flushProsedurAutosave]);

  const kirimUlangKeEvaluatorMutation = useMutationWithToast({
    mutationFn: (sopOrDetailId: string) => sopApi.kirimUlangEvaluasiSetelahRevisi(sopOrDetailId),
    invalidateKeys: [
      queryKeys.sop,
      queryKeys.evaluasiWorkspaceOpdAll,
      queryKeys.evaluasiWorkspacePengajuanAll,
      queryKeys.evaluasiRingkasAll,
    ],
    successMessage: "SOP berhasil dikirim ulang ke evaluator",
    errorMessagePrefix: "Gagal mengirim ulang ke evaluator",
    onSuccess: (data, sopOrDetailId) => {
      queryClient.setQueryData(queryKeys.penyusunWorkbench(sopOrDetailId), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.evaluasiUmpanBalik(sopOrDetailId) });
      if (data.detail.id !== sopOrDetailId) {
        queryClient.setQueryData(queryKeys.penyusunWorkbench(data.detail.id), data);
        void queryClient.invalidateQueries({ queryKey: queryKeys.evaluasiUmpanBalik(data.detail.id) });
      }
    },
  });

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
        await flushAll();
      } catch {
        showToast(
          "Gagal menyimpan perubahan terlebih dahulu. Periksa data lalu coba lagi.",
          "error",
        );
        return;
      }
      try {
        if (isRevisionFlow) {
          if (!canKirimUlangKeEvaluator) {
            const roleBlock = getKirimUlangRoleBlockingReason(role);
            showToast(roleBlock ?? 'Anda tidak berhak mengirim ulang ke evaluator', 'error');
            return;
          }
          await kirimUlangKeEvaluatorMutation.mutateAsync(id);
        } else {
          await setSopStatusOverrideAsync({ sopId: id, status: "SIAP_DIEVALUASI" });
          showToast("SOP berhasil disimpan dan siap diajukan ke evaluasi.");
        }
        if (navigateFn) {
          navigateFn({ to: ROUTES.PENYUSUN.SOP });
        }
      } catch {
        if (!isRevisionFlow) {
          showToast("Gagal menyelesaikan SOP. Periksa data yang diisi.", "error");
        }
      }
    },
    [
      flushAll,
      isRevisionFlow,
      canKirimUlangKeEvaluator,
      kirimUlangKeEvaluatorMutation,
      setSopStatusOverrideAsync,
      showToast,
    ],
  );

  return {
    handleComplete,
    isKirimUlangPending: kirimUlangKeEvaluatorMutation.isPending,
  };
}

export interface UseDetailSopPenyusunDataResult {
  metadata: SOPDetailMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<SOPDetailMetadata>>;
  prosedurRows: ProsedurRow[];
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>;
  implementers: { id: string; name: string }[];
  setImplementers: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
  auditLogs: PenyusunWorkbenchLogEdit[];
  diagramVersion: number;
  setDiagramVersion: React.Dispatch<React.SetStateAction<number>>;
  activeTab: "flowchart" | "bpmn";
  setActiveTab: React.Dispatch<React.SetStateAction<"flowchart" | "bpmn">>;
  isEditingSteps: boolean;
  setIsEditingSteps: React.Dispatch<React.SetStateAction<boolean>>;
  isEditPanelCollapsed: boolean;
  setIsEditPanelCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  rightPanelTab: "edit" | "komentar" | "versi" | "aktivitas";
  setRightPanelTab: React.Dispatch<
    React.SetStateAction<"edit" | "komentar" | "versi" | "aktivitas">
  >;
  isLoading: boolean;
  masterPelaksanaOptions: { id: string; name: string }[];
  relatedPosOptions: string[];
  /** Opsi keterkaitan SOP id-aware (id = detailSopId terbaru per SOP). */
  relatedSopOptions: { id: string; label: string }[];
  peraturanList: Peraturan[];
  currentSopStatus: StatusSOP;
  currentSopStatusLabel: string;
  isRevisionFlow: boolean;
  primaryActionLabel: string;
  canKirimUlangKeEvaluator: boolean;
  setSopStatusOverrideAsync: ReturnType<typeof useSopStatus>["setSopStatusOverrideAsync"];
  /** Paksa flush autosave header SOP (mis. sebelum aksi besar / pindah halaman). */
  flushHeaderAutosave: () => Promise<void>;
  /** Paksa flush autosave prosedur (swimlane + langkah). */
  flushProsedurAutosave: () => Promise<void>;
  /** Status autosave header (idle/pending/saving/saved/error) untuk indikator UI. */
  autosaveStatus: SopHeaderAutosaveStatus;
  /** Error autosave header terakhir; reference baru per error agar consumer bisa toast sekali. */
  autosaveError: Error | null;
  /** Status autosave prosedur (swimlane + langkah). */
  prosedurAutosaveStatus: SopProsedurAutosaveStatus;
  /** Error autosave prosedur terakhir. */
  prosedurAutosaveError: Error | null;
  /** True jika status SOP mengizinkan mengubah dokumen (autosave dan kontrol edit aktif). */
  canEditDetail: boolean;
}

export function useDetailSopPenyusunData(
  sopDetailId: string | undefined,
  sopStatusOverride: StatusSOP | undefined,
  role: string | null | undefined,
): UseDetailSopPenyusunDataResult {
  const { setSopStatusOverrideAsync } = useSopStatus();
  const { list: sopList } = useSop();
  const { list: peraturanList } = usePeraturan();
  const { list: pelaksanaList } = usePelaksana();
  const { data: workbench, isLoading: isLoadingWorkbench } = useQuery({
    queryKey: queryKeys.penyusunWorkbench(sopDetailId ?? ""),
    queryFn: () => sopApi.getPenyusunWorkbench(sopDetailId!),
    enabled: !!sopDetailId,
    staleTime: STALE_TIME.SHORT,
  });
  const updateSopHeaderMutation = useUpdateSopHeader(sopDetailId ?? "");
  const updateSopProsedurMutation = useUpdateSopProsedur(sopDetailId ?? "");

  const [metadata, setMetadata] = useState<SOPDetailMetadata>({});
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>([]);
  const [implementers, setImplementers] = useState<{ id: string; name: string }[]>([]);
  const [diagramVersion, setDiagramVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<"flowchart" | "bpmn">("flowchart");
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [isEditPanelCollapsed, setIsEditPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<
    "edit" | "komentar" | "versi" | "aktivitas"
  >("edit");

  const sopDetail = workbench?.detail;
  const langkahList = workbench?.langkah ?? [];
  const auditLogs = workbench?.logEdit ?? [];
  const resolvedStatusForEdit = useMemo(
    (): StatusSOP =>
      (workbench?.detail.status ?? sopStatusOverride ?? DEFAULT_SOP_STATUS) as StatusSOP,
    [workbench?.detail.status, sopStatusOverride],
  );
  const canEditDetail = canEditSop(resolvedStatusForEdit);
  /* Sinkron state lokal HANYA saat berganti DetailSOP (mis. masuk halaman /:id baru).
     PATCH yang dipicu autosave akan update cache TanStack lewat setQueryData, tapi
     TIDAK boleh menimpa metadata UI yang sedang diketik user. Identitas: detailSopId. */
  const lastSyncedDetailIdRef = useRef<string | null>(null);

  const headerSnapshot = useMemo(() => buildSopHeaderSnapshot(metadata), [metadata]);
  const headerAutosave = useSopHeaderAutosave({
    detailSopId: sopDetailId,
    snapshot: headerSnapshot,
    save: updateSopHeaderMutation.mutateAsync,
    enabled: Boolean(sopDetailId) && Boolean(sopDetail) && canEditDetail,
  });

  const prosedurSnapshot = useMemo(
    () => buildSopProsedurSnapshot(implementers, prosedurRows),
    [implementers, prosedurRows],
  );
  const prosedurAutosave = useSopProsedurAutosave({
    detailSopId: sopDetailId,
    snapshot: prosedurSnapshot,
    save: updateSopProsedurMutation.mutateAsync,
    enabled: Boolean(sopDetailId) && Boolean(sopDetail) && canEditDetail,
  });

  useEffect(() => {
    if (!sopDetail) {
      return;
    }
    /* Hanya sinkron sekali per identitas DetailSOP. Jika `id` sama dengan terakhir di-sync,
       artinya kita masih di SOP yang sama dan local state adalah source of truth. */
    if (lastSyncedDetailIdRef.current === sopDetail.id) {
      return;
    }
    lastSyncedDetailIdRef.current = sopDetail.id;
    const nextMetadata = transformSopDetailToMetadata(sopDetail);
    setMetadata(nextMetadata);
    headerAutosave.resetBaseline(buildSopHeaderSnapshot(nextMetadata));
    let nextRows: ProsedurRow[] = [];
    if (langkahList.length > 0) {
      nextRows = [...langkahList]
        .sort((a, b) => a.urutan - b.urutan)
        .map(transformLangkahToProsedurRow);
    }
    /* Sumber kebenaran kolom PELAKSANA = swimlane (DetailSOPPelaksana) yang dikembalikan
       API. Aktor di langkah yang belum di-swimlane tetap dimasukkan untuk back-compat
       data lama. Urutan: swimlane.urutan asc, lalu langkah pelaksanaIds yang baru. */
    const nextImplementers: { id: string; name: string }[] = [];
    const seenImplementerIds = new Set<string>();
    const swimlanes = sopDetail.swimlanes ?? [];
    for (const sw of [...swimlanes].sort((a, b) => a.urutan - b.urutan)) {
      if (!sw.pelaksanaId || seenImplementerIds.has(sw.pelaksanaId)) continue;
      seenImplementerIds.add(sw.pelaksanaId);
      const name =
        sw.pelaksana?.namaPelaksana ??
        pelaksanaList.find((p) => p.id === sw.pelaksanaId)?.namaPelaksana ??
        sw.pelaksanaId;
      nextImplementers.push({ id: sw.pelaksanaId, name });
    }
    for (const row of nextRows) {
      if (!row.pelaksana || seenImplementerIds.has(row.pelaksana)) continue;
      seenImplementerIds.add(row.pelaksana);
      const name =
        pelaksanaList.find((p) => p.id === row.pelaksana)?.namaPelaksana ?? row.pelaksana;
      nextImplementers.push({ id: row.pelaksana, name });
    }
    setProsedurRows(nextRows);
    setImplementers(nextImplementers);
    prosedurAutosave.resetBaseline(buildSopProsedurSnapshot(nextImplementers, nextRows));
  }, [sopDetail, langkahList, pelaksanaList, headerAutosave, prosedurAutosave]);

  const masterPelaksanaOptions = useMemo(
    () =>
      pelaksanaList.map((pelaksana) => ({
        id: pelaksana.id,
        name: pelaksana.namaPelaksana,
      })),
    [pelaksanaList],
  );
  const relatedPosOptions = useMemo(
    () => sopList.map((sop) => sop.judul).filter(Boolean),
    [sopList],
  );
  const relatedSopOptions = useMemo(
    () =>
      sopList
        .filter((sop) => Boolean(sop.detailSopId) && sop.id !== sopDetail?.sopId)
        .map((sop) => ({
          id: sop.detailSopId as string,
          label: sop.judul,
        })),
    [sopList, sopDetail?.sopId],
  );

  const currentSopStatus: StatusSOP = resolvedStatusForEdit;
  const currentSopStatusLabel =
    workbench?.detail.statusLabel ?? currentSopStatus;
  const isRevisionFlow = currentSopStatus === "REVISI_DARI_EVALUATOR";
  const canKirimUlangKeEvaluator = canKirimUlangKeEvaluatorAfterRevisi(role);
  const primaryActionLabel =
    isRevisionFlow && canKirimUlangKeEvaluator ? "Kirim ulang ke evaluator" : "Selesai";
  const isLoading = isLoadingWorkbench;

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
    isLoading,
    masterPelaksanaOptions,
    relatedPosOptions,
    relatedSopOptions,
    peraturanList,
    currentSopStatus,
    currentSopStatusLabel,
    isRevisionFlow,
    primaryActionLabel,
    canKirimUlangKeEvaluator,
    setSopStatusOverrideAsync,
    flushHeaderAutosave: headerAutosave.flush,
    flushProsedurAutosave: prosedurAutosave.flush,
    autosaveStatus: headerAutosave.status,
    autosaveError: headerAutosave.lastError,
    prosedurAutosaveStatus: prosedurAutosave.status,
    prosedurAutosaveError: prosedurAutosave.lastError,
    canEditDetail,
  };
}

export interface UseDetailSopPenyusunReturn {
  metadata: SOPDetailMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<SOPDetailMetadata>>;
  prosedurRows: ProsedurRow[];
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>;
  implementers: { id: string; name: string }[];
  setImplementers: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>;
  auditLogs: PenyusunWorkbenchLogEdit[];
  diagramVersion: number;
  setDiagramVersion: React.Dispatch<React.SetStateAction<number>>;
  activeTab: "flowchart" | "bpmn";
  setActiveTab: React.Dispatch<React.SetStateAction<"flowchart" | "bpmn">>;
  isEditingSteps: boolean;
  setIsEditingSteps: React.Dispatch<React.SetStateAction<boolean>>;
  isEditPanelCollapsed: boolean;
  setIsEditPanelCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  rightPanelTab: "edit" | "komentar" | "versi" | "aktivitas";
  setRightPanelTab: React.Dispatch<
    React.SetStateAction<"edit" | "komentar" | "versi" | "aktivitas">
  >;
  isLoading: boolean;
  masterPelaksanaOptions: { id: string; name: string }[];
  relatedPosOptions: string[];
  /** Opsi keterkaitan SOP id-aware (id = detailSopId terbaru per SOP). */
  relatedSopOptions: { id: string; label: string }[];
  peraturanList: Peraturan[];
  currentSopStatus: StatusSOP;
  currentSopStatusLabel: string;
  isRevisionFlow: boolean;
  primaryActionLabel: string;
  canKirimUlangKeEvaluator: boolean;
  handleMetadataChange: <K extends keyof SOPDetailMetadata>(
    field: K,
    value: SOPDetailMetadata[K],
  ) => void;
  handleComplete: (
    id: string | undefined,
    role: string | null,
    navigate: (opts: NavigateOptions) => void,
  ) => Promise<void>;
  /** True saat POST kirim-ulang-evaluasi (alur revisi). */
  isKirimUlangKeEvaluatorPending: boolean;
  /** Status autosave header (idle/pending/saving/saved/error) untuk indikator UI. */
  autosaveStatus: SopHeaderAutosaveStatus;
  /** Error autosave header terakhir; reference baru per error agar consumer bisa toast sekali. */
  autosaveError: Error | null;
  /** Status autosave prosedur (swimlane + langkah) untuk indikator UI gabungan. */
  prosedurAutosaveStatus: SopProsedurAutosaveStatus;
  /** Error autosave prosedur terakhir; reference baru per error. */
  prosedurAutosaveError: Error | null;
  /** Paksa flush autosave header SOP (mis. sebelum aksi besar / pindah halaman). */
  flushHeaderAutosave: () => Promise<void>;
  /** Paksa flush autosave prosedur SOP. */
  flushProsedurAutosave: () => Promise<void>;
  /** Status dokumen mengizinkan penyuntingan header dan langkah. */
  canEditDetail: boolean;
}

export function useDetailSopPenyusun(
  sopDetailId: string | undefined,
  sopStatusOverride: StatusSOP | undefined,
  _isRevisionFlowOverride?: boolean,
): UseDetailSopPenyusunReturn {
  const { showToast } = useToast();
  const { role } = useAppRole();
  const data = useDetailSopPenyusunData(sopDetailId, sopStatusOverride, role);

  const { handleComplete, isKirimUlangPending } = useDetailSopPenyusunActions({
    setSopStatusOverrideAsync: data.setSopStatusOverrideAsync,
    showToast,
    isRevisionFlow: data.isRevisionFlow,
    canKirimUlangKeEvaluator: data.canKirimUlangKeEvaluator,
    flushHeaderAutosave: data.flushHeaderAutosave,
    flushProsedurAutosave: data.flushProsedurAutosave,
  });

  const handleMetadataChange = useCallback(
    <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => {
      data.setMetadata((prev) => ({ ...prev, [field]: value }));
    },
    [data.setMetadata],
  );

  return {
    metadata: data.metadata,
    setMetadata: data.setMetadata,
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
    isLoading: data.isLoading,
    masterPelaksanaOptions: data.masterPelaksanaOptions,
    relatedPosOptions: data.relatedPosOptions,
    relatedSopOptions: data.relatedSopOptions,
    peraturanList: data.peraturanList,
    currentSopStatus: data.currentSopStatus,
    currentSopStatusLabel: data.currentSopStatusLabel,
    isRevisionFlow: data.isRevisionFlow,
    primaryActionLabel: data.primaryActionLabel,
    canKirimUlangKeEvaluator: data.canKirimUlangKeEvaluator,
    handleMetadataChange,
    handleComplete,
    isKirimUlangKeEvaluatorPending: isKirimUlangPending,
    autosaveStatus: data.autosaveStatus,
    autosaveError: data.autosaveError,
    prosedurAutosaveStatus: data.prosedurAutosaveStatus,
    prosedurAutosaveError: data.prosedurAutosaveError,
    flushHeaderAutosave: data.flushHeaderAutosave,
    flushProsedurAutosave: data.flushProsedurAutosave,
    canEditDetail: data.canEditDetail,
  };
}


export interface UseDaftarSopDataParams {
  /** Daftar dari server (sudah termasuk filter status/tanggal bila dikirim ke API). */
  list: SopDaftarRow[];
  searchQuery: string;
}

/** Filter teks pencarian lokal pada daftar SOP yang sudah diambil dari server. */
export function useDaftarSopData(params: UseDaftarSopDataParams) {
  const filteredList = useMemo(() => {
    const q = params.searchQuery.trim().toLowerCase();
    if (!q) return params.list;
    return params.list.filter(
      (sop) =>
        sop.judul.toLowerCase().includes(q) ||
        (sop.nomorSop ?? "").toLowerCase().includes(q) ||
        (sop.pembuat ?? "").toLowerCase().includes(q),
    );
  }, [params.list, params.searchQuery]);
  return { filteredList };
}


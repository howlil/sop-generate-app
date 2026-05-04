import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NavigateOptions } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";
import { buildSopHeaderSnapshot, useSopHeaderAutosave, type SopHeaderAutosaveStatus } from "@/hooks/useSopHeaderAutosave";
import { buildSopProsedurSnapshot, useSopProsedurAutosave, type SopProsedurAutosaveStatus } from "@/hooks/useSopProsedurAutosave";
import { STALE_TIME, ROUTES, ROLES } from "@/utils/constants";
import { apiClient, buildQueryString } from '@/lib/api/api-client'
import { usePeraturan } from "@/api/peraturan";
import { transformLangkahToProsedurRow, transformSopDetailToMetadata } from "@/lib/sop/detailSop.mappers";
import { DEFAULT_SOP_STATUS } from "@/types/dto/sop.dto";
import type {
  Pelaksana,
  Sop,
  SopDaftarRow,
  SopDetail,
  StatusSOP,
} from '@/types/dto/sop.dto'
import type { Peraturan } from "@/types/dto/peraturan.dto";
import type {
  CreatePelaksanaDto,
  CreateSopRequestDto,
  DetailSopListQueryParams,
  SopListQueryParams,
  UpdateSopMutationDto,
  UpdateSopJudulDto,
  SetSopStatusOverrideMutationDto,
  CreatePelaksanaMutationDto,
  UpdatePelaksanaMutationDto,
  UpdateStatusDto,
  UpdateStatusMutationDto,
  UpdateSopHeaderDto,
  UpdateSopProsedurDto,
  PenyusunWorkbenchData,
  PenyusunWorkbenchLogEdit,
  PenyusunWorkbenchQueryParams,
} from '@/types/dto/sop.dto'
import type { ApiSuccessResponse } from '@/types/dto/auth.dto'
import type { CreateKomentarDto, KomentarItem } from '@/types/dto/komentar.dto'
import type { ProsedurRow, SOPDetailMetadata } from "@/types/ui/sop";

/** Master pelaksana (`GET/POST/PATCH/DELETE /pelaksana`) memakai bungkus API Nest. */
async function unwrapPelaksanaMaster<T>(promise: Promise<ApiSuccessResponse<T>>): Promise<T> {
  const envelope = await promise
  return envelope.data as T
}

/** Daftar SOP (`GET /sop`) memakai bungkus ApiSuccessResponse. */
async function unwrapSopListEnvelope(
  promise: Promise<ApiSuccessResponse<SopDaftarRow[]>>,
): Promise<SopDaftarRow[]> {
  const envelope = await promise
  return envelope.data as SopDaftarRow[]
}

/** Daftar Komentar SOP — bungkus ApiSuccessResponse. */
async function unwrapKomentarListEnvelope(
  promise: Promise<ApiSuccessResponse<KomentarItem[]>>,
): Promise<KomentarItem[]> {
  const envelope = await promise
  return envelope.data as KomentarItem[]
}

/** Satu item Komentar SOP — bungkus ApiSuccessResponse. */
async function unwrapKomentarItemEnvelope(
  promise: Promise<ApiSuccessResponse<KomentarItem>>,
): Promise<KomentarItem> {
  const envelope = await promise
  return envelope.data as KomentarItem
}

async function unwrapSopCreateEnvelope(
  promise: Promise<ApiSuccessResponse<SopDaftarRow>>,
): Promise<SopDaftarRow> {
  const envelope = await promise
  return envelope.data as SopDaftarRow
}

async function unwrapPenyusunWorkbench(
  promise: Promise<ApiSuccessResponse<PenyusunWorkbenchData>>,
): Promise<PenyusunWorkbenchData> {
  const envelope = await promise
  return envelope.data as PenyusunWorkbenchData
}

export const sopApi = {
  // ================= SOP (Header) =================

  findAll: (params?: SopListQueryParams) => {
    const query = buildQueryString(params as Record<string, unknown> | undefined)
    return unwrapSopListEnvelope(
      apiClient.get<ApiSuccessResponse<SopDaftarRow[]>>(`/sop${query}`),
    )
  },

  findById: (id: string) =>
    apiClient.get<Sop>(`/sop/${id}`),

  create: (payload: CreateSopRequestDto) =>
    unwrapSopCreateEnvelope(
      apiClient.post<ApiSuccessResponse<SopDaftarRow>>('/sop', payload),
    ),

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
   * PATCH status DetailSOP (transisi status: SEDANG_DISUSUN, SIAP_DIEVALUASI, dst).
   * Endpoint legacy `/detail-sop/:id/status` masih dipakai untuk transisi status.
   */
  updateStatus: (id: string, payload: UpdateStatusDto) =>
    apiClient.patch<SopDetail>(`/detail-sop/${id}/status`, payload),

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

  // ================= Komentar SOP =================

  /** GET `/sop/komentar/:detailSopId` — daftar komentar urut terbaru. */
  listKomentar: (detailSopId: string) =>
    unwrapKomentarListEnvelope(
      apiClient.get<ApiSuccessResponse<KomentarItem[]>>(`/sop/komentar/${detailSopId}`),
    ),

  /** POST `/sop/komentar/:detailSopId` — TIM_EVALUASI kirim komentar baru. */
  createKomentar: (detailSopId: string, payload: CreateKomentarDto) =>
    unwrapKomentarItemEnvelope(
      apiClient.post<ApiSuccessResponse<KomentarItem>>(
        `/sop/komentar/${detailSopId}`,
        payload,
      ),
    ),

  /** PATCH `/sop/komentar/:komentarId/selesai` — penyusun menandai komentar selesai. */
  resolveKomentar: (komentarId: string) =>
    unwrapKomentarItemEnvelope(
      apiClient.patch<ApiSuccessResponse<KomentarItem>>(
        `/sop/komentar/${komentarId}/selesai`,
      ),
    ),

  /** DELETE `/sop/komentar/:komentarId` — pembuat (TIM_EVALUASI) menghapus komentarnya. */
  deleteKomentar: (komentarId: string) =>
    apiClient.delete<ApiSuccessResponse<null>>(`/sop/komentar/${komentarId}`),
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

// ==================== Penyusun (PJ koordinator) — akses UI ====================
export function canPjPenyusunRunCoordinatorActions(role: string): boolean {
  return role === ROLES.PJ_PENYUSUN;
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
  } = useQuery<SopDaftarRow[]>({
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
  const { data: list } = useSuspenseQuery<SopDaftarRow[]>({
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
  const queryClient = useQueryClient();
  const updateStatusMutation = useMutationWithToast({
    mutationFn: ({ sopId, status }: SetSopStatusOverrideMutationDto) =>
      sopApi.updateStatus(sopId, { status }),
    invalidateKeys: [queryKeys.detailSop, queryKeys.sop],
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.penyusunWorkbench(variables.sopId) });
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

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutationWithToast({
    mutationFn: ({ id, payload }: UpdateStatusMutationDto) =>
      sopApi.updateStatus(id, payload),
    invalidateKeys: [queryKeys.detailSop, queryKeys.sop],
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.penyusunWorkbench(variables.id) });
    },
    successMessage: "Status SOP berhasil diubah",
    errorMessagePrefix: "Gagal mengubah status",
  });
}

interface UseDetailSopPenyusunActionsParams {
  setSopStatusOverrideAsync: (payload: {
    sopId: string;
    status: UpdateStatusDto["status"];
  }) => Promise<unknown>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  isRevisionFlow: boolean;
  /** Flush autosave header SOP sebelum aksi besar (selesai) agar tidak ada perubahan tertinggal. */
  flushHeaderAutosave: () => Promise<void>;
  /** Flush autosave prosedur (swimlane + langkah) sebelum aksi besar. */
  flushProsedurAutosave: () => Promise<void>;
}

/**
 * Aksi tingkat halaman editor: hanya transisi status SOP (Selesai/Selesaikan revisi).
 * Persistensi data (header, swimlane, langkah) seluruhnya ditangani oleh autosave.
 */
export function useDetailSopPenyusunActions({
  setSopStatusOverrideAsync,
  showToast,
  isRevisionFlow,
  flushHeaderAutosave,
  flushProsedurAutosave,
}: UseDetailSopPenyusunActionsParams) {
  const flushAll = useCallback(async () => {
    await Promise.all([flushHeaderAutosave(), flushProsedurAutosave()]);
  }, [flushHeaderAutosave, flushProsedurAutosave]);

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
        await setSopStatusOverrideAsync({ sopId: id, status: "SIAP_DIEVALUASI" });
        showToast(
          isRevisionFlow
            ? "Revisi selesai. Kembali ke Manajemen SOP untuk kirim ulang ke evaluasi."
            : "SOP berhasil disimpan dan siap diajukan ke evaluasi.",
        );
        if (navigateFn) {
          navigateFn({ to: ROUTES.PENYUSUN.SOP });
        }
      } catch {
        showToast("Gagal menyelesaikan SOP. Periksa data yang diisi.", "error");
      }
    },
    [flushAll, isRevisionFlow, setSopStatusOverrideAsync, showToast],
  );

  return {
    handleComplete,
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
  rightPanelTab: "edit" | "komentar" | "aktivitas";
  setRightPanelTab: React.Dispatch<React.SetStateAction<"edit" | "komentar" | "aktivitas">>;
  isLoading: boolean;
  masterPelaksanaOptions: { id: string; name: string }[];
  relatedPosOptions: string[];
  /** Opsi keterkaitan SOP id-aware (id = detailSopId terbaru per SOP). */
  relatedSopOptions: { id: string; label: string }[];
  peraturanList: Peraturan[];
  currentSopStatus: StatusSOP;
  isRevisionFlow: boolean;
  primaryActionLabel: string;
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
}

export function useDetailSopPenyusunData(
  sopDetailId: string | undefined,
  sopStatusOverride: StatusSOP | undefined,
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
  const [rightPanelTab, setRightPanelTab] = useState<"edit" | "komentar" | "aktivitas">("edit");

  const sopDetail = workbench?.detail;
  const langkahList = workbench?.langkah ?? [];
  const auditLogs = workbench?.logEdit ?? [];
  /* Sinkron state lokal HANYA saat berganti DetailSOP (mis. masuk halaman /:id baru).
     PATCH yang dipicu autosave akan update cache TanStack lewat setQueryData, tapi
     TIDAK boleh menimpa metadata UI yang sedang diketik user. Identitas: detailSopId. */
  const lastSyncedDetailIdRef = useRef<string | null>(null);

  const headerSnapshot = useMemo(() => buildSopHeaderSnapshot(metadata), [metadata]);
  const headerAutosave = useSopHeaderAutosave({
    detailSopId: sopDetailId,
    snapshot: headerSnapshot,
    save: updateSopHeaderMutation.mutateAsync,
    enabled: Boolean(sopDetailId) && Boolean(sopDetail),
  });

  const prosedurSnapshot = useMemo(
    () => buildSopProsedurSnapshot(implementers, prosedurRows),
    [implementers, prosedurRows],
  );
  const prosedurAutosave = useSopProsedurAutosave({
    detailSopId: sopDetailId,
    snapshot: prosedurSnapshot,
    save: updateSopProsedurMutation.mutateAsync,
    enabled: Boolean(sopDetailId) && Boolean(sopDetail),
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

  const currentSopStatus: StatusSOP = (sopStatusOverride ?? DEFAULT_SOP_STATUS) as StatusSOP;
  const isRevisionFlow = currentSopStatus === "REVISI_DARI_TIM_EVALUASI";
  const primaryActionLabel = isRevisionFlow ? "Selesaikan revisi" : "Selesai";
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
    isRevisionFlow,
    primaryActionLabel,
    setSopStatusOverrideAsync,
    flushHeaderAutosave: headerAutosave.flush,
    flushProsedurAutosave: prosedurAutosave.flush,
    autosaveStatus: headerAutosave.status,
    autosaveError: headerAutosave.lastError,
    prosedurAutosaveStatus: prosedurAutosave.status,
    prosedurAutosaveError: prosedurAutosave.lastError,
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
  rightPanelTab: "edit" | "komentar" | "aktivitas";
  setRightPanelTab: React.Dispatch<React.SetStateAction<"edit" | "komentar" | "aktivitas">>;
  isLoading: boolean;
  masterPelaksanaOptions: { id: string; name: string }[];
  relatedPosOptions: string[];
  /** Opsi keterkaitan SOP id-aware (id = detailSopId terbaru per SOP). */
  relatedSopOptions: { id: string; label: string }[];
  peraturanList: Peraturan[];
  currentSopStatus: StatusSOP;
  isRevisionFlow: boolean;
  primaryActionLabel: string;
  handleMetadataChange: <K extends keyof SOPDetailMetadata>(
    field: K,
    value: SOPDetailMetadata[K],
  ) => void;
  handleComplete: (
    id: string | undefined,
    role: string | null,
    navigate: (opts: NavigateOptions) => void,
  ) => Promise<void>;
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
}

export function useDetailSopPenyusun(
  sopDetailId: string | undefined,
  sopStatusOverride: StatusSOP | undefined,
  _isRevisionFlowOverride?: boolean,
): UseDetailSopPenyusunReturn {
  const { showToast } = useToast();
  const data = useDetailSopPenyusunData(sopDetailId, sopStatusOverride);

  const { handleComplete } = useDetailSopPenyusunActions({
    setSopStatusOverrideAsync: data.setSopStatusOverrideAsync,
    showToast,
    isRevisionFlow: data.isRevisionFlow,
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
    isRevisionFlow: data.isRevisionFlow,
    primaryActionLabel: data.primaryActionLabel,
    handleMetadataChange,
    handleComplete,
    autosaveStatus: data.autosaveStatus,
    autosaveError: data.autosaveError,
    prosedurAutosaveStatus: data.prosedurAutosaveStatus,
    prosedurAutosaveError: data.prosedurAutosaveError,
    flushHeaderAutosave: data.flushHeaderAutosave,
    flushProsedurAutosave: data.flushProsedurAutosave,
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
    const matchesSearch =
      !q ||
      sop.judul.toLowerCase().includes(q) ||
      (sop.nomorSop ?? "").toLowerCase().includes(q) ||
      (sop.pembuat ?? "").toLowerCase().includes(q);
    const matchesStatus = !params.filterStatus || params.filterStatus === "all" || sop.status === params.filterStatus;
    const matchesPeraturan =
      !params.filterPeraturan || params.filterPeraturan === "all" || sop.peraturanId === params.filterPeraturan;
    const updated = sop.terakhirDiperbarui;
    const matchesDateFrom = !params.filterTanggalDari || !updated || updated >= params.filterTanggalDari;
    const matchesDateTo = !params.filterTanggalSampai || !updated || updated <= params.filterTanggalSampai;
    return matchesSearch && matchesStatus && matchesPeraturan && matchesDateFrom && matchesDateTo;
  });
  const eligibleSopsForEvaluasi = list.filter((sop) => sop.status === "SIAP_DIEVALUASI");
  return { filteredList, eligibleSopsForEvaluasi };
}

/* =====================================================
   Komentar SOP — Hooks (TanStack Query)
   ===================================================== */

/** Daftar komentar SOP untuk satu DetailSOP (urut terbaru). */
export function useSopKomentar(detailSopId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sopKomentar(detailSopId ?? ""),
    queryFn: () => sopApi.listKomentar(detailSopId as string),
    enabled: Boolean(detailSopId),
    staleTime: STALE_TIME.SHORT,
  });
}

/** Mutasi: TIM_EVALUASI kirim komentar baru. */
export function useCreateSopKomentar(detailSopId: string | undefined) {
  return useMutationWithToast({
    mutationFn: (payload: CreateKomentarDto) =>
      sopApi.createKomentar(detailSopId as string, payload),
    invalidateKeys: [queryKeys.sopKomentar(detailSopId ?? "")],
    successMessage: "Komentar berhasil dikirim",
    errorMessagePrefix: "Gagal mengirim komentar",
  });
}

/** Mutasi: PENYUSUN/PJ_PENYUSUN menandai komentar selesai. */
export function useResolveSopKomentar(detailSopId: string | undefined) {
  return useMutationWithToast({
    mutationFn: (komentarId: string) => sopApi.resolveKomentar(komentarId),
    invalidateKeys: [queryKeys.sopKomentar(detailSopId ?? "")],
    successMessage: "Komentar ditandai selesai",
    errorMessagePrefix: "Gagal menandai komentar selesai",
  });
}

/** Mutasi: pembuat (TIM_EVALUASI) menghapus komentarnya sendiri. */
export function useDeleteSopKomentar(detailSopId: string | undefined) {
  return useMutationWithToast({
    mutationFn: (komentarId: string) => sopApi.deleteKomentar(komentarId),
    invalidateKeys: [queryKeys.sopKomentar(detailSopId ?? "")],
    successMessage: "Komentar dihapus",
    errorMessagePrefix: "Gagal menghapus komentar",
  });
}

/**
 * Evaluasi API — selaras modul Nest `evaluation`:
 * - GET/POST `/evaluasi` → `PengajuanEvaluasiController`
 * - PATCH `.../nilai/:detailSopId` | `.../selesai` → `EvaluasiNilaiController`
 * - GET `/evaluasi/workspace/opd/:opdId` → `EvaluasiWorkspaceController`
 * - GET `/evaluasi/laporan/grafik-tahunan` → `EvaluasiGrafikController`
 */

import { apiClient, buildQueryString } from '@/lib/api/api-client'
import type { ApiSuccessResponse } from '@/types/dto/auth.dto'
import type {
  NilaiEvaluasi,
  PengajuanEvaluasi,
} from '@/types/dto/evaluasi.dto'
import type {
  CreatePengajuanEvaluasiDto,
  EvaluasiGrafikTahunanData,
  EvaluasiGrafikTahunanQueryParams,
  EvaluasiListQueryParams,
  EvaluasiWorkspaceOpdResponse,
  EvaluasiWorkspacePengajuanAktif,
  EvaluasiWorkspaceQueryParams,
  IsiNilaiEvaluasiDto,
  IsiNilaiEvaluasiMutationDto,
  SelesaiEvaluasiDto,
  SelesaiEvaluasiMutationDto,
  StatusHasilEvaluasi,
} from '@/types/dto/evaluasi.dto'
import { STATUS_HASIL_EVALUASI } from '@/types/dto/evaluasi.dto'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { queryKeys } from '@/config/query-keys'
import { STALE_TIME } from '@/utils/constants'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useToast, showErrorMessages } from '@/hooks/useToast'

async function unwrapEvaluasiWorkspaceOpd(
  promise: Promise<ApiSuccessResponse<EvaluasiWorkspaceOpdResponse>>,
): Promise<EvaluasiWorkspaceOpdResponse> {
  const envelope = await promise
  return envelope.data
}

async function unwrapEvaluasiEnvelope<T>(
  promise: Promise<ApiSuccessResponse<T>>,
): Promise<T> {
  const envelope = await promise
  return envelope.data
}

export const evaluasiApi = {
  findAll: (params?: EvaluasiListQueryParams) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : ''
    return unwrapEvaluasiEnvelope(
      apiClient.get<ApiSuccessResponse<PengajuanEvaluasi[]>>(`/evaluasi${query}`),
    )
  },

  findById: (id: string) =>
    unwrapEvaluasiEnvelope(apiClient.get<ApiSuccessResponse<PengajuanEvaluasi>>(`/evaluasi/${id}`)),

  create: (payload: CreatePengajuanEvaluasiDto) =>
    unwrapEvaluasiEnvelope(
      apiClient.post<ApiSuccessResponse<PengajuanEvaluasi>>('/evaluasi', payload),
    ),

  isiNilai: (
    pengajuanEvaluasiId: string,
    sopDetailId: string,
    payload: IsiNilaiEvaluasiDto,
  ) =>
    unwrapEvaluasiEnvelope(
      apiClient.patch<ApiSuccessResponse<NilaiEvaluasi>>(
        `/evaluasi/${pengajuanEvaluasiId}/nilai/${sopDetailId}`,
        payload,
      ),
    ),

  selesai: (
    pengajuanEvaluasiId: string,
    payload: SelesaiEvaluasiDto,
  ) =>
    unwrapEvaluasiEnvelope(
      apiClient.patch<ApiSuccessResponse<PengajuanEvaluasi>>(
        `/evaluasi/${pengajuanEvaluasiId}/selesai`,
        payload,
      ),
    ),

  update: (id: string, payload: Partial<PengajuanEvaluasi>) =>
    apiClient.patch<PengajuanEvaluasi>(`/evaluasi/${id}`, payload),

  /** GET `/evaluasi/laporan/grafik-tahunan` — dasbor PJ evaluator (bungkus API). */
  grafikTahunan: async (params?: EvaluasiGrafikTahunanQueryParams) => {
    const envelope = await apiClient.get<ApiSuccessResponse<EvaluasiGrafikTahunanData>>(
      `/evaluasi/laporan/grafik-tahunan${buildQueryString(params as Record<string, unknown> | undefined)}`,
    )
    return envelope.data
  },

  workspaceOpd: (opdId: string, params?: EvaluasiWorkspaceQueryParams) =>
    unwrapEvaluasiWorkspaceOpd(
      apiClient.get<ApiSuccessResponse<EvaluasiWorkspaceOpdResponse>>(
        `/evaluasi/workspace/opd/${opdId}${buildQueryString(params as Record<string, unknown> | undefined)}`,
      ),
    ),
}

// ==================== Evaluasi Domain Logic ====================
export interface StatusHasilEvaluasiForm {
  hasil: StatusHasilEvaluasi;
  catatan: string;
}

export function getStatusSopAfterEvaluasi(hasil: StatusHasilEvaluasi): string {
  if (hasil === "SESUAI") {
    return "SIAP_DIVERIFIKASI";
  }
  return "REVISI_DARI_TIM_EVALUASI";
}

export function isFormEvaluasiSopComplete(
  form: StatusHasilEvaluasiForm,
): boolean {
  return !!form.hasil && (form.hasil as string) !== "";
}

/** Satu baris ringkasan untuk dialog ajukan ke PJ (merge draft SOP terpilih). */
export interface AjukanEvaluasiSnapshotRow {
  readonly detailSopId: string;
  readonly judul: string;
  readonly nomorSOP: string;
  readonly hasilLabel: string;
}

/** Alasan tombol ajukan dinonaktifkan; `null` berarti syarat klien terpenuhi. */
export function getAjukanEvaluasiBlockingReason(
  pengajuan: EvaluasiWorkspacePengajuanAktif | null | undefined,
  ratingOPD: number | null,
  selectedDetailId: string | null | undefined,
  draftHasil: StatusHasilEvaluasi | null | undefined,
): string | null {
  if (!pengajuan) {
    return "Tidak ada pengajuan evaluasi aktif untuk OPD ini.";
  }
  if (ratingOPD === null || ratingOPD < 1 || ratingOPD > 5) {
    return "Isi skor evaluasi OPD (1–5) di tab Evaluasi OPD.";
  }
  if (pengajuan.nilaiPerDetail.length === 0) {
    return "Pengajuan belum memiliki daftar dokumen untuk dinilai.";
  }
  for (const row of pengajuan.nilaiPerDetail) {
    const effectiveHasil =
      selectedDetailId === row.detailSopId &&
      draftHasil !== null &&
      draftHasil !== undefined
        ? draftHasil
        : row.hasil;
    if (effectiveHasil !== STATUS_HASIL_EVALUASI.SESUAI) {
      return "Semua SOP harus bernilai Sesuai (simpan per dokumen, tunggu konfirmasi simpan) sebelum mengajukan hasil ke PJ Evaluator.";
    }
  }
  return null;
}

export function buildAjukanEvaluasiSnapshotRows(
  pengajuan: EvaluasiWorkspacePengajuanAktif | null | undefined,
  judulByDetailId: Map<string, { judul: string; nomorSOP: string }>,
  selectedDetailId: string | null | undefined,
  draftHasil: StatusHasilEvaluasi | null | undefined,
): AjukanEvaluasiSnapshotRow[] {
  if (!pengajuan) {
    return [];
  }
  return pengajuan.nilaiPerDetail.map((row) => {
    const meta = judulByDetailId.get(row.detailSopId);
    const effectiveHasil =
      selectedDetailId === row.detailSopId &&
      draftHasil !== null &&
      draftHasil !== undefined
        ? draftHasil
        : row.hasil;
    let hasilLabel = "Belum dinilai";
    if (effectiveHasil === STATUS_HASIL_EVALUASI.SESUAI) {
      hasilLabel = "Sesuai";
    } else if (effectiveHasil === STATUS_HASIL_EVALUASI.PERLU_PERBAIKAN) {
      hasilLabel = "Perlu Perbaikan";
    }
    return {
      detailSopId: row.detailSopId,
      judul: meta?.judul ?? row.detailSopId.slice(0, 8) + "…",
      nomorSOP: meta?.nomorSOP ?? "—",
      hasilLabel,
    };
  });
}

// ==================== Evaluasi Hooks ====================
export function useEvaluasi(params?: EvaluasiListQueryParams & { enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  const listParams: EvaluasiListQueryParams | undefined =
    params === undefined
      ? undefined
      : (Object.fromEntries(
          Object.entries({
            opdId: params.opdId,
            status: params.status,
            jenis: params.jenis,
          }).filter(([, v]) => v !== undefined),
        ) as EvaluasiListQueryParams);
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.evaluasiList(listParams),
    queryFn: () => evaluasiApi.findAll(listParams),
    staleTime: STALE_TIME.MEDIUM,
    enabled,
  });

  const createMutation = useMutationWithToast({
    mutationFn: (payload: CreatePengajuanEvaluasiDto) =>
      evaluasiApi.create(payload),
    invalidateKeys: [queryKeys.evaluasi],
    successMessage: "Pengajuan evaluasi berhasil dibuat",
    errorMessagePrefix: "Gagal membuat pengajuan evaluasi",
  });

  return {
    list,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

/** Workspace evaluasi per OPD — satu GET agregat untuk halaman evaluator. */
export function useEvaluasiWorkspaceOpd(
  opdId: string,
  params?: EvaluasiWorkspaceQueryParams & { enabled?: boolean },
) {
  const enabled = params?.enabled ?? true;
  const queryParams: EvaluasiWorkspaceQueryParams | undefined =
    params === undefined
      ? undefined
      : {
          detailSopId: params.detailSopId,
          expand: params.expand,
          riwayatLimit: params.riwayatLimit,
        };
  return useQuery({
    queryKey: queryKeys.evaluasiWorkspaceOpd(opdId, queryParams),
    queryFn: () => evaluasiApi.workspaceOpd(opdId, queryParams),
    enabled: Boolean(opdId) && enabled,
    staleTime: STALE_TIME.SHORT,
  });
}

export function useEvaluasiDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.evaluasiById(id),
    queryFn: () => evaluasiApi.findById(id),
    enabled: !!id,
    staleTime: STALE_TIME.MEDIUM,
  });
}

export function useIsiNilaiEvaluasi() {
  return useMutationWithToast({
    mutationFn: ({
      pengajuanEvaluasiId,
      sopDetailId,
      payload,
    }: IsiNilaiEvaluasiMutationDto) =>
      evaluasiApi.isiNilai(pengajuanEvaluasiId, sopDetailId, payload),
    invalidateKeys: [queryKeys.evaluasi, queryKeys.evaluasiWorkspaceOpdAll],
    successMessage: "Hasil evaluasi berhasil disimpan",
    errorMessagePrefix: "Gagal menyimpan hasil evaluasi",
  });
}

export function useSelesaiEvaluasi() {
  return useMutationWithToast({
    mutationFn: ({ pengajuanEvaluasiId, payload }: SelesaiEvaluasiMutationDto) =>
      evaluasiApi.selesai(pengajuanEvaluasiId, payload),
    invalidateKeys: [
      queryKeys.evaluasi,
      queryKeys.evaluasiWorkspaceOpdAll,
      queryKeys.evaluasiGrafikTahunan(undefined),
    ],
    successMessage: "Evaluasi berhasil diselesaikan",
    errorMessagePrefix: "Gagal menyelesaikan evaluasi",
  });
}

export function useEvaluasiGrafikTahunan(params?: EvaluasiGrafikTahunanQueryParams) {
  return useQuery({
    queryKey: queryKeys.evaluasiGrafikTahunan(params),
    queryFn: () => evaluasiApi.grafikTahunan(params),
    staleTime: 10 * 60 * 1000,
  });
}

// ==================== Pengajuan Evaluasi ====================
export function usePengajuanEvaluasiDetail(pengajuanId?: string) {
  const { data: pengajuan, isLoading: loading } = useQuery({
    queryKey: queryKeys.evaluasiById(pengajuanId || ""),
    queryFn: () => evaluasiApi.findById(pengajuanId || ""),
    enabled: !!pengajuanId,
    staleTime: STALE_TIME.SHORT,
  });

  const isVerified = pengajuan?.status === "DIVERIFIKASI_BIRO";
  const canVerify = pengajuan?.status === "SELESAI_DIEVALUASI";

  return {
    pengajuan: pengajuan || null,
    isVerified,
    canVerify,
    loading,
  };
}

/**
 * useEvaluasiDraft Hook - Server-Side Auto-Save
 * Per-SOP evaluation draft state management with real API persistence
 *
 * Workflow:
 * 1. Fetches active pengajuan evaluasi for the OPD
 * 2. Maps sopId (header) to sopDetailId from pengajuan.sopList
 * 3. Loads existing nilaiEvaluasi if any
 * 4. Auto-saves via evaluasiApi.isiNilai() with debounce
 * 5. Handles optimistic locking with version tracking
 */

const AUTO_SAVE_DELAY_MS = 1500;

export interface UseEvaluasiDraftReturn {
  statusEvaluasi: StatusHasilEvaluasi | null;
  setStatusEvaluasi: (status: StatusHasilEvaluasi | null) => void;
  komentarEvaluasi: string;
  setKomentarEvaluasi: (komentar: string) => void;
  saveDraft: () => void;
  clearDraft: () => void;
  isSaving: boolean;
  error: Error | null;
}

export function useEvaluasiDraft(
  opdId?: string,
  sopId?: string,
  workspacePengajuanAktif?: EvaluasiWorkspacePengajuanAktif | null,
): UseEvaluasiDraftReturn {
  const {
    pengajuanId,
    pengajuan,
    isLoading: isLoadingPengajuan,
    getCurrentVersion,
  } = usePengajuanEvaluasiAktif(opdId, workspacePengajuanAktif);

  // Map sopId (header) to sopDetailId from pengajuan
  const sopDetailId = useMemo(() => {
    if (!pengajuan || !sopId) return null;
    // Find the SOP in pengajuan's sopList
    const sopInPengajuan = pengajuan.nilaiEvaluasi?.find(
      (n) => n.sopDetail?.id === sopId,
    );
    // Or check if sopId is already the detail ID
    const sopInList = pengajuan.nilaiEvaluasi?.find(
      (n) => n.sopDetailId === sopId,
    );
    return sopInPengajuan?.sopDetailId ?? sopInList?.sopDetailId ?? null;
  }, [pengajuan, sopId]);

  // Load existing nilaiEvaluasi from pengajuan
  const existingNilai = useMemo(() => {
    if (!pengajuan || !sopDetailId) return null;
    return (
      pengajuan.nilaiEvaluasi?.find((n) => n.sopDetailId === sopDetailId) ??
      null
    );
  }, [pengajuan, sopDetailId]);

  // Initialize state from existing nilai
  const [statusEvaluasi, setStatusEvaluasiState] =
    useState<StatusHasilEvaluasi | null>(existingNilai?.hasil ?? null);
  const [komentarEvaluasi, setKomentarEvaluasiState] = useState<string>(
    existingNilai?.catatan ?? "",
  );

  useEffect(() => {
    setStatusEvaluasiState(existingNilai?.hasil ?? null);
    setKomentarEvaluasiState(existingNilai?.catatan ?? "");
  }, [existingNilai?.hasil, existingNilai?.catatan, sopDetailId]);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Save draft mutation
  const saveDraftMutation = useMutationWithToast({
    mutationFn: async ({
      status,
      komentar,
    }: {
      status: StatusHasilEvaluasi;
      komentar: string;
    }) => {
      if (!pengajuanId || !sopDetailId) {
        throw new Error("Data evaluasi belum tersedia");
      }

      const version = getCurrentVersion(sopDetailId);

      return evaluasiApi.isiNilai(pengajuanId, sopDetailId, {
        hasil: status,
        catatan: komentar,
        version,
      });
    },
    invalidateKeys: [queryKeys.evaluasi, queryKeys.evaluasiWorkspaceOpdAll],
    successMessage: "Draft evaluasi berhasil disimpan",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal menyimpan draft evaluasi",
    onError: (error: Error) => {
      if (error.message?.includes("Konflik versi")) {
        // Version conflict is handled by useDetailedErrors, but we can add custom logic here if needed
      }
    },
  });

  /** Trigger auto-save with debounce */
  const triggerAutoSave = useCallback(() => {
    if (!pengajuanId || !sopDetailId || isLoadingPengajuan) {
      return;
    }
    if (statusEvaluasi == null) return; // Don't save if no status yet

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const currentStatus = statusEvaluasi;
    const currentKomentar = komentarEvaluasi;

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraftMutation.mutate({
        status: currentStatus,
        komentar: currentKomentar,
      });
    }, AUTO_SAVE_DELAY_MS);
  }, [
    pengajuanId,
    sopDetailId,
    isLoadingPengajuan,
    statusEvaluasi,
    komentarEvaluasi,
    saveDraftMutation,
  ]);

  const setStatusEvaluasi = useCallback(
    (status: StatusHasilEvaluasi | null) => {
      setStatusEvaluasiState(status);
      // Will trigger auto-save via useEffect
    },
    [],
  );

  const setKomentarEvaluasi = useCallback((komentar: string) => {
    setKomentarEvaluasiState(komentar);
    // Will trigger auto-save via useEffect
  }, []);

  // Auto-save when status or komentar changes
  useEffect(() => {
    triggerAutoSave();
  }, [triggerAutoSave]);

  /** Manual save - immediate, no debounce */
  const saveDraft = useCallback(() => {
    if (!pengajuanId || !sopDetailId || statusEvaluasi == null) {
      return;
    }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    saveDraftMutation.mutate({
      status: statusEvaluasi,
      komentar: komentarEvaluasi,
    });
  }, [
    pengajuanId,
    sopDetailId,
    statusEvaluasi,
    komentarEvaluasi,
    saveDraftMutation,
  ]);

  const clearDraft = useCallback(() => {
    setStatusEvaluasiState(null);
    setKomentarEvaluasiState("");
  }, []);

  return {
    statusEvaluasi,
    setStatusEvaluasi,
    komentarEvaluasi,
    setKomentarEvaluasi,
    saveDraft,
    clearDraft,
    isSaving: saveDraftMutation.isPending,
    error: saveDraftMutation.error,
  };
}

/**
 * useEvaluasiSubmit — menyelesaikan pengajuan (PATCH selesai) setelah semua SOP SESUAI di server.
 */

interface LastEvaluatedEntry {
  date: string;
  evaluatorName: string;
}

interface UseEvaluasiSubmitConfig {
  pengajuanAktifId: string | undefined;
  ratingOPD: number | null;
  detailIdsInPengajuan: readonly string[];
  canSubmit: boolean;
  blockingMessage: string | null;
  namaEvaluator: string;
  setLastEvaluatedBy: Dispatch<
    SetStateAction<Record<string, LastEvaluatedEntry>>
  >;
  onSuccess?: () => void;
}

export function useEvaluasiSubmit(config: UseEvaluasiSubmitConfig) {
  const {
    pengajuanAktifId,
    ratingOPD,
    detailIdsInPengajuan,
    canSubmit,
    blockingMessage,
    namaEvaluator,
    setLastEvaluatedBy,
    onSuccess,
  } = config;
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terjadwalSubmitError, setTerjadwalSubmitError] = useState<
    string | null
  >(null);

  const clearTerjadwalSubmitError = useCallback(() => {
    setTerjadwalSubmitError(null);
  }, []);

  const handleSubmitAll = useCallback(async () => {
    if (!pengajuanAktifId) {
      setTerjadwalSubmitError("Pengajuan evaluasi tidak tersedia.");
      return;
    }
    if (!canSubmit) {
      setTerjadwalSubmitError(
        blockingMessage ?? "Syarat pengajuan belum terpenuhi.",
      );
      return;
    }
    if (ratingOPD === null || ratingOPD < 1 || ratingOPD > 5) {
      setTerjadwalSubmitError("Isi skor evaluasi OPD (1–5) di tab Evaluasi OPD.");
      return;
    }
    setIsSubmitting(true);
    setTerjadwalSubmitError(null);
    try {
      await evaluasiApi.selesai(pengajuanAktifId, { nilaiOPD: ratingOPD });
      const now = new Date().toISOString();
      setLastEvaluatedBy((prev: Record<string, LastEvaluatedEntry>) => {
        const next = { ...prev };
        for (const id of detailIdsInPengajuan) {
          next[id] = { date: now, evaluatorName: namaEvaluator };
        }
        return next;
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.evaluasiWorkspaceOpdAll,
      });
      showToast("Pengajuan berhasil diajukan ke PJ Evaluator", "success");
      onSuccess?.();
    } catch (error) {
      const err = error as Error;
      const message = err.message || "Gagal mengajukan hasil evaluasi";
      setTerjadwalSubmitError(message);
      showErrorMessages(error, message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    pengajuanAktifId,
    ratingOPD,
    detailIdsInPengajuan,
    canSubmit,
    blockingMessage,
    namaEvaluator,
    setLastEvaluatedBy,
    queryClient,
    showToast,
    onSuccess,
  ]);

  return {
    isSubmitting,
    handleSubmitAll,
    terjadwalSubmitError,
    clearTerjadwalSubmitError,
  };
}

/**
 * useEvaluasiSopByOpd hook - Fetch SOPs for evaluation by OPD
 */

import { useDetailSopList } from "@/api/sop";
import type { StatusSOP } from "@/types/dto/sop.dto";
import type { SopDetail } from "@/types/dto/sop.dto";

/** Status that indicate SOP is in evaluation workflow (server enum values) */
const EVALUASI_STATUS: StatusSOP[] = [
  "DIAJUKAN_EVALUASI",
  "SEDANG_DIEVALUASI",
  "SIAP_DIVERIFIKASI",
  "REVISI_DARI_TIM_EVALUASI",
];

/**
 * Hook to fetch SOPs that need evaluation for a specific OPD.
 * Combines detail SOP list with evaluation pengajuan data.
 */
export function useEvaluasiSopByOpd(opdId: string) {
  const { data: sopDetails = [], isLoading: isLoadingSop } = useDetailSopList({
    opdId,
  });
  const { list: pengajuanList = [], isLoading: isLoadingEvaluasi } =
    useEvaluasi();

  /** Find pengajuan that matches this OPD */
  const pengajuanOpd = useMemo(() => {
    return pengajuanList.find((p) => p.opdId === opdId);
  }, [pengajuanList, opdId]);

  /** Filter SOPs that are in evaluation workflow */
  const sopList = useMemo(() => {
    return (sopDetails as SopDetail[]).filter((sop: SopDetail) =>
      EVALUASI_STATUS.includes(sop.status),
    );
  }, [sopDetails]);

  return {
    sopList,
    pengajuan: pengajuanOpd ?? null,
    isLoading: isLoadingSop || isLoadingEvaluasi,
  };
}

/**
 * Interface for evaluation history entry
 */
export interface RiwayatEvaluasiEntry {
  tanggal: string;
  evaluator: string;
  hasil?: string;
  catatan?: string;
  nilaiOPD?: number;
}

/**
 * Hook to fetch evaluation history for a specific SOP.
 * Uses existing evaluasiApi.findAll to find completed evaluations.
 */
export function useRiwayatEvaluasiSop(sopDetailId: string): {
  data: RiwayatEvaluasiEntry[];
  isLoading: boolean;
} {
  const { list: pengajuanList, isLoading } = useEvaluasi({
    status: "SELESAI_DIEVALUASI",
  });

  const riwayat = useMemo(() => {
    if (!pengajuanList) return [];
    const entries: RiwayatEvaluasiEntry[] = [];
    for (const p of pengajuanList) {
      if (p.nilaiEvaluasi?.some((n) => n.sopDetailId === sopDetailId)) {
        const nilai = p.nilaiEvaluasi.find(
          (n) => n.sopDetailId === sopDetailId,
        );
        entries.push({
          tanggal: p.tanggalDiselesaikan ?? p.updatedAt,
          evaluator: p.diselesaikanOleh?.nama ?? "Unknown",
          hasil: nilai?.hasil ?? "SESUAI",
          catatan: nilai?.catatan ?? "",
        });
      }
    }
    return entries.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [pengajuanList, sopDetailId]);

  return { data: riwayat, isLoading };
}

/**
 * Hook to fetch evaluation history for a specific OPD.
 * Uses existing evaluasiApi.findAll to find completed evaluations for the OPD.
 */
export function useRiwayatEvaluasiOpd(opdId: string): {
  data: RiwayatEvaluasiEntry[];
  isLoading: boolean;
} {
  const { list: pengajuanList, isLoading } = useEvaluasi({
    opdId,
    status: "SELESAI_DIEVALUASI",
  });

  const riwayat = useMemo(() => {
    if (!pengajuanList) return [];
    return pengajuanList
      .map((p) => ({
        tanggal: p.tanggalDiselesaikan ?? p.updatedAt,
        evaluator: p.diselesaikanOleh?.nama ?? "Unknown",
        hasil: "SESUAI" as const,
        catatan: p.catatan ?? "",
        nilaiOPD: p.nilaiOPD,
      }))
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [pengajuanList]);

  return { data: riwayat, isLoading };
}

/**
 * usePengajuanEvaluasiAktif Hook
 * Finds the active evaluation submission (SEDANG_DIEVALUASI) for an OPD
 */

export interface UsePengajuanEvaluasiAktifReturn {
  /** Pengajuan ID (null if no active pengajuan) */
  pengajuanId: string | null;
  /** Full pengajuan data */
  pengajuan: {
    id: string;
    status: string;
    nilaiEvaluasi: NilaiEvaluasi[];
  } | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Get current version for a SOP detail */
  getCurrentVersion: (sopDetailId: string) => number;
}

/**
 * Pilih pengajuan yang masih bisa dinilai evaluator (selaras workspace + PATCH nilai).
 */
function pickPengajuanAktifUntukEvaluator(
  list: PengajuanEvaluasi[],
): PengajuanEvaluasi | null {
  const aktif = list.filter(
    (p) =>
      p.status === "SEDANG_DIEVALUASI" || p.status === "MENUNGGU_EVALUASI",
  );
  if (aktif.length === 0) {
    return null;
  }
  return (
    [...aktif].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}

/**
 * Hook to find active evaluation submission for an OPD
 * @param opdId - OPD ID to find active pengajuan for
 */
export function usePengajuanEvaluasiAktif(
  opdId?: string,
  workspacePengajuanAktif?: EvaluasiWorkspacePengajuanAktif | null,
): UsePengajuanEvaluasiAktifReturn {
  /** Hanya pakai bundel workspace bila server mengirim objek pengajuan; `null` = muat ulang via GET /evaluasi. */
  const fromWorkspace =
    workspacePengajuanAktif !== undefined && workspacePengajuanAktif !== null;
  const {
    list: pengajuanList,
    isLoading,
    error,
  } = useEvaluasi({
    opdId,
    enabled: Boolean(opdId) && !fromWorkspace,
  });

  const activePengajuan = useMemo(() => {
    if (fromWorkspace) {
      const p = workspacePengajuanAktif!;
      return {
        id: p.id,
        status: p.status,
        nilaiEvaluasi: p.nilaiPerDetail.map(
          (n): NilaiEvaluasi => ({
            id: `ws-${n.detailSopId}`,
            pengajuanEvaluasiId: p.id,
            sopDetailId: n.detailSopId,
            hasil: n.hasil ?? undefined,
            catatan: n.catatan ?? undefined,
            version: n.version,
            createdAt: "",
            updatedAt: "",
          }),
        ),
      };
    }
    if (!pengajuanList || pengajuanList.length === 0) {
      return null;
    }
    return pickPengajuanAktifUntukEvaluator(pengajuanList);
  }, [fromWorkspace, workspacePengajuanAktif, pengajuanList]);

  const getCurrentVersion = (detailId: string): number => {
    if (!activePengajuan?.nilaiEvaluasi) {
      return 0;
    }
    const nilai = activePengajuan.nilaiEvaluasi.find((n) => n.sopDetailId === detailId);
    return nilai?.version ?? 0;
  };

  return {
    pengajuanId: activePengajuan?.id ?? null,
    pengajuan: activePengajuan
      ? {
          id: activePengajuan.id,
          status: activePengajuan.status,
          nilaiEvaluasi: activePengajuan.nilaiEvaluasi ?? [],
        }
      : null,
    isLoading: fromWorkspace ? false : isLoading,
    error: fromWorkspace ? null : error,
    getCurrentVersion,
  };
}

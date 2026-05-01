/**
 * Evaluasi API service
 * Matches server: EvaluasiController
 */

import { apiClient } from '@/lib/api/api-client'
import type {
  NilaiEvaluasi,
  PengajuanEvaluasi,
} from '@/types/dto/evaluasi.dto'
import type {
  CreatePengajuanEvaluasiDto,
  EvaluasiListQueryParams,
  IsiNilaiEvaluasiDto,
  RekapEvaluasiApiResponse,
  SelesaiEvaluasiDto,
} from '@/types/dto/evaluasi.dto'

export const evaluasiApi = {
  findAll: (params?: EvaluasiListQueryParams) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<PengajuanEvaluasi[]>(`/evaluasi${query}`)
  },

  findById: (id: string) =>
    apiClient.get<PengajuanEvaluasi>(`/evaluasi/${id}`),

  create: (payload: CreatePengajuanEvaluasiDto) =>
    apiClient.post<PengajuanEvaluasi>('/evaluasi', payload),

  isiNilai: (
    pengajuanEvaluasiId: string,
    sopDetailId: string,
    payload: IsiNilaiEvaluasiDto,
  ) =>
    apiClient.patch<NilaiEvaluasi>(
      `/evaluasi/${pengajuanEvaluasiId}/nilai/${sopDetailId}`,
      payload,
    ),

  selesai: (
    pengajuanEvaluasiId: string,
    payload: SelesaiEvaluasiDto,
  ) =>
    apiClient.patch<PengajuanEvaluasi>(
      `/evaluasi/${pengajuanEvaluasiId}/selesai`,
      payload,
    ),

  update: (id: string, payload: Partial<PengajuanEvaluasi>) =>
    apiClient.patch<PengajuanEvaluasi>(`/evaluasi/${id}`, payload),

  rekap: async (tahun?: number) => {
    const query = tahun ? `?tahun=${tahun}` : ''
    const response = await apiClient.get<RekapEvaluasiApiResponse>(`/evaluasi/rekap${query}`)

    // Transform server response to RekapEvaluasi[] format
    if (!response || !response.opd) return []

    return response.opd.map(opd => {
      // Calculate completion rate
      const completionRate = opd.total > 0 ? Math.round((opd.selesai / opd.total) * 100) : 0

      // Transform pengajuanDetails to detail format
      const detail = opd.pengajuanDetails.map(p => ({
        pengajuanEvaluasiId: p.pengajuanEvaluasiId,
        jenis: p.jenis,
        status: p.status,
        nilaiOPD: p.nilaiOPD,
        tanggalEvaluasi: p.tanggalEvaluasi ?? '',
        detailSopCount: p.detailSopCount,
        hasilEvaluasi: p.hasilEvaluasi,
        // Computed fields for compatibility
        opdId: opd.opdId,
        opdNama: opd.opdNama,
        totalPengajuan: opd.total,
        nilaiRataRata: opd.nilaiRataRata ?? undefined,
      }))

      return {
        opdId: opd.opdId,
        opdNama: opd.opdNama,
        tahun: response.tahun,
        totalPengajuan: opd.total,
        totalTerjadwal: opd.pengajuanDetails.filter(p => p.jenis === 'TERJADWAL').length,
        totalMandiri: opd.pengajuanDetails.filter(p => p.jenis === 'MANDIRI').length,
        nilaiRataRata: opd.nilaiRataRata ?? undefined,
        completionRate,
        detail,
      }
    })
  },
}

/**
 * useEvaluasi hook - TanStack Query
 * Matches server: EvaluasiService endpoints
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  CreatePengajuanEvaluasiDto,
  EvaluasiListQueryParams,
  IsiNilaiEvaluasiMutationDto,
  SelesaiEvaluasiMutationDto,
} from "@/types/dto/evaluasi.dto";
import type { StatusHasilEvaluasi } from "@/types/dto/evaluasi.dto";

// ==================== Evaluasi Domain Logic ====================
export const STATUS_HASIL_EVALUASI = {
  SESUAI: "SESUAI",
  TIDAK_SESUAI: "TIDAK_SESUAI",
} as const;

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

// ==================== Evaluasi Hooks ====================
export function useEvaluasi(params?: EvaluasiListQueryParams) {
  const {
    data: list = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.evaluasiList(params),
    queryFn: () => evaluasiApi.findAll(params),
    staleTime: STALE_TIME.MEDIUM,
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
    invalidateKeys: [queryKeys.evaluasi],
    successMessage: "Hasil evaluasi berhasil disimpan",
    errorMessagePrefix: "Gagal menyimpan hasil evaluasi",
  });
}

export function useSelesaiEvaluasi() {
  return useMutationWithToast({
    mutationFn: ({ pengajuanEvaluasiId, payload }: SelesaiEvaluasiMutationDto) =>
      evaluasiApi.selesai(pengajuanEvaluasiId, payload),
    invalidateKeys: [queryKeys.evaluasi],
    successMessage: "Evaluasi berhasil diselesaikan",
    errorMessagePrefix: "Gagal menyelesaikan evaluasi",
  });
}

export function useRekapEvaluasi(tahun?: number) {
  return useQuery({
    queryKey: queryKeys.evaluasiRekap(tahun),
    queryFn: () => evaluasiApi.rekap(tahun),
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

import { useState, useCallback, useRef, useEffect, useMemo } from "react";

import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import type { StatusHasilEvaluasi } from "@/types/dto/evaluasi.dto";

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
): UseEvaluasiDraftReturn {
  // Fetch active pengajuan evaluasi
  const {
    pengajuanId,
    pengajuan,
    isLoading: isLoadingPengajuan,
    getCurrentVersion,
  } = usePengajuanEvaluasiAktif(opdId);

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
    invalidateKeys: [queryKeys.evaluasi],
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
    if (!pengajuanId || !sopDetailId || isLoadingPengajuan) return;
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
 * useEvaluasiSubmit Hook
 * Manages batch SOP evaluation submission with check-all state.
 * Uses evaluasiApi.isiNilai() + evaluasiApi.selesai() for real API calls.
 */

import { useState, useCallback, useMemo } from "react";
import { useToast, showErrorMessages } from "@/hooks/useToast";
import type { StatusHasilEvaluasi } from "@/types/dto/evaluasi.dto";

export interface EvaluasiBatchSubmitError {
  kind: "none" | "no_selection" | "incomplete";
  items: { id: string; judul: string; nomorSOP: string }[];
  sopId?: string;
  message?: string;
}

export interface EvaluasiSubmitItem {
  id: string;
  judul: string;
  nomorSOP: string;
  hasil: StatusHasilEvaluasi;
  komentarEvaluasi: string;
}

interface LastEvaluatedEntry {
  date: string;
  evaluatorName: string;
}

interface UseEvaluasiSubmitConfig {
  sedangDievaluasiList: EvaluasiSubmitItem[];
  namaEvaluator: string;
  ratingOPD: number | null;
  opdId?: string;
  setLastEvaluatedBy: React.Dispatch<React.SetStateAction<Record<string, LastEvaluatedEntry>>>;
  onSuccess?: () => void;
}

export function useEvaluasiSubmit(config: UseEvaluasiSubmitConfig) {
  const {
    sedangDievaluasiList,
    namaEvaluator,
    ratingOPD,
    setLastEvaluatedBy,
    onSuccess,
  } = config;
  const { showToast } = useToast();
  const [submitSelectedIds, setSubmitSelectedIds] = useState<Set<string>>(
    new Set(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terjadwalSubmitError, setTerjadwalSubmitError] = useState<
    string | null
  >(null);

  const isSubmitCheckAll = useMemo(
    () =>
      sedangDievaluasiList.length > 0 &&
      submitSelectedIds.size === sedangDievaluasiList.length,
    [sedangDievaluasiList, submitSelectedIds],
  );

  const isSubmitCheckAllIndeterminate = useMemo(
    () =>
      submitSelectedIds.size > 0 &&
      submitSelectedIds.size < sedangDievaluasiList.length,
    [sedangDievaluasiList, submitSelectedIds],
  );

  const toggleSubmitSelected = useCallback((id: string) => {
    setSubmitSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setSubmitCheckAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSubmitSelectedIds(new Set(sedangDievaluasiList.map((i) => i.id)));
      } else {
        setSubmitSelectedIds(new Set());
      }
    },
    [sedangDievaluasiList],
  );

  const clearTerjadwalSubmitError = useCallback(() => {
    setTerjadwalSubmitError(null);
  }, []);

  const handleSubmitAll = useCallback(
    async (pengajuanId?: string) => {
      if (submitSelectedIds.size === 0) return;

      const selected = sedangDievaluasiList.filter((i) =>
        submitSelectedIds.has(i.id),
      );
      if (selected.length === 0) return;

      setIsSubmitting(true);
      setTerjadwalSubmitError(null);

      try {
        if (pengajuanId) {
          // Submit each SOP evaluation via API
          for (const item of selected) {
            await evaluasiApi.isiNilai(pengajuanId, item.id, {
              hasil: item.hasil,
              catatan: item.komentarEvaluasi || undefined,
              version: 0,
            });
          }

          // If ratingOPD is set, complete the evaluation
          if (ratingOPD != null) {
            await evaluasiApi.selesai(pengajuanId, {
              nilaiOPD: ratingOPD,
            });
          }
        }

        // Update local state to mark as evaluated
        const now = new Date().toISOString();
        setLastEvaluatedBy((prev: Record<string, LastEvaluatedEntry>) => {
          const next = { ...prev };
          for (const item of selected) {
            next[item.id] = { date: now, evaluatorName: namaEvaluator };
          }
          return next;
        });

        showToast(`${selected.length} SOP berhasil dievaluasi`, "success");
        onSuccess?.();
      } catch (error) {
        const err = error as Error;
        const message = err.message || "Gagal mengirim evaluasi";
        setTerjadwalSubmitError(message);
        showErrorMessages(error, message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      submitSelectedIds,
      sedangDievaluasiList,
      namaEvaluator,
      ratingOPD,
      setLastEvaluatedBy,
      onSuccess,
      showToast,
    ],
  );

  return {
    submitSelectedIds,
    setSubmitSelectedIds,
    isSubmitting,
    isSubmitCheckAll,
    isSubmitCheckAllIndeterminate,
    toggleSubmitSelected,
    setSubmitCheckAll,
    handleSubmitAll,
    terjadwalSubmitError,
    clearTerjadwalSubmitError,
  };
}

/**
 * useEvaluasiSopByOpd hook - Fetch SOPs for evaluation by OPD
 */

import { useMemo } from "react";
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
        id: p.id,
        tanggal: p.tanggalDiselesaikan ?? p.updatedAt,
        evaluator: p.diselesaikanOleh?.nama ?? "Unknown",
        hasil: "SESUAI" as const,
        catatan: p.catatan ?? "",
      }))
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [pengajuanList]);

  return { data: riwayat, isLoading };
}

/**
 * usePengajuanEvaluasiAktif Hook
 * Finds the active evaluation submission (SEDANG_DIEVALUASI) for an OPD
 */

import { useMemo } from "react";
import type { NilaiEvaluasi } from "@/types/dto/evaluasi.dto";

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
 * Hook to find active evaluation submission for an OPD
 * @param opdId - OPD ID to find active pengajuan for
 */
export function usePengajuanEvaluasiAktif(
  opdId?: string,
): UsePengajuanEvaluasiAktifReturn {
  const {
    list: pengajuanList,
    isLoading,
    error,
  } = useEvaluasi({
    opdId,
    status: "SEDANG_DIEVALUASI",
  });

  // Find the first active pengajuan
  const activePengajuan = useMemo(() => {
    if (!pengajuanList || pengajuanList.length === 0) return null;
    return pengajuanList[0] ?? null;
  }, [pengajuanList]);

  // Helper to get current version for optimistic locking
  const getCurrentVersion = (sopDetailId: string): number => {
    if (!activePengajuan?.nilaiEvaluasi) return 0;
    const nilai = activePengajuan.nilaiEvaluasi.find(
      (n) => n.sopDetailId === sopDetailId,
    );
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
    isLoading,
    error,
    getCurrentVersion,
  };
}

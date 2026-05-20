import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { showErrorMessages, useToast } from "@/hooks/useToast";
import { evaluasiApi } from "@/api/evaluasi-client";
import { STATUS_HASIL_EVALUASI } from "@/types/dto/evaluasi.dto";
import { usePengajuanEvaluasiAktif } from "@/lib/evaluasi/hooks/evaluasi-derived-hooks";
import type { TahapPenilaianSop } from "@/lib/evaluasi/evaluasi-domain";
import type {
  EvaluasiWorkspacePengajuanAktif,
  SelesaiEvaluasiDto,
  StatusHasilEvaluasi,
} from "@/types/dto/evaluasi.dto";

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
  readOnly = false,
  tahapPenilaian?: TahapPenilaianSop,
): UseEvaluasiDraftReturn {
  const {
    pengajuanId,
    pengajuan,
    isLoading: isLoadingPengajuan,
    getCurrentVersion,
  } = usePengajuanEvaluasiAktif(opdId, workspacePengajuanAktif);

  const sopDetailId = useMemo(() => {
    if (!pengajuan || !sopId) return null;
    const sopInPengajuan = pengajuan.nilaiEvaluasi?.find(
      (n) => n.sopDetail?.id === sopId,
    );
    const sopInList = pengajuan.nilaiEvaluasi?.find(
      (n) => n.sopDetailId === sopId,
    );
    return sopInPengajuan?.sopDetailId ?? sopInList?.sopDetailId ?? null;
  }, [pengajuan, sopId]);

  const existingNilai = useMemo(() => {
    if (!pengajuan || !sopDetailId) return null;
    return (
      pengajuan.nilaiEvaluasi?.find((n) => n.sopDetailId === sopDetailId) ??
      null
    );
  }, [pengajuan, sopDetailId]);

  const [statusEvaluasi, setStatusEvaluasiState] =
    useState<StatusHasilEvaluasi | null>(existingNilai?.hasil ?? null);
  const [komentarEvaluasi, setKomentarEvaluasiState] = useState<string>(
    existingNilai?.catatan ?? "",
  );

  const isTinjauanUlang = tahapPenilaian === "tinjauan_ulang";
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmittedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isTinjauanUlang) {
      setStatusEvaluasiState(null);
      setKomentarEvaluasiState("");
      lastSubmittedRef.current = null;
      return;
    }
    setStatusEvaluasiState(existingNilai?.hasil ?? null);
    setKomentarEvaluasiState(existingNilai?.catatan ?? "");
  }, [existingNilai?.hasil, existingNilai?.catatan, sopDetailId, isTinjauanUlang]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

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
    invalidateKeys: [
      queryKeys.evaluasi,
      queryKeys.evaluasiWorkspaceOpdAll,
      queryKeys.evaluasiWorkspacePengajuanAll,
      queryKeys.evaluasiRingkasAll,
    ],
    successMessage: "Draft evaluasi berhasil disimpan",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal menyimpan draft evaluasi",
  });

  const triggerAutoSave = useCallback(() => {
    if (readOnly) {
      return;
    }
    if (!pengajuanId || !sopDetailId || isLoadingPengajuan) {
      return;
    }
    if (statusEvaluasi == null) return;
    if (
      statusEvaluasi === STATUS_HASIL_EVALUASI.PERLU_PERBAIKAN &&
      komentarEvaluasi.trim().length === 0
    ) {
      return;
    }

    const existingHasil = isTinjauanUlang
      ? null
      : (existingNilai?.hasil ?? null);
    const existingCatatan = isTinjauanUlang
      ? ""
      : (existingNilai?.catatan ?? "").trim();
    if (
      statusEvaluasi === existingHasil &&
      komentarEvaluasi.trim() === existingCatatan
    ) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const currentStatus = statusEvaluasi;
    const currentKomentar = komentarEvaluasi;

    autoSaveTimerRef.current = setTimeout(() => {
      const version = sopDetailId ? getCurrentVersion(sopDetailId) : null;
      const signature = JSON.stringify({
        sopDetailId,
        status: currentStatus,
        komentar: currentKomentar.trim(),
        version,
      });
      if (lastSubmittedRef.current === signature) {
        return;
      }
      lastSubmittedRef.current = signature;
      saveDraftMutation.mutate({
        status: currentStatus,
        komentar: currentKomentar,
      });
    }, AUTO_SAVE_DELAY_MS);
  }, [
    readOnly,
    pengajuanId,
    sopDetailId,
    isLoadingPengajuan,
    statusEvaluasi,
    komentarEvaluasi,
    saveDraftMutation,
    existingNilai?.hasil,
    existingNilai?.catatan,
    getCurrentVersion,
    isTinjauanUlang,
  ]);

  const setStatusEvaluasi = useCallback((status: StatusHasilEvaluasi | null) => {
    setStatusEvaluasiState(status);
  }, []);

  const setKomentarEvaluasi = useCallback((komentar: string) => {
    setKomentarEvaluasiState(komentar);
  }, []);

  useEffect(() => {
    triggerAutoSave();
  }, [triggerAutoSave]);

  const saveDraft = useCallback(() => {
    if (readOnly) {
      return;
    }
    if (!pengajuanId || !sopDetailId || statusEvaluasi == null) {
      return;
    }
    if (
      statusEvaluasi === STATUS_HASIL_EVALUASI.PERLU_PERBAIKAN &&
      komentarEvaluasi.trim().length === 0
    ) {
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
    readOnly,
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

interface UseEvaluasiSubmitConfig {
  pengajuanAktifId: string | undefined;
  ratingOPD: number | null;
  /** false untuk pengajuan MANDIRI — PATCH selesai tanpa nilaiOPD. */
  requiresNilaiOpd: boolean;
  canSubmit: boolean;
  blockingMessage: string | null;
  onSuccess?: () => void;
}

export function useEvaluasiSubmit(config: UseEvaluasiSubmitConfig) {
  const {
    pengajuanAktifId,
    ratingOPD,
    requiresNilaiOpd,
    canSubmit,
    blockingMessage,
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
    if (requiresNilaiOpd && (ratingOPD === null || ratingOPD < 1 || ratingOPD > 5)) {
      setTerjadwalSubmitError("Isi skor evaluasi OPD (1–5) di tab Evaluasi OPD.");
      return;
    }
    setIsSubmitting(true);
    setTerjadwalSubmitError(null);
    try {
      const payload: SelesaiEvaluasiDto = requiresNilaiOpd
        ? { nilaiOPD: ratingOPD! }
        : {};
      await evaluasiApi.selesai(pengajuanAktifId, payload);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.evaluasiWorkspaceOpdAll,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.evaluasiWorkspacePengajuanAll,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.evaluasiRingkasAll,
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
    requiresNilaiOpd,
    canSubmit,
    blockingMessage,
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

/**
 * useEvaluasi hook - TanStack Query
 * Matches server: EvaluasiService endpoints
 */

import { useQuery } from "@tanstack/react-query";
import { evaluasiApi } from "../services/evaluasi.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
} from "../types/evaluasi";
import type { StatusHasilEvaluasi } from "@/types/common";

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
export function useEvaluasi(params?: {
  opdId?: string;
  status?: string;
  jenis?: string;
}) {
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
    }: {
      pengajuanEvaluasiId: string;
      sopDetailId: string;
      payload: IsiNilaiEvaluasiDto;
    }) => evaluasiApi.isiNilai(pengajuanEvaluasiId, sopDetailId, payload),
    invalidateKeys: [queryKeys.evaluasi],
    successMessage: "Hasil evaluasi berhasil disimpan",
    errorMessagePrefix: "Gagal menyimpan hasil evaluasi",
  });
}

export function useSelesaiEvaluasi() {
  return useMutationWithToast({
    mutationFn: ({
      pengajuanEvaluasiId,
      payload,
    }: {
      pengajuanEvaluasiId: string;
      payload: SelesaiEvaluasiDto;
    }) => evaluasiApi.selesai(pengajuanEvaluasiId, payload),
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

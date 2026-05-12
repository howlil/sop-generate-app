/**
 * TTE (Tanda Tangan Elektronik) API — mirror Nest `/tte` (bungkus `{ message, success, data }`).
 */

import { apiClient } from "@/lib/api/api-client";
import type { ApiSuccessResponse } from "@/types/dto/auth.dto";
import type {
  RegisterTteDto,
  RiwayatTandaTangan,
  TtePengesahanPublic,
  TteProfil,
  TandaTanganiBaDto,
  TandaTanganiBaMutationDto,
  TandaTanganiSopDto,
  TandaTanganiSopPengajuanDto,
  TandaTanganiSopPengajuanMutationDto,
  TandaTanganiSopPengajuanResponse,
  TandaTanganiSopMutationDto,
} from "@/types/dto/tte.dto";

async function unwrapTte<T>(promise: Promise<ApiSuccessResponse<T>>): Promise<T> {
  const envelope = await promise;
  return envelope.data as T;
}

export const tteApi = {
  getProfil: () =>
    unwrapTte<TteProfil | null>(
      apiClient.get<ApiSuccessResponse<TteProfil | null>>("/tte/profil"),
    ),

  registerProfil: (payload: RegisterTteDto) =>
    unwrapTte<TteProfil>(
      apiClient.post<ApiSuccessResponse<TteProfil>>("/tte/profil", payload),
    ),

  mintTokenVerifikasi: () =>
    unwrapTte<{ token: string }>(
      apiClient.post<ApiSuccessResponse<{ token: string }>>(
        "/tte/profil/verifikasi-email",
      ),
    ),

  konfirmasiEmail: (token: string) =>
    unwrapTte<{ message: string }>(
      apiClient.get<ApiSuccessResponse<{ message: string }>>(
        `/tte/profil/verifikasi-email?token=${encodeURIComponent(token)}`,
      ),
    ),

  getSigningHistory: () =>
    unwrapTte<RiwayatTandaTangan[]>(
      apiClient.get<ApiSuccessResponse<RiwayatTandaTangan[]>>("/tte/riwayat"),
    ),

  /** Verifikasi pengesahan (publik, tanpa login). */
  getPengesahanPublic: (dokumenTteId: string, userId: string) =>
    unwrapTte<TtePengesahanPublic>(
      apiClient.get<ApiSuccessResponse<TtePengesahanPublic>>(
        `/tte/public/pengesahan/${encodeURIComponent(dokumenTteId)}/${encodeURIComponent(userId)}`,
      ),
    ),

  tandaTanganiBA: (pengajuanId: string, payload: TandaTanganiBaDto) =>
    unwrapTte<RiwayatTandaTangan>(
      apiClient.post<ApiSuccessResponse<RiwayatTandaTangan>>(
        `/tte/tanda-tangani/ba/${pengajuanId}`,
        payload,
      ),
    ),

  tandaTanganiSOP: (sopDetailId: string, payload: TandaTanganiSopDto) =>
    unwrapTte<RiwayatTandaTangan>(
      apiClient.post<ApiSuccessResponse<RiwayatTandaTangan>>(
        `/tte/tanda-tangani/sop/${sopDetailId}`,
        payload,
      ),
    ),

  tandaTanganiSemuaSopPengajuan: (
    pengajuanId: string,
    payload: TandaTanganiSopPengajuanDto,
  ) =>
    unwrapTte<TandaTanganiSopPengajuanResponse>(
      apiClient.post<ApiSuccessResponse<TandaTanganiSopPengajuanResponse>>(
        `/tte/tanda-tangani/pengajuan/${pengajuanId}/sop-semua`,
        payload,
      ),
    ),
};

/**
 * useTTE hook - TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";

export function useTTEProfil() {
  return useQuery({
    queryKey: queryKeys.tteProfil,
    queryFn: () => tteApi.getProfil(),
    staleTime: STALE_TIME.MEDIUM,
    retry: false,
  });
}

export function useTtePengesahanPublic(dokumenTteId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.ttePengesahanPublic(dokumenTteId, userId),
    queryFn: () => tteApi.getPengesahanPublic(dokumenTteId, userId),
    staleTime: STALE_TIME.LONG,
    retry: false,
  });
}

export function useRegisterTTE() {
  return useMutationWithToast({
    mutationFn: (payload: RegisterTteDto) => tteApi.registerProfil(payload),
    invalidateKeys: [queryKeys.tteProfil, queryKeys.tteRiwayat],
    successMessage: "Kredensial TTE berhasil didaftarkan",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal mendaftarkan kredensial TTE",
  });
}

export function useTandaTanganiBA(options?: {
  isPjPenyusun?: boolean;
  /** Mengganti pesan sukses bawaan (satu sumber toast; jangan panggil showToast lagi setelah mutateAsync). */
  successMessage?: string;
}) {
  const defaultSuccessPjPenyusun =
    "Berita Acara berhasil ditandatangani oleh PJ Penyusun.";
  const defaultSuccessEvaluator = "Berita Acara berhasil ditandatangani";
  const successMessage =
    options?.successMessage ??
    (options?.isPjPenyusun ? defaultSuccessPjPenyusun : defaultSuccessEvaluator);
  return useMutationWithToast({
    mutationFn: ({ pengajuanId, payload }: TandaTanganiBaMutationDto) =>
      tteApi.tandaTanganiBA(pengajuanId, payload),
    invalidateKeys: [
      queryKeys.evaluasi,
      queryKeys.tteRiwayat,
      queryKeys.evaluasiWorkspaceOpdAll,
    ],
    successMessage,
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal menandatangani Berita Acara",
  });
}

export function useTandaTanganiSOP() {
  return useMutationWithToast({
    mutationFn: ({ sopDetailId, payload }: TandaTanganiSopMutationDto) =>
      tteApi.tandaTanganiSOP(sopDetailId, payload),
    invalidateKeys: [
      queryKeys.sop,
      queryKeys.evaluasi,
      queryKeys.tteRiwayat,
      queryKeys.detailSop,
    ],
    successMessage: "SOP berhasil disahkan (TTE simulasi / format selaras BSRE).",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal mengesahkan SOP",
  });
}

export function useTandaTanganiSopPengajuan() {
  return useMutationWithToast({
    mutationFn: ({ pengajuanId, payload }: TandaTanganiSopPengajuanMutationDto) =>
      tteApi.tandaTanganiSemuaSopPengajuan(pengajuanId, payload),
    invalidateKeys: [
      queryKeys.sop,
      queryKeys.evaluasi,
      queryKeys.tteRiwayat,
      queryKeys.detailSop,
      queryKeys.evaluasiWorkspaceOpdAll,
    ],
    successMessage: "Seluruh SOP dalam pengajuan berhasil ditandatangani.",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal menandatangani seluruh SOP pengajuan",
  });
}

// ==================== Pin Confirmation Handler Utility ====================
/**
 * Membuat handler konfirmasi PIN untuk penandatanganan TTE.
 */
export function createPinConfirmHandler<T>(
  mutateAsync: (vars: T) => Promise<unknown>,
  buildPayload: (pin: string) => T,
  onSuccess?: () => void,
) {
  return async (pin: string): Promise<boolean> => {
    try {
      await mutateAsync(buildPayload(pin));
      onSuccess?.();
      return true;
    } catch {
      return false;
    }
  };
}

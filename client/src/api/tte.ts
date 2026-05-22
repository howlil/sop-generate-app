/**
 * TTE (Tanda Tangan Elektronik) API — mirror Nest `/tte` (bungkus `{ message, success, data }`).
 */

import { apiClient } from "@/lib/api/api-client";
import { unwrapApiData } from "@/lib/api/response";
import type { ApiSuccessResponse } from "@/types/dto/auth.dto";
import type {
  RegisterTteDto,
  UpdateTtePinDto,
  RiwayatTandaTangan,
  SignPdfDto,
  SignPdfResponse,
  TtePengesahanPublic,
  TteProfil,
  TandaTanganiBaDto,
  TandaTanganiBaMutationDto,
  TandaTanganiSopPengajuanDto,
  TandaTanganiSopPengajuanMutationDto,
  TandaTanganiSopPengajuanResponse,
} from "@/types/dto/tte.dto";

export const tteApi = {
  getProfil: () =>
    unwrapApiData<TteProfil | null>(
      apiClient.get<ApiSuccessResponse<TteProfil | null>>("/tte/profil"),
    ),

  registerProfil: (payload: RegisterTteDto) =>
    unwrapApiData<TteProfil>(
      apiClient.post<ApiSuccessResponse<TteProfil>>("/tte/profil", payload),
    ),

  updateProfilPin: (payload: UpdateTtePinDto) =>
    unwrapApiData<TteProfil>(
      apiClient.patch<ApiSuccessResponse<TteProfil>>("/tte/profil/pin", payload),
    ),

  mintTokenVerifikasi: () =>
    unwrapApiData<{ token: string }>(
      apiClient.post<ApiSuccessResponse<{ token: string }>>(
        "/tte/profil/verifikasi-email",
      ),
    ),

  konfirmasiEmail: (token: string) =>
    unwrapApiData<{ message: string }>(
      apiClient.get<ApiSuccessResponse<{ message: string }>>(
        `/tte/profil/verifikasi-email?token=${encodeURIComponent(token)}`,
      ),
    ),

  signPdf: (payload: SignPdfDto) =>
    unwrapApiData<SignPdfResponse>(
      apiClient.post<ApiSuccessResponse<SignPdfResponse>>("/tte/pdf/sign", payload),
    ),

  /** Verifikasi pengesahan (publik, tanpa login). */
  getPengesahanPublic: (dokumenTteId: string, userId: string) =>
    unwrapApiData<TtePengesahanPublic>(
      apiClient.get<ApiSuccessResponse<TtePengesahanPublic>>(
        `/tte/public/pengesahan/${encodeURIComponent(dokumenTteId)}/${encodeURIComponent(userId)}`,
      ),
    ),

  tandaTanganiBA: (pengajuanId: string, payload: TandaTanganiBaDto) =>
    unwrapApiData<RiwayatTandaTangan>(
      apiClient.post<ApiSuccessResponse<RiwayatTandaTangan>>(
        `/tte/tanda-tangani/ba/${pengajuanId}`,
        payload,
      ),
    ),

  tandaTanganiSemuaSopPengajuan: (
    pengajuanId: string,
    payload: TandaTanganiSopPengajuanDto,
  ) =>
    unwrapApiData<TandaTanganiSopPengajuanResponse>(
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

export function useTTEProfil(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.tteProfil,
    queryFn: () => tteApi.getProfil(),
    staleTime: STALE_TIME.MEDIUM,
    retry: false,
    enabled: options?.enabled ?? true,
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
    invalidateKeys: [queryKeys.tteProfil, queryKeys.auth],
    successMessage: "PIN TTE berhasil diatur",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal mengatur PIN TTE",
  });
}

export function useUpdateTTEPin() {
  return useMutationWithToast({
    mutationFn: (payload: UpdateTtePinDto) => tteApi.updateProfilPin(payload),
    invalidateKeys: [queryKeys.tteProfil, queryKeys.auth],
    successMessage: "PIN TTE berhasil diperbarui",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal memperbarui PIN TTE",
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
      queryKeys.evaluasiWorkspaceOpdAll,
    ],
    successMessage,
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal menandatangani Berita Acara",
  });
}

export function useTandaTanganiSopPengajuan() {
  return useMutationWithToast({
    mutationFn: ({ pengajuanId, payload }: TandaTanganiSopPengajuanMutationDto) =>
      tteApi.tandaTanganiSemuaSopPengajuan(pengajuanId, payload),
    invalidateKeys: [
      queryKeys.sop,
      queryKeys.evaluasi,
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

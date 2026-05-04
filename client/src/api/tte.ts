/**
 * TTE (Tanda Tangan Elektronik) API service
 */

import { apiClient } from "@/lib/api/api-client";
import type {
  KredensialTTE,
  RiwayatTandaTangan,
} from "@/types/dto/tte.dto";
import type {
  RegisterTteDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
} from "@/types/dto/tte.dto";

export const tteApi = {
  getProfil: () => apiClient.get<KredensialTTE>("/tte/profil"),

  registerProfil: (payload: RegisterTteDto) =>
    apiClient.post<KredensialTTE>("/tte/profil", payload),

  mintTokenVerifikasi: () =>
    apiClient.post<{ token: string }>("/tte/profil/verifikasi-email"),

  konfirmasiEmail: (token: string) =>
    apiClient.get<{ message: string }>(
      `/tte/profil/verifikasi-email?token=${token}`,
    ),

  getSigningHistory: () => apiClient.get<RiwayatTandaTangan[]>("/tte/riwayat"),

  tandaTanganiBA: (pengajuanId: string, payload: TandaTanganiBaDto) =>
    apiClient.post<RiwayatTandaTangan>(
      `/tte/tanda-tangani/ba/${pengajuanId}`,
      payload,
    ),

  tandaTanganiSOP: (sopDetailId: string, payload: TandaTanganiSopDto) =>
    apiClient.post<RiwayatTandaTangan>(
      `/tte/tanda-tangani/sop/${sopDetailId}`,
      payload,
    ),
};

/**
 * useTTE hook - TanStack Query
 * Matches server: TTEService endpoints
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  RegisterTteDto,
  TandaTanganiBaMutationDto,
  TandaTanganiSopMutationDto,
} from "@/types/dto/tte.dto";

export function useTTEProfil() {
  return useQuery({
    queryKey: queryKeys.tteProfil,
    queryFn: () => tteApi.getProfil(),
    staleTime: STALE_TIME.MEDIUM,
    retry: false,
  });
}

export function useRegisterTTE() {
  return useMutationWithToast({
    mutationFn: (payload: RegisterTteDto) => tteApi.registerProfil(payload),
    invalidateKeys: [queryKeys.tteProfil],
    successMessage: "Kredensial TTE berhasil didaftarkan",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal mendaftarkan kredensial TTE",
  });
}

export function useMintTokenVerifikasi() {
  return useMutationWithToast({
    mutationFn: () => tteApi.mintTokenVerifikasi(),
    successMessage: "Token verifikasi berhasil dibuat",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal membuat token verifikasi",
  });
}

export function useTandaTanganiBA(options?: {
  isKoordinator?: boolean;
  /** Mengganti pesan sukses bawaan (satu sumber toast; jangan panggil showToast lagi setelah mutateAsync). */
  successMessage?: string;
}) {
  const defaultSuccessKoordinator =
    "Berita Acara berhasil ditandatangani oleh PJ Penyusun.";
  const defaultSuccessEvaluator = "Berita Acara berhasil ditandatangani";
  const successMessage =
    options?.successMessage ??
    (options?.isKoordinator ? defaultSuccessKoordinator : defaultSuccessEvaluator);
  return useMutationWithToast({
    mutationFn: ({ pengajuanId, payload }: TandaTanganiBaMutationDto) =>
      tteApi.tandaTanganiBA(pengajuanId, payload),
    invalidateKeys: [queryKeys.evaluasi],
    successMessage,
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal menandatangani Berita Acara",
  });
}

export function useTandaTanganiSOP() {
  return useMutationWithToast({
    mutationFn: ({ sopDetailId, payload }: TandaTanganiSopMutationDto) =>
      tteApi.tandaTanganiSOP(sopDetailId, payload),
    invalidateKeys: [queryKeys.sop, queryKeys.evaluasi],
    successMessage: "SOP berhasil disahkan dengan TTE BSRE.",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal mengesahkan SOP",
  });
}

// ==================== Pin Confirmation Handler Utility ====================
/**
 * Membuat handler konfirmasi PIN untuk penandatanganan TTE.
 * Membungkus `mutateAsync` dengan tanda tangan `(pin) => Promise<boolean>`.
 *
 * `onSuccess` hanya untuk efek samping UI (mis. tutup dialog dari parent, reset state).
 * Jangan memanggil `showToast` sukses di sini bila `mutateAsync` berasal dari hook
 * yang memakai `useMutationWithToast` — toast sukses/error sudah ditangani di hook.
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

// ==================== URL Helpers ====================
/** Get verification success URL with token */
export function getTTEVerificationSuccessUrl(token: string): string {
  return `/validasi/ttd-berhasil?token=${token}`;
}

/** Get validation URL for QR code */
export function getValidasiPengesahanUrl(id: string): string {
  return `${window.location.origin}/validasi/pengesahan/${id}`;
}

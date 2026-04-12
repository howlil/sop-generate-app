/**
 * useTTE hook - TanStack Query
 * Matches server: TTEService endpoints
 */

import { useQuery } from "@tanstack/react-query";
import { tteApi } from "@/features/tte/services/tte.api";
import { queryKeys } from "@/config/query-keys";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { STALE_TIME } from "@/utils/constants";
import type {
  RegisterTteDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
} from "@/features/tte/types/tte";

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

export function useTandaTanganiBA(options?: { isKoordinator?: boolean }) {
  return useMutationWithToast({
    mutationFn: ({
      pengajuanId,
      payload,
    }: {
      pengajuanId: string;
      payload: TandaTanganiBaDto;
    }) => tteApi.tandaTanganiBA(pengajuanId, payload),
    invalidateKeys: [queryKeys.evaluasi],
    successMessage: options?.isKoordinator
      ? "Berita Acara berhasil ditandatangani (Koordinator)"
      : "Berita Acara berhasil ditandatangani",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal menandatangani Berita Acara",
  });
}

export function useTandaTanganiSOP() {
  return useMutationWithToast({
    mutationFn: ({
      sopDetailId,
      payload,
    }: {
      sopDetailId: string;
      payload: TandaTanganiSopDto;
    }) => tteApi.tandaTanganiSOP(sopDetailId, payload),
    invalidateKeys: [queryKeys.sop, queryKeys.evaluasi],
    successMessage: "SOP berhasil disahkan",
    useDetailedErrors: true,
    errorMessagePrefix: "Gagal mengesahkan SOP",
  });
}

// ==================== Pin Confirmation Handler Utility ====================
/**
 * Creates a PIN confirmation handler for TTE signing.
 * Wraps a mutation's mutateAsync with a standard (pin) => Promise<boolean> signature.
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

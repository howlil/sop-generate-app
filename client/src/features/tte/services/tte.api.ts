import { apiClient } from "@/utils/api-client";
import type {
  KredensialTTE,
  RiwayatTandaTangan,
  RegisterTteDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
} from "../types/tte";

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

  koordinatorTandaTanganiBA: (
    pengajuanId: string,
    payload: TandaTanganiBaDto,
  ) =>
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

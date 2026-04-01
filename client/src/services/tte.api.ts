/**
 * TTE (Tanda Tangan Elektronik) API service
 * Matches server: TTEController
 */

import { apiClient } from './api'
import type {
  KredensialTTE,
  RiwayatTandaTangan,
  RegisterTteDto,
  VerifikasiEmailDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
} from '../types/tte'

export const tteApi = {
  /**
   * TTE-01: Get own KredensialTTE
   */
  getProfil: () =>
    apiClient.get<KredensialTTE>('/tte/profil'),

  /**
   * TTE-01: Register/update KredensialTTE
   */
  registerProfil: (payload: RegisterTteDto) =>
    apiClient.post<KredensialTTE>('/tte/profil', payload),

  /**
   * TTE-02: Request email verification token
   */
  mintTokenVerifikasi: () =>
    apiClient.post<{ token: string }>('/tte/verifikasi-email/mint'),

  /**
   * TTE-02: Confirm email with token
   */
  konfirmasiEmail: (payload: VerifikasiEmailDto) =>
    apiClient.post<{ message: string }>('/tte/verifikasi-email/konfirmasi', payload),

  /**
   * TTE-13: Get own signing history
   */
  getSigningHistory: () =>
    apiClient.get<RiwayatTandaTangan[]>('/tte/riwayat'),

  /**
   * TTE-05: Sign Berita Acara (Biro Organisasi only)
   * After signing: status → DIVERIFIKASI_BIRO, all SOP → DIVERIFIKASI_BIRO_ORGANISASI
   */
  tandaTanganiBA: (payload: TandaTanganiBaDto) =>
    apiClient.post<RiwayatTandaTangan>('/tte/tanda-tangani-ba', payload),

  /**
   * TTE-06: Sign Berita Acara (Koordinator Tim Penyusun only)
   * Only after Biro has signed
   * After signing: status → DITANDATANGANI_KOORDINATOR
   */
  koordinatorTandaTanganiBA: (payload: TandaTanganiBaDto) =>
    apiClient.post<RiwayatTandaTangan>('/tte/koordinator-tanda-tangani-ba', payload),

  /**
   * TTE-07: Sign SOP (Kepala OPD only)
   * Only after Koordinator has signed BA
   * After signing: SOP → BERLAKU
   */
  tandaTanganiSOP: (payload: TandaTanganiSopDto) =>
    apiClient.post<RiwayatTandaTangan>('/tte/tanda-tangani-sop', payload),
}

/**
 * Jabatan API service — Kepala OPD jabatan management
 */

import { apiClient } from '@/utils/api-client'

export interface JabatanUser {
  id: string
  nama: string
  nip: string
  jabatan: string
  opdId: string | null
  email: string
  nohp: string
  peran: string
  isActive: boolean
  updatedAt: string
  totalSopDisusun: number
}

export const jabatanApi = {
  /** Set a user as Kepala OPD (deactivates current one if any) */
  setKepalaAktif: (userId: string, opdId: string) =>
    apiClient.post<JabatanUser>('/users/jabatan/set-kepala-aktif', { userId, opdId }),

  /** End a Kepala OPD's tenure */
  akhiriJabatan: (userId: string) =>
    apiClient.post<JabatanUser>(`/users/jabatan/akhiri/${userId}`, {}),

  /** Move Kepala OPD to different OPD */
  pindahJabatan: (userId: string, opdId: string) =>
    apiClient.post<JabatanUser>(`/users/jabatan/pindah/${userId}`, { opdId }),

  /** Get list of Kepala OPD (current + history) */
  getRiwayat: (opdId?: string) => {
    const query = opdId ? `?opdId=${opdId}` : ''
    return apiClient.get<JabatanUser[]>(`/users/jabatan/riwayat${query}`)
  },
}

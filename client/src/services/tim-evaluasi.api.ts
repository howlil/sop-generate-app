/**
 * Tim Evaluasi API service
 * Matches server: TimEvaluasiController
 */

import { apiClient } from './api'
import type { AnggotaTimEvaluasi, CreateTimEvaluasiDto, UpdateTimEvaluasiDto } from '@/types/tim'

export const timEvaluasiApi = {
  findAll: () =>
    apiClient.get<AnggotaTimEvaluasi[]>('/tim-evaluasi'),

  findById: (id: string) =>
    apiClient.get<AnggotaTimEvaluasi>(`/tim-evaluasi/${id}`),

  tambah: (payload: CreateTimEvaluasiDto) =>
    apiClient.post<AnggotaTimEvaluasi>('/tim-evaluasi', payload),

  nonaktifkan: (id: string) =>
    apiClient.patch<AnggotaTimEvaluasi>(`/tim-evaluasi/${id}/nonaktifkan`),
}

/**
 * Tim Evaluasi API service
 */

import { apiClient } from './api'
import type { AnggotaTimEvaluasi, CreateTimEvaluasiRequest } from '../types/tim'

export const timEvaluasiApi = {
  findAll: () => apiClient.get<AnggotaTimEvaluasi[]>('/tim-evaluasi'),

  findById: (id: string) => apiClient.get<AnggotaTimEvaluasi>(`/tim-evaluasi/${id}`),

  tambah: (payload: CreateTimEvaluasiRequest) => 
    apiClient.post<AnggotaTimEvaluasi>('/tim-evaluasi', payload),

  nonaktifkan: (id: string) => 
    apiClient.patch<AnggotaTimEvaluasi>(`/tim-evaluasi/${id}/nonaktifkan`),
}

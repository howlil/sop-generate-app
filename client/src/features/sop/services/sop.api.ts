/**
 * SOP API service
 * Matches server: SopController, DetailSopController, LangkahSopController, PelaksanaController
 */

import { apiClient } from '@/utils/api-client'
import type {
  Sop,
  SopDetail,
  CreateSopRequest,
  UpdateMetadataDto,
  UpdateStatusDto,
  LangkahSOP,
  CreateLangkahSOPDto,
  UpdateLangkahSOPDto,
  Pelaksana,
  CreatePelaksanaDto,
  DetailSOPPelaksana,
  CreateDetailSOPPelaksanaDto,
  LampiranTeks,
  CreateLampiranTeksDto,
  DasarHukum,
  CreateDasarHukumDto,
  SopTerkait,
  CreateSopTerkaitDto,
} from '../types/sop'
import type { LogEditSOP } from '@/features/audit/types/audit'

export const sopApi = {
  // ================= SOP (Header) =================

  findAll: (params?: { opdId?: string; status?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<Sop[]>(`/sop${query}`)
  },

  findById: (id: string) =>
    apiClient.get<Sop>(`/sop/${id}`),

  create: (payload: CreateSopRequest) =>
    apiClient.post<Sop>('/sop', payload),

  update: (id: string, judul: string) =>
    apiClient.patch<Sop>(`/sop/${id}`, { judul }),

  delete: (id: string) =>
    apiClient.delete(`/sop/${id}`),

  // ================= DetailSOP =================

  findDetailAll: (params?: { sopId?: string; opdId?: string; status?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<SopDetail[]>(`/detail-sop${query}`)
  },

  findDetailById: (id: string) =>
    apiClient.get<SopDetail>(`/detail-sop/${id}`),

  updateMetadata: (id: string, payload: UpdateMetadataDto) =>
    apiClient.patch<SopDetail>(`/detail-sop/${id}/metadata`, payload),

  updateStatus: (id: string, payload: UpdateStatusDto) =>
    apiClient.patch<SopDetail>(`/detail-sop/${id}/status`, payload),

  // ================= LangkahSOP =================

  findLangkah: (sopDetailId: string) =>
    apiClient.get<LangkahSOP[]>(`/detail-sop/${sopDetailId}/langkah`),

  createLangkah: (sopDetailId: string, payload: CreateLangkahSOPDto) =>
    apiClient.post<LangkahSOP>(`/detail-sop/${sopDetailId}/langkah`, payload),

  updateLangkah: (sopDetailId: string, id: string, payload: UpdateLangkahSOPDto) =>
    apiClient.patch<LangkahSOP>(`/detail-sop/${sopDetailId}/langkah/${id}`, payload),

  deleteLangkah: (sopDetailId: string, id: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/langkah/${id}`),

  // ================= Pelaksana =================

  findPelaksana: (opdId: string) =>
    apiClient.get<Pelaksana[]>(`/pelaksana?opdId=${opdId}`),

  findPelaksanaById: (id: string) =>
    apiClient.get<Pelaksana>(`/pelaksana/${id}`),

  createPelaksana: (payload: CreatePelaksanaDto) =>
    apiClient.post<Pelaksana>('/pelaksana', payload),

  updatePelaksana: (id: string, namaPelaksana: string) =>
    apiClient.patch<Pelaksana>(`/pelaksana/${id}`, { namaPelaksana }),

  deletePelaksana: (id: string) =>
    apiClient.delete(`/pelaksana/${id}`),

  // ================= Swimlane =================

  getSwimlane: (sopDetailId: string) =>
    apiClient.get<DetailSOPPelaksana[]>(`/pelaksana/${sopDetailId}/swimlane`),

  addSwimlane: (sopDetailId: string, payload: CreateDetailSOPPelaksanaDto) =>
    apiClient.post<DetailSOPPelaksana>(`/pelaksana/${sopDetailId}/swimlane`, payload),

  removeSwimlane: (sopDetailId: string, pelaksanaId: string) =>
    apiClient.delete(`/pelaksana/${sopDetailId}/swimlane/${pelaksanaId}`),

  // ================= Lampiran =================

  findLampiran: (sopDetailId: string, jenis?: string) => {
    const query = jenis ? `?jenis=${jenis}` : ''
    return apiClient.get<LampiranTeks[]>(`/detail-sop/${sopDetailId}/lampiran${query}`)
  },

  createLampiran: (sopDetailId: string, payload: CreateLampiranTeksDto) =>
    apiClient.post<LampiranTeks>(`/detail-sop/${sopDetailId}/lampiran`, payload),

  updateLampiran: (sopDetailId: string, lampiranId: string, teks: string) =>
    apiClient.patch<LampiranTeks>(`/detail-sop/${sopDetailId}/lampiran/${lampiranId}`, { teks }),

  deleteLampiran: (sopDetailId: string, lampiranId: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/lampiran/${lampiranId}`),

  // ================= Dasar Hukum =================

  getDasarHukum: (sopDetailId: string) =>
    apiClient.get<DasarHukum[]>(`/detail-sop/${sopDetailId}/dasar-hukum`),

  addDasarHukum: (sopDetailId: string, payload: CreateDasarHukumDto) =>
    apiClient.post<DasarHukum>(`/detail-sop/${sopDetailId}/dasar-hukum`, payload),

  removeDasarHukum: (sopDetailId: string, peraturanId: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/dasar-hukum/${peraturanId}`),

  // ================= SOP Terkait =================

  getSopTerkait: (sopDetailId: string) =>
    apiClient.get<SopTerkait[]>(`/detail-sop/${sopDetailId}/sop-terkait`),

  addSopTerkait: (sopDetailId: string, payload: CreateSopTerkaitDto) =>
    apiClient.post<SopTerkait>(`/detail-sop/${sopDetailId}/sop-terkait`, payload),

  removeSopTerkait: (sopDetailId: string, sopTerkaitDetailId: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/sop-terkait/${sopTerkaitDetailId}`),

  // ================= Edit History =================

  getEditHistory: (sopDetailId: string) =>
    apiClient.get<LogEditSOP[]>(`/audit/detail-sop/${sopDetailId}`),
}

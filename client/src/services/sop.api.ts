/**
 * SOP API service - Complete implementation
 * Matches server: SopController, DetailSopController, LangkahSopController, PelaksanaController
 */

import { apiClient } from './api'
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
  LogEditSOP,
  StatusSOP,
  JenisLangkahProsedur,
  SatuanWaktu,
  JenisLampiran,
  BagianSOP,
} from '../types/sop'

export type {
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
  LogEditSOP,
  StatusSOP,
  JenisLangkahProsedur,
  SatuanWaktu,
  JenisLampiran,
  BagianSOP,
}

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

  /**
   * Get all DetailSOP with filtering
   */
  findDetailAll: (params?: { sopId?: string; opdId?: string; status?: string }) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiClient.get<SopDetail[]>(`/detail-sop${query}`)
  },

  /**
   * Get DetailSOP by ID
   */
  findDetailById: (id: string) =>
    apiClient.get<SopDetail>(`/detail-sop/${id}`),

  /**
   * SOP-02: Update metadata DetailSOP
   */
  updateMetadata: (id: string, payload: UpdateMetadataDto) =>
    apiClient.patch<SopDetail>(`/detail-sop/${id}/metadata`, payload),

  /**
   * SOP-03/06/07/08: Update status DetailSOP
   */
  updateStatus: (id: string, payload: UpdateStatusDto) =>
    apiClient.patch<SopDetail>(`/detail-sop/${id}/status`, payload),

  // ================= LangkahSOP (Nested under DetailSOP) =================

  /**
   * Get all langkah SOP for a DetailSOP
   */
  findLangkah: (sopDetailId: string) =>
    apiClient.get<LangkahSOP[]>(`/detail-sop/${sopDetailId}/langkah`),

  /**
   * PLK-02: Create langkah SOP
   */
  createLangkah: (sopDetailId: string, payload: CreateLangkahSOPDto) =>
    apiClient.post<LangkahSOP>(`/detail-sop/${sopDetailId}/langkah`, payload),

  /**
   * PLK-02: Update langkah SOP
   */
  updateLangkah: (sopDetailId: string, id: string, payload: UpdateLangkahSOPDto) =>
    apiClient.patch<LangkahSOP>(`/detail-sop/${sopDetailId}/langkah/${id}`, payload),

  /**
   * PLK-02: Delete langkah SOP
   */
  deleteLangkah: (sopDetailId: string, id: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/langkah/${id}`),

  // ================= Pelaksana =================

  /**
   * Get all pelaksana for an OPD
   */
  findPelaksana: (opdId: string) =>
    apiClient.get<Pelaksana[]>(`/pelaksana?opdId=${opdId}`),

  /**
   * Get pelaksana by ID
   */
  findPelaksanaById: (id: string) =>
    apiClient.get<Pelaksana>(`/pelaksana/${id}`),

  /**
   * PLK-01: Create pelaksana
   */
  createPelaksana: (payload: CreatePelaksanaDto) =>
    apiClient.post<Pelaksana>('/pelaksana', payload),

  /**
   * PLK-01: Update pelaksana
   */
  updatePelaksana: (id: string, namaPelaksana: string) =>
    apiClient.patch<Pelaksana>(`/pelaksana/${id}`, { namaPelaksana }),

  /**
   * PLK-01: Delete pelaksana
   */
  deletePelaksana: (id: string) =>
    apiClient.delete(`/pelaksana/${id}`),

  // ================= DetailSOPPelaksana (Swimlane) =================

  /**
   * Get swimlane (pelaksana list) for a DetailSOP
   */
  getSwimlane: (sopDetailId: string) =>
    apiClient.get<DetailSOPPelaksana[]>(`/pelaksana/${sopDetailId}/swimlane`),

  /**
   * Add pelaksana to DetailSOP swimlane — PLK-08
   */
  addSwimlane: (sopDetailId: string, payload: CreateDetailSOPPelaksanaDto) =>
    apiClient.post<DetailSOPPelaksana>(`/pelaksana/${sopDetailId}/swimlane`, payload),

  /**
   * Remove pelaksana from DetailSOP swimlane
   */
  removeSwimlane: (sopDetailId: string, pelaksanaId: string) =>
    apiClient.delete(`/pelaksana/${sopDetailId}/swimlane/${pelaksanaId}`),

  // ================= LampiranTeks =================

  /**
   * Get lampiran for DetailSOP
   */
  findLampiran: (sopDetailId: string, jenis?: string) => {
    const query = jenis ? `?jenis=${jenis}` : ''
    return apiClient.get<LampiranTeks[]>(`/detail-sop/${sopDetailId}/lampiran${query}`)
  },

  /**
   * SOP-24: Create lampiran teks
   */
  createLampiran: (sopDetailId: string, payload: CreateLampiranTeksDto) =>
    apiClient.post<LampiranTeks>(`/detail-sop/${sopDetailId}/lampiran`, payload),

  /**
   * SOP-24: Update lampiran teks
   */
  updateLampiran: (sopDetailId: string, lampiranId: string, teks: string) =>
    apiClient.patch<LampiranTeks>(`/detail-sop/${sopDetailId}/lampiran/${lampiranId}`, { teks }),

  /**
   * SOP-24: Delete lampiran teks
   */
  deleteLampiran: (sopDetailId: string, lampiranId: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/lampiran/${lampiranId}`),

  // ================= DasarHukum =================

  /**
   * SOP-19: Get dasar hukum list for DetailSOP
   */
  getDasarHukum: (sopDetailId: string) =>
    apiClient.get<DasarHukum[]>(`/detail-sop/${sopDetailId}/dasar-hukum`),

  /**
   * Add dasar hukum to DetailSOP
   */
  addDasarHukum: (sopDetailId: string, payload: CreateDasarHukumDto) =>
    apiClient.post<DasarHukum>(`/detail-sop/${sopDetailId}/dasar-hukum`, payload),

  /**
   * Remove dasar hukum from DetailSOP
   */
  removeDasarHukum: (sopDetailId: string, peraturanId: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/dasar-hukum/${peraturanId}`),

  // ================= SopTerkait =================

  /**
   * SOP-20: Get SOP terkait list for DetailSOP
   */
  getSopTerkait: (sopDetailId: string) =>
    apiClient.get<SopTerkait[]>(`/detail-sop/${sopDetailId}/sop-terkait`),

  /**
   * Add SOP terkait
   */
  addSopTerkait: (sopDetailId: string, payload: CreateSopTerkaitDto) =>
    apiClient.post<SopTerkait>(`/detail-sop/${sopDetailId}/sop-terkait`, payload),

  /**
   * Remove SOP terkait
   */
  removeSopTerkait: (sopDetailId: string, sopTerkaitDetailId: string) =>
    apiClient.delete(`/detail-sop/${sopDetailId}/sop-terkait/${sopTerkaitDetailId}`),

  // ================= LogEditSOP =================

  /**
   * AUD-03: Get edit history for DetailSOP (via audit endpoint)
   */
  getEditHistory: (sopDetailId: string) =>
    apiClient.get<LogEditSOP[]>(`/audit/detail-sop/${sopDetailId}`),
}

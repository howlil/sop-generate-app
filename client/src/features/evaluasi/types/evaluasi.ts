/**
 * Evaluasi types matching server schema
 * Uses shared types from @/types/common
 */

import type {
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  JenisPengajuanEvaluasi,
  LogNilaiEvaluasi,
  NilaiEvaluasi,
  PengajuanEvaluasi,
  RekapDetail,
  RekapEvaluasi,
  SelesaiEvaluasiDto,
  StatusHasilEvaluasi,
  StatusPengajuanEvaluasi,
} from "@/types/common";

// Re-export shared types from central location for backward compatibility
export type {
  StatusHasilEvaluasi,
  JenisPengajuanEvaluasi,
  StatusPengajuanEvaluasi,
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
  RekapEvaluasi,
  RekapDetail,
  // Domain types now shared across features
  PengajuanEvaluasi,
  NilaiEvaluasi,
  LogNilaiEvaluasi,
};

// Feature-specific interfaces that extend or use the shared types
export interface UpdatePengajuanEvaluasiDto {
  status?: StatusPengajuanEvaluasi
  catatan?: string
  nilaiOPD?: number
}

export interface CreateNilaiEvaluasiDto {
  pengajuanEvaluasiId: string
  sopDetailId: string
  hasil: StatusHasilEvaluasi
  catatan?: string
}

export interface UpdateNilaiEvaluasiDto {
  hasil?: StatusHasilEvaluasi
  catatan?: string
  version?: number
}

export interface BatchListSopItem {
  id: string
  sopDetailId: string
  judul: string
  nomorSOP: string
  status: string
  hasil?: StatusHasilEvaluasi
}

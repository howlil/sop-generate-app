/**
 * Evaluasi types matching server schema
 * Uses shared types from @/types/common
 */

import type { 
  StatusHasilEvaluasi, 
  JenisPengajuanEvaluasi, 
  StatusPengajuanEvaluasi,
  HasilEvaluasi,
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
  RekapEvaluasi,
  RekapDetail,
} from '@/types/common'

// Re-export for backward compatibility
export type { 
  StatusHasilEvaluasi, 
  JenisPengajuanEvaluasi, 
  StatusPengajuanEvaluasi,
  HasilEvaluasi,
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
  RekapEvaluasi,
  RekapDetail,
}

export interface PengajuanEvaluasi {
  id: string
  opdId: string
  jenis: JenisPengajuanEvaluasi
  status: StatusPengajuanEvaluasi
  catatan?: string
  nomorBA?: string
  tanggalPermintaan?: string
  tanggalEvaluasi?: string
  nilaiOPD?: number
  diverifikasiOlehUserId?: string
  ditandatanganiOlehKoordinatorUserId?: string
  tanggalTTDBaKoordinator?: string
  diselesaikanOlehId?: string
  tanggalDiselesaikan?: string
  version: number
  createdAt: string
  updatedAt: string

  opd?: { id: string; nama: string }
  diverifikasiOlehUser?: { id: string; nama: string }
  ditandatanganiOlehKoordinatorUser?: { id: string; nama: string }
  diselesaikanOleh?: { id: string; nama: string }
  nilaiEvaluasi?: NilaiEvaluasi[]
}

export interface NilaiEvaluasi {
  id: string
  pengajuanEvaluasiId: string
  sopDetailId: string
  hasil?: HasilEvaluasi
  catatan?: string
  version: number
  dinilaiOlehId?: string
  createdAt: string
  updatedAt: string

  sopDetail?: { id: string; nomorSOP: string; status: string }
  dinilaiOleh?: { id: string; nama: string }
}

export interface LogNilaiEvaluasi {
  id: string
  pengajuanEvaluasiId: string
  sopDetailId: string
  evaluatorId: string
  hasilSebelum?: HasilEvaluasi
  hasilSesudah?: HasilEvaluasi
  catatanSebelum?: string
  catatanSesudah?: string
  createdAt: string

  evaluator?: { id: string; nama: string }
}

/**
 * Evaluasi types matching server schema
 */

export type JenisPengajuanEvaluasi = 'TERJADWAL' | 'MANDIRI'

export type StatusPengajuanEvaluasi =
  | 'MENUNGGU_EVALUASI'
  | 'SEDANG_DIEVALUASI'
  | 'SELESAI_DIEVALUASI'
  | 'DIVERIFIKASI_BIRO'
  | 'DITANDATANGANI_KOORDINATOR'
  | 'SELESAI'

export type HasilEvaluasi = 'SESUAI' | 'TIDAK_SESUAI'

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

export interface CreatePengajuanEvaluasiDto {
  opdId: string
  jenis: JenisPengajuanEvaluasi
  sopDetailIds: string[]
  catatan?: string
}

export interface IsiNilaiEvaluasiDto {
  hasil: HasilEvaluasi
  catatan?: string
  version?: number
}

export interface SelesaiEvaluasiDto {
  nilaiOPD?: number
}

export interface RekapEvaluasi {
  opdId: string
  opdNama: string
  tahun: number
  totalPengajuan: number
  totalTerjadwal: number
  totalMandiri: number
  nilaiRataRata?: number
  detail: RekapDetail[]
}

export interface RekapDetail {
  pengajuanEvaluasiId: string
  jenis: JenisPengajuanEvaluasi
  status: StatusPengajuanEvaluasi
  nilaiOPD?: number
  tanggalEvaluasi: string
  detailSopCount: number
  hasilEvaluasi: {
    sesuai: number
    tidakSesuai: number
  }
}

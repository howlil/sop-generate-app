/**
 * Pengajuan Evaluasi types - stub
 */

export type JenisPengajuanEvaluasi = 'TERJADWAL' | 'MANDIRI'
export type StatusPengajuanEvaluasi = 'MENUNGGU_EVALUASI' | 'SEDANG_DIEVALUASI' | 'SELESAI_DIEVALUASI' | 'DIVERIFIKASI_BIRO' | 'DITANDATANGANI_KOORDINATOR' | 'SELESAI'

export interface PengajuanEvaluasi {
  id: string
  opdId: string
  jenis: JenisPengajuanEvaluasi
  status: StatusPengajuanEvaluasi
  createdAt: string
}

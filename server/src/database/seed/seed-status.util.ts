import { StatusPengajuanEvaluasi, StatusSOP } from '../../generated/prisma';

/** PIN TTE untuk semua akun seed (development). */
export const SEED_TTE_PIN = '1234';

/**
 * Memetakan status pengajuan evaluasi ke status DetailSOP anggota batch (seed sync).
 * Selaras `EvaluasiNilaiService.selesai` dan `TteRepository` (BERLAKU hanya setelah TTE Kepala OPD).
 */
export function mapStatusSopUntukPengajuan(statusPengajuan: StatusPengajuanEvaluasi): StatusSOP {
  switch (statusPengajuan) {
    case StatusPengajuanEvaluasi.SEDANG_DIEVALUASI:
      return StatusSOP.SEDANG_DIEVALUASI;
    case StatusPengajuanEvaluasi.SELESAI_DIEVALUASI:
      return StatusSOP.SIAP_DIVERIFIKASI;
    case StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR:
      return StatusSOP.SIAP_DIVERIFIKASI;
    case StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN:
      return StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI;
    case StatusPengajuanEvaluasi.SELESAI:
      return StatusSOP.BERLAKU;
    default:
      return StatusSOP.SEDANG_DIEVALUASI;
  }
}

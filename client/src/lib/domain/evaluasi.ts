/**
 * Domain: aturan bisnis evaluasi (form hasil, mapping status, validasi).
 * Konstanta UI (options, storage key) tetap di lib/constants/evaluasi.
 */
import type { StatusSOP } from '@/lib/types/sop'

/** Map pilihan form evaluasi → status SOP setelah dikirim. Ini adalah business rule. */
export const STATUS_HASIL_EVALUASI = {
  Sesuai: 'Siap Diverifikasi',
  'Revisi Biro': 'Revisi dari Tim Evaluasi',
} as const satisfies Record<string, StatusSOP>

export type StatusHasilEvaluasiForm = keyof typeof STATUS_HASIL_EVALUASI

/** Map pilihan form (Sesuai / Revisi Biro) → status SOP setelah dikirim. */
export function getStatusSopAfterEvaluasi(hasil: StatusHasilEvaluasiForm): StatusSOP {
  return STATUS_HASIL_EVALUASI[hasil]
}

/** Form evaluasi SOP dianggap lengkap: status terpilih, dan jika Revisi Biro wajib ada komentar. */
export function isFormEvaluasiSopComplete(
  statusEvaluasi: StatusHasilEvaluasiForm | null,
  komentarEvaluasi: string
): boolean {
  if (statusEvaluasi === null) return false
  if (statusEvaluasi === 'Revisi Biro') return (komentarEvaluasi?.trim() ?? '') !== ''
  return true
}

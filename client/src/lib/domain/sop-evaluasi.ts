/**
 * Domain: aturan bisnis SOP terkait evaluasi.
 * Satu tempat untuk "boleh ajukan evaluasi", "boleh pilih untuk evaluasi", dll.
 * Type StatusSOP tetap di lib/types/sop; fungsi & konstanta aturan di sini.
 */
import type { StatusSOP } from '@/lib/types/sop'

/** Status saat Koordinator Tim Penyusun boleh mengajukan Request Evaluasi (dari Manajemen SOP). */
export const STATUS_SOP_CAN_REQUEST_EVALUASI: StatusSOP[] = ['Siap Dievaluasi', 'Revisi dari Tim Evaluasi']

/** Status SOP yang layak dievaluasi oleh Tim Evaluasi (langsung per SOP). */
export const STATUS_SOP_CAN_SELECT_FOR_EVALUASI: StatusSOP[] = [
  'Diajukan Evaluasi',
  'Sedang Dievaluasi',
  'Revisi dari Tim Evaluasi',
]

export function canAjukanEvaluasiSOP(status: StatusSOP): boolean {
  return STATUS_SOP_CAN_REQUEST_EVALUASI.includes(status)
}

export function canSelectSOPForEvaluasi(status: StatusSOP): boolean {
  return STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(status)
}

/** Status SOP yang tidak masuk daftar evaluasi Tim Evaluasi (tahap penyusunan dan siap diajukan). */
export const STATUS_BUKAN_LIST_EVALUASI: StatusSOP[] = ['Draft', 'Sedang Disusun', 'Siap Dievaluasi']

export function isSopInEvaluasiList(status: StatusSOP): boolean {
  return !(STATUS_BUKAN_LIST_EVALUASI as StatusSOP[]).includes(status)
}

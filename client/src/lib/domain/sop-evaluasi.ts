/**
 * Domain: aturan bisnis SOP terkait evaluasi.
 * Satu tempat untuk "boleh ajukan evaluasi", "boleh pilih untuk evaluasi", dll.
 * Type StatusSOP tetap di lib/types/sop; fungsi & konstanta aturan di sini.
 */
import type { StatusSOP } from '@/lib/types/sop'

/** Status saat Tim Penyusun boleh mengajukan Request Evaluasi (dari Daftar SOP). */
export const STATUS_SOP_CAN_REQUEST_EVALUASI: StatusSOP[] = ['Siap Dievaluasi', 'Berlaku']

/** Status SOP yang layak dievaluasi oleh Tim Evaluasi (tanpa penugasan). */
export const STATUS_SOP_CAN_SELECT_FOR_EVALUASI: StatusSOP[] = [
  'Siap Dievaluasi',
  'Berlaku',
  'Diajukan Evaluasi',
]

export function canAjukanEvaluasiSOP(status: StatusSOP): boolean {
  return STATUS_SOP_CAN_REQUEST_EVALUASI.includes(status)
}

export function canSelectSOPForEvaluasi(status: StatusSOP): boolean {
  return STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(status)
}

/** Status SOP yang tidak masuk daftar evaluasi (filter di workspace). */
export const STATUS_BUKAN_LIST_EVALUASI = 'Sedang Disusun' as const

export function isSopInEvaluasiList(status: StatusSOP): boolean {
  return status !== STATUS_BUKAN_LIST_EVALUASI
}

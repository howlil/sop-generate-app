import type { SopDaftarRow, StatusSOP } from '@/types/dto/sop.dto'

export function canBuatVersiBaruFromRow(row: {
  canBuatVersiBaru?: boolean
  versiBerlaku?: { detailSopId: string } | null
}): boolean {
  return row.canBuatVersiBaru === true
}

export function getBuatVersiBaruBlockingReason(row: SopDaftarRow): string | null {
  if (row.versiBerlaku == null) {
    return 'SOP ini belum memiliki versi yang berlaku (BERLAKU).'
  }
  if (!row.canBuatVersiBaru) {
    return 'Masih ada revisi versi yang belum selesai. Selesaikan atau hapus versi draft terlebih dahulu.'
  }
  return null
}

export function canHapusVersiDraft(
  status: StatusSOP,
  canHapusDraft?: boolean,
): boolean {
  return status === 'DRAFT' && canHapusDraft === true
}

export function isRevisiDariBerlaku(
  revisiDariDetailSopId?: string | null,
): boolean {
  return revisiDariDetailSopId != null && revisiDariDetailSopId.length > 0
}

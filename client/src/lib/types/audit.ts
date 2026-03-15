/**
 * Types audit log — jejak perubahan status SOP per event bisnis.
 * Dipakai sebagai guardrail akuntabilitas shared editing.
 */
import type { StatusSOP } from '@/lib/types/sop'

export type AuditAction =
  | 'BUAT_SOP'
  | 'SIMPAN_DRAFT'
  | 'SELESAI_PENYUSUNAN'
  | 'AJUKAN_EVALUASI'
  | 'MULAI_EVALUASI'
  | 'KIRIM_HASIL_EVALUASI'
  | 'VERIFIKASI_BATCH'
  | 'TTD_BA_KEPALA_OPD'
  | 'SAHKAN_SOP'
  | 'CABUT_SOP'
  | 'REVISI_DARI_EVALUATOR'

export interface AuditLogEntry {
  id: string
  sopId: string
  action: AuditAction
  /** Nama aktor yang melakukan aksi (dari role display). */
  aktorNama: string
  /** Role aktor saat aksi dilakukan. */
  aktorRole: string
  statusSebelum?: StatusSOP
  statusSesudah: StatusSOP
  keterangan?: string
  timestamp: string
}

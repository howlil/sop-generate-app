/**
 * Audit types - stub
 */

export interface AuditEntry {
  id: string
  sopId: string
  action: string
  aktorNama: string
  aktorRole: string
  timestamp: string
  statusSebelum?: string
  statusSesudah: string
  keterangan?: string
}

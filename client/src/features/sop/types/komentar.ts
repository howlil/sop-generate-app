/**
 * Komentar types
 */

export interface KomentarItem {
  id: string
  sopDetailId: string
  userId: string
  userName?: string
  isi: string
  bagian?: string
  status: 'OPEN' | 'RESOLVED'
  createdAt: string
  updatedAt?: string
}

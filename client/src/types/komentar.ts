/**
 * Komentar types - stub
 */

export type StatusKomentar = 'OPEN' | 'RESOLVED'

export interface Komentar {
  id: string
  sopDetailId: string
  userId: string
  isi: string
  status: StatusKomentar
  createdAt: string
}

/**
 * Types komentar: bentuk shared untuk panel komentar dan seed data.
 */

import type { KomentarRoleLabel } from '@/lib/constants/roles'

export type KomentarStatus = 'open' | 'resolved'

export interface KomentarItem {
  id: string
  user: string
  role: KomentarRoleLabel | string
  timestamp: string
  bagian?: string
  isi: string
  status: KomentarStatus
}

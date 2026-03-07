/**
 * Data layer: pelaksana SOP.
 * Semua akses ke pelaksana-seed dikonsolidasikan di sini.
 */
import type { PelaksanaSOP } from '@/lib/types/sop'
import { SEED_PELAKSANA_LIST } from '@/lib/seed/pelaksana-seed'

export function getInitialPelaksanaList(): PelaksanaSOP[] {
  return [...SEED_PELAKSANA_LIST]
}

/**
 * Seed data untuk Kelola Pelaksana SOP (Tim Penyusun).
 * Data dari data/pelaksana.json. Id (impl-1, impl-2, impl-3) dipakai di prosedur SOP.
 */
import type { PelaksanaSOP } from '@/lib/types/sop'
import pelaksanaJson from './data/pelaksana.json'

export const SEED_PELAKSANA_LIST: PelaksanaSOP[] = pelaksanaJson as PelaksanaSOP[]

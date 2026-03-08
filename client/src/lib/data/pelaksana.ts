/**
 * Data layer: pelaksana SOP.
 * List untuk CRUD dan untuk dropdown pelaksana di edit SOP.
 */
import type { PelaksanaSOP } from '@/lib/types/sop'
import { SEED_PELAKSANA_LIST } from '@/lib/seed/pelaksana-seed'
import { usePelaksanaStore } from '@/lib/stores/pelaksana-store'

/** Daftar pelaksana: dari store jika sudah diisi, else seed. */
export function getPelaksanaList(): PelaksanaSOP[] {
  const list = usePelaksanaStore.getState().list
  return list.length > 0 ? list : [...SEED_PELAKSANA_LIST]
}

/** Untuk inisialisasi: kembalikan seed (untuk hydrate store saat kosong). */
export function getInitialPelaksanaList(): PelaksanaSOP[] {
  return [...SEED_PELAKSANA_LIST]
}

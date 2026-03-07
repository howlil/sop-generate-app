/**
 * Data layer: penugasan evaluasi.
 * Sumber data = store + seed (fallback). UI/pages pakai hooks/usePenugasan (usePenugasanList).
 */
import {
  getPenugasanList,
  setPenugasanList,
} from '@/lib/stores/penugasan-store'
import { SEED_PENUGASAN_INITIAL } from '@/lib/seed/penugasan-evaluasi-seed'

/** Inisialisasi list penugasan dari seed bila store masih kosong. */
export function initPenugasanFromSeed(): void {
  if (getPenugasanList().length === 0) {
    setPenugasanList(SEED_PENUGASAN_INITIAL)
  }
}

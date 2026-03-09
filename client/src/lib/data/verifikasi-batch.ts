/**
 * Data layer: verifikasi batch (inisialisasi dari seed).
 * Sumber data = store + seed (fallback). UI pakai hooks/useVerifikasiBatch.
 */
import {
  getVerifikasiBatchList,
  setVerifikasiBatchList,
} from '@/lib/stores/verifikasi-batch-store'
import { SEED_VERIFIKASI_BATCH_INITIAL } from '@/lib/seed/verifikasi-batch-seed'

/** Inisialisasi list verifikasi batch dari seed bila store masih kosong. */
export function initVerifikasiBatchFromSeed(): void {
  if (getVerifikasiBatchList().length === 0) {
    setVerifikasiBatchList(SEED_VERIFIKASI_BATCH_INITIAL)
  }
}

// Seed data saat modul pertama kali di-load agar daftar Verifikasi SOP langsung terisi
initVerifikasiBatchFromSeed()

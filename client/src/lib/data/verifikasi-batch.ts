/**
 * Data layer: verifikasi batch (inisialisasi dari JSON).
 * Sumber data = store + data/penugasan-evaluasi.json (fallback). UI pakai hooks/useVerifikasiBatch.
 */
import {
  getVerifikasiBatchList,
  setVerifikasiBatchList,
} from '@/lib/stores/verifikasi-batch-store'
import type { VerifikasiBatch } from '@/lib/types/verifikasi-batch'
import verifikasiBatchSeedData from '../seed/penugasan-evaluasi.json'

interface VerifikasiBatchSeedResponse {
  penugasan: VerifikasiBatch[]
}

const verifikasiBatchSeed = verifikasiBatchSeedData as VerifikasiBatchSeedResponse
const VERIFIKASI_BATCH_INITIAL: VerifikasiBatch[] = verifikasiBatchSeed.penugasan

/** Inisialisasi list verifikasi batch dari JSON bila store masih kosong. */
export function initVerifikasiBatchFromSeed(): void {
  if (getVerifikasiBatchList().length === 0) {
    setVerifikasiBatchList(VERIFIKASI_BATCH_INITIAL)
  }
}


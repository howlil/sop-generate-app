/**
 * Data layer: verifikasi batch (inisialisasi dari JSON).
 * Sumber data = store + data/penugasan-evaluasi.json (fallback). UI pakai hooks/useVerifikasiBatch.
 */
import { setVerifikasiBatchList } from '@/lib/stores/verifikasi-batch-store'
import type { VerifikasiBatch } from '@/lib/types/verifikasi-batch'
import verifikasiBatchSeedData from '../seed/penugasan-evaluasi.json'

interface VerifikasiBatchSeedResponse {
  penugasan: VerifikasiBatch[]
}

const verifikasiBatchSeed = verifikasiBatchSeedData as VerifikasiBatchSeedResponse
const VERIFIKASI_BATCH_INITIAL: VerifikasiBatch[] = verifikasiBatchSeed.penugasan

/** Inisialisasi list verifikasi batch dari JSON.
 * Untuk keperluan demo/prototipe FE, kita selalu menyamakan state store dengan seed
 * agar perubahan di penugasan-evaluasi.json langsung tercermin tanpa tergantung localStorage lama.
 */
export function initVerifikasiBatchFromSeed(): void {
  setVerifikasiBatchList(VERIFIKASI_BATCH_INITIAL)
}


/**
 * Data layer: terjadwal evaluasi (inisialisasi dari JSON).
 * Sumber data = store + data/penugasan-evaluasi.json (fallback). UI pakai hooks/useVerifikasiBatch.
 * "Terjadwal Evaluasi" = istilah UI; type tetap VerifikasiBatch untuk konsistensi kode.
 */
import { setVerifikasiBatchList } from '@/lib/stores/verifikasi-batch-store'
import type { VerifikasiBatch } from '@/lib/types/verifikasi-batch'
import verifikasiBatchSeedData from '../seed/penugasan-evaluasi.json'

interface VerifikasiBatchSeedResponse {
  penugasan: VerifikasiBatch[]
}

const verifikasiBatchSeed = verifikasiBatchSeedData as VerifikasiBatchSeedResponse
const PENGAJUAN_EVALUASI_INITIAL: VerifikasiBatch[] = verifikasiBatchSeed.penugasan

/** Inisialisasi list pengajuan evaluasi dari JSON.
 * Untuk keperluan demo/prototipe FE, kita selalu menyamakan state store dengan seed
 * agar perubahan di penugasan-evaluasi.json langsung tercermin tanpa tergantung localStorage lama.
 */
export function initVerifikasiBatchFromSeed(): void {
  setVerifikasiBatchList(PENGAJUAN_EVALUASI_INITIAL)
}


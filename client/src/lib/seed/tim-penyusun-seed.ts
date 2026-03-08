/**
 * Seed data untuk Manajemen Tim Penyusun (Biro Organisasi).
 * Data mentah dari data/tim-penyusun.json (bentuk = response API). Relasi: opdId → opd.json id.
 */

import type { TimPenyusun, TimPenyusunOption } from '@/lib/types/tim'
import timPenyusunData from './data/tim-penyusun.json'

interface TimPenyusunResponse {
  timPenyusun: TimPenyusun[]
}

const data = timPenyusunData as TimPenyusunResponse

export const SEED_TIM_PENYUSUN_LIST: TimPenyusun[] = data.timPenyusun

/** Opsi tim penyusun untuk dropdown (mis. Inisiasi Proyek). */
export const SEED_TIM_PENYUSUN_OPTIONS: TimPenyusunOption[] = SEED_TIM_PENYUSUN_LIST.slice(0, 4).map((t) => ({
  id: t.id,
  nama: t.nama,
  jabatan: t.jabatan,
}))

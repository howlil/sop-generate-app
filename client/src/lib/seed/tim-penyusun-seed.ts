/**
 * Seed data untuk Manajemen Tim Penyusun (Biro Organisasi).
 * Data mentah dari data/tim-penyusun.json (bentuk = response API). Relasi: opdId → opd.json id.
 */

import type { TimPenyusun } from '@/lib/types/tim'
import timPenyusunData from './data/tim-penyusun.json'

interface TimPenyusunResponse {
  timPenyusun: TimPenyusun[]
}

const data = timPenyusunData as TimPenyusunResponse

export const SEED_TIM_PENYUSUN_LIST: TimPenyusun[] = data.timPenyusun

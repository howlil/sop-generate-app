/**
 * Data layer: Tim Penyusun.
 * Sumber data = store + JSON (inisialisasi). Page tidak import JSON langsung.
 * Hook useTimPenyusunList ada di hooks/useTimPenyusunList.ts (UI layer).
 * CRUD (add/update/remove) diakses langsung dari lib/stores/tim-penyusun-store.
 */
import type { TimPenyusun } from '@/lib/types/tim'
import {
  getTimPenyusunList,
  setTimPenyusunList,
} from '@/lib/stores/tim-penyusun-store'
import timPenyusunData from '../seed/tim-penyusun.json'

interface TimPenyusunResponse {
  timPenyusun: TimPenyusun[]
}

const timPenyusunSeed = timPenyusunData as TimPenyusunResponse
const SEED_TIM_PENYUSUN_LIST: TimPenyusun[] = timPenyusunSeed.timPenyusun

/** Inisialisasi list tim penyusun dari seed bila store masih kosong. */
export function initTimPenyusunFromSeed(): void {
  if (getTimPenyusunList().length === 0) {
    setTimPenyusunList(SEED_TIM_PENYUSUN_LIST)
  }
}

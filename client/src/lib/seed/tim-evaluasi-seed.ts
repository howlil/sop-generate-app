/**
 * Seed data untuk Manajemen Tim Evaluasi (Kepala Biro Organisasi).
 * Data dari data/tim-monev.json (bentuk = response API tim-evaluasi atau users).
 */
import type { TimMonev } from '@/lib/types/tim'
import timMonevJson from './data/tim-monev.json'

export const SEED_TIM_MONEV_LIST: TimMonev[] = timMonevJson as TimMonev[]

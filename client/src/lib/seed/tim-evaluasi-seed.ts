/**
 * Seed data untuk Manajemen Tim Evaluasi (Kepala Biro Organisasi).
 * Data dari data/tim-evaluasi-anggota.json (bentuk = response API tim-evaluasi atau users).
 */
import type { TimEvaluasiAnggota } from '@/lib/types/tim'
import timEvaluasiAnggotaJson from './data/tim-evaluasi-anggota.json'

export const SEED_TIM_EVALUASI_ANGGOTA_LIST: TimEvaluasiAnggota[] = timEvaluasiAnggotaJson as TimEvaluasiAnggota[]

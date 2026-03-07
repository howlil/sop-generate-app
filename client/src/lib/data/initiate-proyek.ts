/**
 * Data layer: inisiasi proyek SOP (template SOP & opsi tim penyusun).
 * Semua akses ke seed initiate-proyek / tim-penyusun untuk halaman inisiasi ada di sini.
 */
import type { SOPTemplate } from '@/lib/types/sop'
import { SEED_SOP_TEMPLATES } from '@/lib/seed/initiate-proyek-seed'
import { SEED_TIM_PENYUSUN_OPTIONS } from '@/lib/seed/tim-penyusun-seed'

export function getSopTemplates(): SOPTemplate[] {
  return [...SEED_SOP_TEMPLATES]
}

export function getTimPenyusunOptions(): { id: string; nama: string; jabatan: string }[] {
  return [...SEED_TIM_PENYUSUN_OPTIONS]
}


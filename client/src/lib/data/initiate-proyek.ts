/**
 * Data layer: inisiasi proyek SOP (template SOP).
 * Semua akses ke seed initiate-proyek untuk dialog Buat SOP ada di sini.
 */
import type { SOPTemplate } from '@/lib/types/sop'
import { SEED_SOP_TEMPLATES } from '@/lib/seed/initiate-proyek-seed'

export function getSopTemplates(): SOPTemplate[] {
  return [...SEED_SOP_TEMPLATES]
}


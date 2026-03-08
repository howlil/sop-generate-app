/**
 * Seed data untuk halaman Initiate Proyek SOP: template SOP yang bisa di-copy.
 * Data mentah dari data/sop-templates.json (bentuk = response API). Relasi: opd → opd.json name.
 */

import type { SOPTemplate } from '@/lib/types/sop'
import sopTemplatesData from './data/sop-templates.json'

export type { SOPTemplate } from '@/lib/types/sop'

export const SEED_SOP_TEMPLATES: SOPTemplate[] = sopTemplatesData as SOPTemplate[]

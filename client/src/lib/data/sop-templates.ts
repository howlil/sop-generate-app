/**
 * Data layer: template SOP untuk flow pembuatan SOP yang aktif.
 * Semua akses ke data/sop-templates.json untuk dialog Buat SOP ada di sini.
 */
import type { SOPTemplate } from '@/lib/types/sop'
import sopTemplatesData from '../seed/sop-templates.json'

const SOP_TEMPLATES: SOPTemplate[] = sopTemplatesData as SOPTemplate[]

export function getSopTemplates(): SOPTemplate[] {
  return [...SOP_TEMPLATES]
}

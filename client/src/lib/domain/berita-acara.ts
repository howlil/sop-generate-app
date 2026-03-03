import type { Penugasan } from '@/lib/types/penugasan'
import type { BeritaAcaraPdfProps } from '@/components/sop/BeritaAcaraPdf'
import { formatDateId } from '@/utils/format-date'

export interface InstitutionMetadata {
  institutionLogo?: string
  institutionLines: string[]
}

/**
 * Build BeritaAcaraPdf props from Penugasan and institution metadata.
 * Single source of truth for BA document data.
 */
export function buildBeritaAcaraModel(
  penugasan: Penugasan,
  metadata: InstitutionMetadata,
): BeritaAcaraPdfProps {
  const lines = metadata.institutionLines ?? []
  const pemdaName = lines[0] ?? ''
  const instansiLines = lines.slice(1)
  const tanggalDisplay = penugasan.tanggalVerifikasi
    ? formatDateId(penugasan.tanggalVerifikasi)
    : ''

  return {
    logoSrc: metadata.institutionLogo,
    pemdaName,
    instansiLines,
    nomorBA: penugasan.nomorBA ?? '',
    tempat: penugasan.opd,
    tanggalDisplay,
    opd: penugasan.opd,
    evaluator: penugasan.timMonev ?? '-',
    jumlahSOP: penugasan.sopList?.length ?? 0,
    pejabatPenandatangan: {
      jabatan: 'Kepala Biro Organisasi',
      nama: penugasan.kepalaBiro ?? '-',
    },
    evaluatorPenandatangan: {
      nama: penugasan.timMonev ?? '-',
    },
  }
}

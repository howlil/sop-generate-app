import {
  BeritaAcaraTemplate,
  type BeritaAcaraTemplateProps,
} from '@/components/pengajuan/berita-acara-template'

export interface PengajuanBeritaAcaraPrintLayerProps {
  templateProps: BeritaAcaraTemplateProps | null
}

/** Lapisan cetak BA di luar tab — selalu ter-mount saat data siap. */
export function PengajuanBeritaAcaraPrintLayer({
  templateProps,
}: PengajuanBeritaAcaraPrintLayerProps) {
  if (templateProps === null) {
    return null
  }
  return (
    <div data-print-area="ba" className="hidden" aria-hidden>
      <BeritaAcaraTemplate {...templateProps} forPrint />
    </div>
  )
}

import {
  SOPPreviewTemplate,
  type SOPPreviewTemplateProps,
} from '@/components/sop/sop-preview-template'
import type { SopPreviewWorkbenchProps } from '@/components/pengajuan/sop-document-preview-pane'
import type { TTESignaturePayload } from '@/types/dto/tte.dto'

export interface PengajuanSopPrintLayerProps {
  previewProps: SopPreviewWorkbenchProps | null
  tteSignaturePayload?: TTESignaturePayload | null
  fallbackSop?: { nama: string; nomor: string } | null
}

/** Lapisan cetak SOP tunggal di luar tab — selalu ter-mount saat data siap. */
export function PengajuanSopPrintLayer({
  previewProps,
  tteSignaturePayload = null,
  fallbackSop = null,
}: PengajuanSopPrintLayerProps) {
  if (previewProps === null && fallbackSop === null) {
    return null
  }
  return (
    <div data-print-area="sop" className="hidden" aria-hidden>
      {previewProps !== null ? (
        <SOPPreviewTemplate
          name={previewProps.name}
          number={previewProps.number}
          metadata={previewProps.metadata as SOPPreviewTemplateProps['metadata']}
          prosedurRows={previewProps.prosedurRows}
          implementers={previewProps.implementers}
          tteSignaturePayload={tteSignaturePayload}
          previewOptions={{ editable: false, showScrollbar: false }}
        />
      ) : fallbackSop !== null ? (
        <SOPPreviewTemplate
          name={fallbackSop.nama}
          number={fallbackSop.nomor}
          tteSignaturePayload={tteSignaturePayload}
          previewOptions={{ editable: false, showScrollbar: false }}
        />
      ) : null}
    </div>
  )
}

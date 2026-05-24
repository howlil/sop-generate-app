import { pdf } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { tteApi } from '@/api/tte'
import {
  SopPdfDocument,
  type SopPdfDocumentProps,
  type SopPdfPrintMode,
} from '@/components/sop/sop-pdf-document'
import { exportSopDiagramSnapshots } from '@/lib/print/sop-diagram-export.util'
import { getValidasiPengesahanUrl } from '@/lib/tte/url'
import type { TTESignaturePayload } from '@/types/dto/tte.dto'

const QR_SIZE = 64

export type SopPdfPrintOptions = {
  signPdf?: boolean
  skipDiagramExport?: boolean
}

export interface PrepareSopPdfDocumentPropsResult {
  props: SopPdfDocumentProps
  diagramExportFailed: boolean
}

async function buildQrDataUrl(payload: TTESignaturePayload | null | undefined): Promise<string | undefined> {
  if (!payload) {
    return undefined
  }
  const url = getValidasiPengesahanUrl(payload.dokumenTteId, payload.userId)
  try {
    return await QRCode.toDataURL(url, { width: QR_SIZE, margin: 1 })
  } catch {
    return undefined
  }
}

export function sanitizeSopPdfFilename(props: SopPdfDocumentProps): string {
  const raw = props.number?.trim() || props.name?.trim() || props.metadata?.name?.trim() || 'sop'
  const sanitized = raw
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
  return `SOP-${sanitized || 'dokumen'}.pdf`
}

function shouldExportDiagrams(props: SopPdfDocumentProps, options?: SopPdfPrintOptions): boolean {
  if (options?.skipDiagramExport) {
    return false
  }
  if ((props.diagramSnapshots?.length ?? 0) > 0) {
    return false
  }
  const printMode: SopPdfPrintMode =
    props.printMode ?? (props.includeHeader === false ? 'diagrams_only' : 'full')
  return (
    printMode === 'diagrams_only' ||
    printMode === 'steps_and_diagrams' ||
    printMode === 'full'
  )
}

/** Siapkan props PDF termasuk ekspor diagram bila diperlukan. */
export async function prepareSopPdfDocumentProps(
  props: SopPdfDocumentProps,
  options?: SopPdfPrintOptions,
): Promise<PrepareSopPdfDocumentPropsResult> {
  if (!shouldExportDiagrams(props, options)) {
    return { props, diagramExportFailed: false }
  }
  try {
    const diagramSnapshots = await exportSopDiagramSnapshots({
      name: props.name,
      prosedurRows: props.prosedurRows ?? [],
      implementers: props.implementers ?? [],
      diagramKonfigurasi: props.diagramKonfigurasi,
    })
    return {
      props: { ...props, diagramSnapshots },
      diagramExportFailed: false,
    }
  } catch {
    return { props, diagramExportFailed: true }
  }
}

export async function buildSopPdfBlob(
  props: SopPdfDocumentProps,
  options?: SopPdfPrintOptions,
): Promise<Blob> {
  const { props: resolvedProps } = await prepareSopPdfDocumentProps(props, options)
  const qrDataUrlKepalaOpd = await buildQrDataUrl(resolvedProps.tteSignaturePayload)
  return pdf(
    <SopPdfDocument
      {...resolvedProps}
      qrDataUrlKepalaOpd={qrDataUrlKepalaOpd}
    />,
  ).toBlob()
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

function base64ToPdfBlob(base64: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: 'application/pdf' })
}

async function signSopPdfBlob(
  blob: Blob,
  props: SopPdfDocumentProps,
  options: SopPdfPrintOptions | undefined,
): Promise<Blob> {
  const shouldSign = options?.signPdf ?? Boolean(props.tteSignaturePayload)
  if (!shouldSign || !props.tteSignaturePayload) {
    return blob
  }

  const response = await tteApi.signPdf({
    dokumenTteId: props.tteSignaturePayload.dokumenTteId,
    userId: props.tteSignaturePayload.userId,
    jenisDokumen: 'SOP_BERLAKU',
    pdfBase64: await blobToBase64(blob),
  })
  return base64ToPdfBlob(response.signedPdfBase64)
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function printBlob(blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.src = url

    const cleanup = () => {
      iframe.remove()
      URL.revokeObjectURL(url)
      window.removeEventListener('afterprint', cleanup)
      resolve()
    }

    iframe.onload = () => {
      const frameWindow = iframe.contentWindow
      if (!frameWindow) {
        window.open(url, '_blank', 'noopener,noreferrer')
        window.setTimeout(cleanup, 1000)
        return
      }
      window.addEventListener('afterprint', cleanup, { once: true })
      frameWindow.focus()
      frameWindow.print()
      window.setTimeout(cleanup, 60_000)
    }

    document.body.appendChild(iframe)
  })
}

export interface SopPdfActionResult {
  diagramExportFailed: boolean
}

export async function downloadSopPdf(
  props: SopPdfDocumentProps,
  options?: SopPdfPrintOptions,
): Promise<SopPdfActionResult> {
  const { props: resolvedProps, diagramExportFailed } = await prepareSopPdfDocumentProps(
    props,
    options,
  )
  const unsignedBlob = await buildSopPdfBlob(resolvedProps, {
    ...options,
    skipDiagramExport: true,
  })
  const downloadableBlob = await signSopPdfBlob(unsignedBlob, resolvedProps, options)
  triggerBlobDownload(downloadableBlob, sanitizeSopPdfFilename(resolvedProps))
  return { diagramExportFailed }
}

export async function printSopPdfDocument(
  props: SopPdfDocumentProps,
  options?: SopPdfPrintOptions,
): Promise<SopPdfActionResult> {
  const { props: resolvedProps, diagramExportFailed } = await prepareSopPdfDocumentProps(
    props,
    options,
  )
  const unsignedBlob = await buildSopPdfBlob(resolvedProps, {
    ...options,
    skipDiagramExport: true,
  })
  const printableBlob = await signSopPdfBlob(unsignedBlob, resolvedProps, options)
  await printBlob(printableBlob)
  return { diagramExportFailed }
}

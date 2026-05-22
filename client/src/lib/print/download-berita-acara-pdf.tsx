import { pdf } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { tteApi } from '@/api/tte'
import {
  BeritaAcaraPdfDocument,
  type BeritaAcaraPdfDocumentProps,
} from '@/components/pengajuan/berita-acara-pdf-document'
import type { BeritaAcaraTemplateProps } from '@/components/pengajuan/berita-acara-template'
import { getValidasiPengesahanUrl } from '@/lib/tte/url'
import type { TTESignaturePayload } from '@/types/dto/tte.dto'

const QR_SIZE = 64

export type BeritaAcaraPdfDownloadOptions = {
  signingPayload?: TTESignaturePayload | null
}

async function buildQrDataUrl(payload: TTESignaturePayload | undefined): Promise<string | undefined> {
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

export interface BeritaAcaraPdfQrUrls {
  qrDataUrlPjEvaluator?: string
  qrDataUrlPjPenyusun?: string
}

export async function buildBeritaAcaraPdfQrUrls(
  props: BeritaAcaraTemplateProps,
): Promise<BeritaAcaraPdfQrUrls> {
  const [qrDataUrlPjEvaluator, qrDataUrlPjPenyusun] = await Promise.all([
    buildQrDataUrl(props.tteSignaturePayloadPjEvaluator),
    buildQrDataUrl(props.tteSignaturePayloadPjPenyusun),
  ])
  return { qrDataUrlPjEvaluator, qrDataUrlPjPenyusun }
}

/** Sanitasi nama file unduhan PDF Berita Acara. */
export function sanitizeBeritaAcaraPdfFilename(props: BeritaAcaraTemplateProps): string {
  const raw = props.nomorBA?.trim() || props.opd.trim() || 'berita-acara'
  const sanitized = raw
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
  return `BA-${sanitized || 'dokumen'}.pdf`
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

async function signBeritaAcaraPdfBlob(
  blob: Blob,
  signingPayload: TTESignaturePayload | null | undefined,
): Promise<Blob> {
  if (!signingPayload) {
    return blob
  }

  const response = await tteApi.signPdf({
    dokumenTteId: signingPayload.dokumenTteId,
    userId: signingPayload.userId,
    jenisDokumen: 'BERITA_ACARA_EVALUASI',
    pdfBase64: await blobToBase64(blob),
  })
  return base64ToPdfBlob(response.signedPdfBase64)
}

export async function downloadBeritaAcaraPdf(
  props: BeritaAcaraTemplateProps,
  options?: BeritaAcaraPdfDownloadOptions,
): Promise<void> {
  const qrUrls = await buildBeritaAcaraPdfQrUrls(props)
  const documentProps: BeritaAcaraPdfDocumentProps = {
    ...props,
    ...qrUrls,
  }
  const unsignedBlob = await pdf(<BeritaAcaraPdfDocument {...documentProps} />).toBlob()
  const downloadableBlob = await signBeritaAcaraPdfBlob(unsignedBlob, options?.signingPayload)
  triggerBlobDownload(downloadableBlob, sanitizeBeritaAcaraPdfFilename(props))
}

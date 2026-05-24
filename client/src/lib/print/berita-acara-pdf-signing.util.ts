import type { SignPdfResponse } from '@/types/dto/tte.dto'

export class PdfSigningNotAppliedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PdfSigningNotAppliedError'
  }
}

export function assertPdfSigningApplied(response: SignPdfResponse): void {
  if (response.signed && response.signatureFormat === 'PKCS7_DETACHED') {
    return
  }
  throw new PdfSigningNotAppliedError(
    'Penandatanganan PDF server tidak diterapkan. Periksa PDF_SIGNING_ENABLED di server atau unduh ulang setelah restart server.',
  )
}

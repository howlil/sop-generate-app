import { describe, expect, it } from 'vitest'
import {
  assertPdfSigningApplied,
  PdfSigningNotAppliedError,
} from '@/lib/print/berita-acara-pdf-signing.util'

describe('assertPdfSigningApplied', () => {
  it('should_pass_when_pkcs7_detached', () => {
    expect(() =>
      assertPdfSigningApplied({
        signed: true,
        signedPdfBase64: 'abc',
        sha256SignedPdf: 'def',
        signatureFormat: 'PKCS7_DETACHED',
        certificate: null,
      }),
    ).not.toThrow()
  })

  it('should_throw_when_unsigned_disabled', () => {
    expect(() =>
      assertPdfSigningApplied({
        signed: false,
        signedPdfBase64: 'abc',
        sha256SignedPdf: 'def',
        signatureFormat: 'UNSIGNED_DISABLED',
        certificate: null,
      }),
    ).toThrow(PdfSigningNotAppliedError)
  })
})

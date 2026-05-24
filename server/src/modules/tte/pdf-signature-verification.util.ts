import { createHash } from 'crypto';
import forge from 'node-forge';
import {
  extractMessageDigestFromPkcs7,
  loadTrustedCertificatesFromP12,
  mapCertificateToResponse,
  type TrustedPdfCertificates,
} from './pdf-signing-certificate.util';

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const PDF_HEADER = Buffer.from('%PDF-');

export type PdfEmbeddedSignatureField = {
  readonly byteRange: readonly [number, number, number, number];
  readonly pkcs7Buffer: Buffer;
};

export type PdfSignatureVerificationEntry = {
  readonly index: number;
  readonly valid: boolean;
  readonly reason: string;
  readonly signerSubject: string;
  readonly signerIssuer: string;
  readonly signedAt: string | null;
  readonly certificate: {
    readonly validFrom: string;
    readonly validTo: string;
    readonly fingerprint: string;
    readonly serialNumber: string;
  };
  readonly checks: {
    readonly digestMatch: boolean;
    readonly chainTrusted: boolean;
    readonly certificatePeriodValid: boolean;
  };
};

export type VerifyPdfSignaturesResult = {
  readonly hasSignatures: boolean;
  readonly allValid: boolean;
  readonly signatures: readonly PdfSignatureVerificationEntry[];
};

export function assertValidPdfBuffer(pdfBuffer: Buffer): void {
  if (pdfBuffer.byteLength === 0 || pdfBuffer.byteLength > MAX_PDF_BYTES) {
    throw new Error('Ukuran PDF tidak valid.');
  }
  if (!pdfBuffer.subarray(0, 5).equals(PDF_HEADER)) {
    throw new Error('Payload bukan file PDF valid.');
  }
}

export function extractPdfSignatureFields(pdfBuffer: Buffer): PdfEmbeddedSignatureField[] {
  const pdfText = pdfBuffer.toString('latin1');
  const byteRangeMatches = [
    ...pdfText.matchAll(/\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/g),
  ];
  const contentsMatches = [
    ...pdfText.matchAll(/\/Contents\s*<([0-9A-Fa-f\s]*?)>/g),
  ];
  const signatureCount = Math.min(byteRangeMatches.length, contentsMatches.length);
  const signatures: PdfEmbeddedSignatureField[] = [];
  for (let index = 0; index < signatureCount; index += 1) {
    const byteRangeMatch = byteRangeMatches[index];
    const contentsMatch = contentsMatches[index];
    if (!byteRangeMatch || !contentsMatch) {
      continue;
    }
    const byteRange: [number, number, number, number] = [
      Number(byteRangeMatch[1]),
      Number(byteRangeMatch[2]),
      Number(byteRangeMatch[3]),
      Number(byteRangeMatch[4]),
    ];
    const pkcs7Buffer = trimPkcs7Buffer(Buffer.from(contentsMatch[1].replace(/\s/g, ''), 'hex'));
    if (pkcs7Buffer.byteLength === 0) {
      continue;
    }
    signatures.push({ byteRange, pkcs7Buffer });
  }
  return signatures;
}

export function verifyPdfSignatures(
  pdfBuffer: Buffer,
  trusted: TrustedPdfCertificates,
  verifiedAt: Date = new Date(),
): VerifyPdfSignaturesResult {
  assertValidPdfBuffer(pdfBuffer);
  const fields = extractPdfSignatureFields(pdfBuffer);
  const signatures = fields.map((field, index) =>
    verifyEmbeddedSignature(pdfBuffer, field, trusted, verifiedAt, index + 1),
  );
  return {
    hasSignatures: signatures.length > 0,
    allValid: signatures.length > 0 && signatures.every((entry) => entry.valid),
    signatures,
  };
}

export function verifyPdfWithP12(
  pdfBuffer: Buffer,
  p12Buffer: Buffer,
  passphrase: string,
  verifiedAt: Date = new Date(),
): VerifyPdfSignaturesResult {
  const trusted = loadTrustedCertificatesFromP12(p12Buffer, passphrase);
  return verifyPdfSignatures(pdfBuffer, trusted, verifiedAt);
}

function verifyEmbeddedSignature(
  pdfBuffer: Buffer,
  field: PdfEmbeddedSignatureField,
  trusted: TrustedPdfCertificates,
  verifiedAt: Date,
  index: number,
): PdfSignatureVerificationEntry {
  const documentDigest = computeDocumentDigest(pdfBuffer, field.byteRange);
  let pkcs7: PkcsSignedDataMessage;
  try {
    const parsed = forge.pkcs7.messageFromAsn1(
      forge.asn1.fromDer(field.pkcs7Buffer.toString('binary')),
    );
    if (!('certificates' in parsed) || !Array.isArray(parsed.certificates)) {
      return buildInvalidEntry(index, 'Struktur PKCS#7 tidak memuat sertifikat.', trusted, verifiedAt);
    }
    pkcs7 = parsed as PkcsSignedDataMessage;
  } catch {
    return buildInvalidEntry(index, 'Struktur PKCS#7 tidak valid.', trusted, verifiedAt);
  }
  const embeddedDigest = extractMessageDigestFromPkcs7(field.pkcs7Buffer);
  const digestMatch = embeddedDigest !== null && embeddedDigest.equals(documentDigest);
  const signingCertificate = findTrustedSigningCertificate(pkcs7, trusted);
  if (!signingCertificate) {
    return buildInvalidEntry(
      index,
      'Sertifikat penandatangan tidak dikenali pada rantai kepercayaan internal.',
      trusted,
      verifiedAt,
      trusted.signingCertificate,
      { digestMatch, chainTrusted: false, certificatePeriodValid: false },
    );
  }
  const chainTrusted = trusted.caCertificate.verify(signingCertificate);
  const certificatePeriodValid = isCertificateValidAt(signingCertificate, verifiedAt);
  const certificate = mapCertificateToResponse(signingCertificate);
  const valid = digestMatch && chainTrusted && certificatePeriodValid;
  const reason = valid
    ? 'Tanda tangan valid dalam ekosistem PKI internal Sistem Informasi SOP.'
    : buildFailureReason({ digestMatch, chainTrusted, certificatePeriodValid });
  return {
    index,
    valid,
    reason,
    signerSubject: certificate.subject,
    signerIssuer: certificate.issuer,
    signedAt: extractSigningTime(field.pkcs7Buffer),
    certificate: {
      validFrom: certificate.validFrom,
      validTo: certificate.validTo,
      fingerprint: certificate.fingerprint,
      serialNumber: certificate.serialNumber,
    },
    checks: {
      digestMatch,
      chainTrusted,
      certificatePeriodValid,
    },
  };
}

type PkcsSignedDataMessage = {
  readonly certificates: readonly forge.pki.Certificate[];
};

function findTrustedSigningCertificate(
  pkcs7: PkcsSignedDataMessage,
  trusted: TrustedPdfCertificates,
): forge.pki.Certificate | null {
  for (const cert of pkcs7.certificates) {
    if (isCertificateAuthority(cert)) {
      continue;
    }
    if (trusted.caCertificate.verify(cert)) {
      return cert;
    }
  }
  return null;
}

function buildInvalidEntry(
  index: number,
  reason: string,
  trusted: TrustedPdfCertificates,
  verifiedAt: Date,
  signingCertificate: forge.pki.Certificate = trusted.signingCertificate,
  checks: PdfSignatureVerificationEntry['checks'] = {
    digestMatch: false,
    chainTrusted: false,
    certificatePeriodValid: isCertificateValidAt(signingCertificate, verifiedAt),
  },
): PdfSignatureVerificationEntry {
  const certificate = mapCertificateToResponse(signingCertificate);
  return {
    index,
    valid: false,
    reason,
    signerSubject: certificate.subject,
    signerIssuer: certificate.issuer,
    signedAt: null,
    certificate: {
      validFrom: certificate.validFrom,
      validTo: certificate.validTo,
      fingerprint: certificate.fingerprint,
      serialNumber: certificate.serialNumber,
    },
    checks,
  };
}

function buildFailureReason(checks: PdfSignatureVerificationEntry['checks']): string {
  const failures: string[] = [];
  if (!checks.digestMatch) {
    failures.push('integritas dokumen tidak cocok (hash byte range)');
  }
  if (!checks.chainTrusted) {
    failures.push('rantai sertifikat tidak dipercaya oleh CA internal');
  }
  if (!checks.certificatePeriodValid) {
    failures.push('sertifikat di luar masa berlaku');
  }
  return failures.join('; ');
}

function computeDocumentDigest(
  pdfBuffer: Buffer,
  byteRange: readonly [number, number, number, number],
): Buffer {
  const [start1, length1, start2, length2] = byteRange;
  const part1 = pdfBuffer.subarray(start1, start1 + length1);
  const part2 = pdfBuffer.subarray(start2, start2 + length2);
  return createHash('sha256').update(Buffer.concat([part1, part2])).digest();
}

function trimPkcs7Buffer(buffer: Buffer): Buffer {
  let end = buffer.length;
  while (end > 0 && buffer[end - 1] === 0) {
    end -= 1;
  }
  return buffer.subarray(0, end);
}

function isCertificateValidAt(cert: forge.pki.Certificate, at: Date): boolean {
  return at >= cert.validity.notBefore && at <= cert.validity.notAfter;
}

function isCertificateAuthority(cert: forge.pki.Certificate): boolean {
  const basicConstraints = cert.getExtension({ name: 'basicConstraints' }) as { cA?: boolean } | null;
  return Boolean(basicConstraints?.cA);
}

function extractSigningTime(pkcs7Buffer: Buffer): string | null {
  const signingTimeOidHex = '06092a864886f70d010905';
  const pkcs7Hex = pkcs7Buffer.toString('hex');
  const oidIndex = pkcs7Hex.indexOf(signingTimeOidHex);
  if (oidIndex < 0) {
    return null;
  }
  const afterOid = pkcs7Hex.slice(oidIndex + signingTimeOidHex.length);
  const utcTagIndex = afterOid.indexOf('170d');
  if (utcTagIndex < 0) {
    return null;
  }
  const utcHex = afterOid.slice(utcTagIndex + 4, utcTagIndex + 4 + 28);
  if (utcHex.length < 24) {
    return null;
  }
  const year = utcHex.slice(0, 4);
  const month = utcHex.slice(4, 6);
  const day = utcHex.slice(6, 8);
  const hour = utcHex.slice(8, 10);
  const minute = utcHex.slice(10, 12);
  const second = utcHex.slice(12, 14);
  const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

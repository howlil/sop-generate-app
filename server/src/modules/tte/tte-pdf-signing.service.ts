import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import forge from 'node-forge';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { P12Signer } from '@signpdf/signer-p12';
import { SignPdf } from '@signpdf/signpdf';
import type { JwtAccessPayload } from '../../common';
import { SignPdfDto } from './dto/sign-pdf.dto';
import { TteRepository } from './tte.repository';

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const DEFAULT_SIGNATURE_LENGTH = 32_000;

export type PdfCertificateResponse = {
  readonly subject: string;
  readonly issuer: string;
  readonly serialNumber: string;
  readonly fingerprint: string;
  readonly validFrom: string;
  readonly validTo: string;
};

export type SignPdfResponse = {
  readonly signed: boolean;
  readonly signedPdfBase64: string;
  readonly sha256SignedPdf: string;
  readonly signatureFormat: 'PKCS7_DETACHED' | 'UNSIGNED_DISABLED';
  readonly certificate: PdfCertificateResponse | null;
};

type PdfSigningConfig = {
  readonly enabled: boolean;
  readonly p12Base64?: string;
  readonly passphrase: string;
  readonly reason: string;
  readonly location: string;
  readonly contactInfo: string;
};

@Injectable()
export class TtePdfSigningService {
  constructor(
    private readonly configService: ConfigService,
    private readonly repository: TteRepository,
  ) {}

  async signPdf(user: JwtAccessPayload, dto: SignPdfDto): Promise<SignPdfResponse> {
    if (dto.userId !== user.sub) {
      throw new ForbiddenException('PDF hanya bisa ditandatangani oleh pemilik riwayat TTE.');
    }

    const pdfBuffer = this.decodePdf(dto.pdfBase64);
    const riwayat = await this.repository.findRiwayatForPdfSigning(dto.userId, dto.dokumenTteId);
    if (riwayat === null) {
      throw new NotFoundException('Riwayat tanda tangan dokumen tidak ditemukan.');
    }
    if (riwayat.dokumenTte.jenisDokumen !== dto.jenisDokumen) {
      throw new BadRequestException('Jenis dokumen tidak sesuai dengan riwayat TTE.');
    }

    const config = this.getConfig();
    if (!config.enabled) {
      return this.buildDisabledResponse(pdfBuffer);
    }
    if (!config.p12Base64) {
      throw new ServiceUnavailableException('Konfigurasi sertifikat PDF belum tersedia.');
    }

    const p12Buffer = Buffer.from(config.p12Base64, 'base64');
    const signingTime = new Date();
    const certificate = this.readCertificate(p12Buffer, config.passphrase);
    const placeholderPdf = plainAddPlaceholder({
      pdfBuffer,
      reason: config.reason,
      contactInfo: config.contactInfo,
      name: riwayat.user.nama,
      location: config.location,
      signingTime,
      signatureLength: DEFAULT_SIGNATURE_LENGTH,
    });

    try {
      const signer = new P12Signer(p12Buffer, {
        passphrase: config.passphrase,
        asn1StrictParsing: false,
      });
      const signedPdf = await new SignPdf().sign(placeholderPdf, signer, signingTime);
      return {
        signed: true,
        signedPdfBase64: signedPdf.toString('base64'),
        sha256SignedPdf: this.sha256Hex(signedPdf),
        signatureFormat: 'PKCS7_DETACHED',
        certificate,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? `Gagal menandatangani PDF: ${error.message}`
          : 'Gagal menandatangani PDF.',
      );
    }
  }

  private getConfig(): PdfSigningConfig {
    return {
      enabled: this.configService.get<boolean>('PDF_SIGNING_ENABLED', false),
      p12Base64: this.configService.get<string>('PDF_SIGNING_P12_BASE64'),
      passphrase: this.configService.get<string>('PDF_SIGNING_P12_PASSPHRASE', ''),
      reason: this.configService.get<string>('PDF_SIGNING_REASON', 'Pengesahan dokumen SOP'),
      location: this.configService.get<string>('PDF_SIGNING_LOCATION', 'Indonesia'),
      contactInfo: this.configService.get<string>('PDF_SIGNING_CONTACT', ''),
    };
  }

  private decodePdf(pdfBase64: string): Buffer {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    if (pdfBuffer.byteLength === 0 || pdfBuffer.byteLength > MAX_PDF_BYTES) {
      throw new BadRequestException('Ukuran PDF tidak valid.');
    }
    if (!pdfBuffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
      throw new BadRequestException('Payload bukan file PDF valid.');
    }
    return pdfBuffer;
  }

  private buildDisabledResponse(pdfBuffer: Buffer): SignPdfResponse {
    return {
      signed: false,
      signedPdfBase64: pdfBuffer.toString('base64'),
      sha256SignedPdf: this.sha256Hex(pdfBuffer),
      signatureFormat: 'UNSIGNED_DISABLED',
      certificate: null,
    };
  }

  private sha256Hex(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private readCertificate(p12Buffer: Buffer, passphrase: string): PdfCertificateResponse {
    try {
      const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'));
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
      const cert = certBags?.[0]?.cert;
      if (!cert) {
        throw new Error('Certificate bag tidak ditemukan.');
      }
      const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
      return {
        subject: this.formatDistinguishedName(cert.subject.attributes),
        issuer: this.formatDistinguishedName(cert.issuer.attributes),
        serialNumber: cert.serialNumber,
        fingerprint: createHash('sha256').update(Buffer.from(certDer, 'binary')).digest('hex'),
        validFrom: cert.validity.notBefore.toISOString(),
        validTo: cert.validity.notAfter.toISOString(),
      };
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error
          ? `Sertifikat PDF tidak bisa dibaca: ${error.message}`
          : 'Sertifikat PDF tidak bisa dibaca.',
      );
    }
  }

  private formatDistinguishedName(attributes: forge.pki.CertificateField[]): string {
    return attributes
      .map((attribute) => {
        const key = attribute.shortName ?? attribute.name ?? attribute.type;
        return `${key}=${attribute.value}`;
      })
      .join(', ');
  }
}

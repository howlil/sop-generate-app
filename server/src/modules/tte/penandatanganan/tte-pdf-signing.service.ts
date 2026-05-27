import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { P12Signer } from '@signpdf/signer-p12';
import { SignPdf } from '@signpdf/signpdf';
import { PDFDocument } from 'pdf-lib';
import type { JwtAccessPayload } from '../../../common';
import { PDF_BASE64_MAX_LENGTH, PDF_BINARY_MAX_BYTES } from '../../../common/http/request-body-limits';
import { JenisDokumenTte, PeranPengguna, StatusPengajuanEvaluasi } from '../../../generated/prisma';
import { SignBeritaAcaraArsipDto } from '../shared/dto/sign-berita-acara-arsip.dto';
import { SignPdfDto } from '../shared/dto/sign-pdf.dto';
import { VerifyPdfDto } from '../shared/dto/verify-pdf.dto';
import {
  loadTrustedCertificatesFromP12,
  mapCertificateToResponse,
  type PdfCertificateResponse,
} from '../shared/utils/pdf-signing-certificate.util';

export type { PdfCertificateResponse } from '../shared/utils/pdf-signing-certificate.util';
import {
  assertValidPdfBuffer,
  buildPdfTteSigningReason,
  extractPdfSignatureFields,
  verifyPdfWithP12,
  type PdfSignatureVerificationEntry,
  type VerifyPdfSignaturesResult,
} from '../shared/utils/pdf-signature-verification.util';
import { TteRepository, type PdfSignatureMetadataInput } from '../shared/repository/tte.repository';

const DEFAULT_SIGNATURE_LENGTH = 32_000;

export type SignPdfResponse = {
  readonly signed: boolean;
  readonly signedPdfBase64: string;
  readonly sha256SignedPdf: string;
  readonly signatureFormat: 'PKCS7_DETACHED' | 'UNSIGNED_DISABLED';
  readonly certificate: PdfCertificateResponse | null;
};

export type PdfSigningStatusResponse = {
  readonly enabled: boolean;
  readonly trustedCaSubject: string | null;
  readonly trustedSignerSubject: string | null;
  readonly verificationPath: string;
  /** Penjelasan jika `enabled=false` padahal env sudah diatur (mis. P12 rusak atau perlu restart server). */
  readonly configError?: string;
};

export type VerifyPdfResponse = {
  readonly pdfSigningEnabled: boolean;
  readonly trustedCaSubject: string | null;
  readonly hasSignatures: boolean;
  readonly allValid: boolean;
  readonly signatures: readonly PdfSignatureVerificationEntryWithTteMatch[];
  readonly disclaimer: string;
};

export type PdfSignatureTteMatch = {
  readonly matched: boolean;
  readonly reason: string;
  readonly dokumenTteId?: string;
  readonly userId?: string;
  readonly peran?: string;
  readonly jenisDokumen?: string;
  readonly nomorDokumen?: string;
  readonly judulDokumen?: string;
  readonly ditandatanganiPada?: string;
};

export type PdfSignatureVerificationEntryWithTteMatch = PdfSignatureVerificationEntry & {
  readonly tteMatch: PdfSignatureTteMatch;
};

type PdfSigningConfig = {
  readonly enabled: boolean;
  readonly p12Base64?: string;
  readonly passphrase: string;
  readonly reason: string;
  readonly location: string;
  readonly contactInfo: string;
};

const PDF_VERIFICATION_DISCLAIMER =
  'Verifikasi ini memakai CA internal Sistem Informasi SOP. Untuk TTE tersertifikasi nasional, gunakan portal resmi Komdigi atau BSrE.';

const BERITA_ACARA_ARSIP_SIGNER_NAME = 'Sistem Informasi SOP';
const BERITA_ACARA_ARSIP_SIGN_REASON = 'Arsip Berita Acara Evaluasi — Sistem Informasi SOP';

const BERITA_ACARA_ARSIP_ALLOWED_STATUSES: ReadonlySet<StatusPengajuanEvaluasi> = new Set([
  StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
  StatusPengajuanEvaluasi.SELESAI,
]);

@Injectable()
export class TtePdfSigningService {
  private readonly logger = new Logger(TtePdfSigningService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly repository: TteRepository,
  ) {}

  getPdfSigningStatus(): PdfSigningStatusResponse {
    const config = this.getConfig();
    if (!config.enabled) {
      return {
        enabled: false,
        trustedCaSubject: null,
        trustedSignerSubject: null,
        verificationPath: '/validasi/pdf',
        configError:
          'PDF_SIGNING_ENABLED tidak aktif. Set PDF_SIGNING_ENABLED=true di server/.env lalu restart server.',
      };
    }
    if (!config.p12Base64) {
      return {
        enabled: false,
        trustedCaSubject: null,
        trustedSignerSubject: null,
        verificationPath: '/validasi/pdf',
        configError:
          'PDF_SIGNING_P12_BASE64 kosong. Jalankan npm run pdf-signing:generate-cert di folder server, salin ke .env, lalu restart server.',
      };
    }
    try {
      const trusted = loadTrustedCertificatesFromP12(
        Buffer.from(config.p12Base64, 'base64'),
        config.passphrase,
      );
      return {
        enabled: true,
        trustedCaSubject: trusted.caSubject,
        trustedSignerSubject: trusted.signingSubject,
        verificationPath: '/validasi/pdf',
      };
    } catch (error) {
      const configError = error instanceof Error ? error.message : 'Gagal memuat sertifikat P12.';
      this.logger.warn(`Status PDF signing: ${configError}`);
      return {
        enabled: false,
        trustedCaSubject: null,
        trustedSignerSubject: null,
        verificationPath: '/validasi/pdf',
        configError: `${configError} Setelah memperbaiki .env, restart server Nest (pnpm start:dev).`,
      };
    }
  }

  async verifyPdf(dto: VerifyPdfDto): Promise<VerifyPdfResponse> {
    const pdfBuffer = this.decodePdf(dto.pdfBase64);
    const config = this.getConfig();
    if (!config.enabled || !config.p12Base64) {
      return {
        pdfSigningEnabled: false,
        trustedCaSubject: null,
        hasSignatures: false,
        allValid: false,
        signatures: [],
        disclaimer: PDF_VERIFICATION_DISCLAIMER,
      };
    }
    let verification: VerifyPdfSignaturesResult;
    try {
      verification = verifyPdfWithP12(
        pdfBuffer,
        Buffer.from(config.p12Base64, 'base64'),
        config.passphrase,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memverifikasi PDF.';
      if (
        message.includes('P12') ||
        message.includes('PDF_SIGNING') ||
        message.includes('sertifikat')
      ) {
        throw new ServiceUnavailableException(message);
      }
      throw new BadRequestException(message);
    }
    const trusted = loadTrustedCertificatesFromP12(
      Buffer.from(config.p12Base64, 'base64'),
      config.passphrase,
    );
    const signatures = await Promise.all(
      verification.signatures.map((entry) => this.attachTteMatch(entry)),
    );
    return {
      pdfSigningEnabled: true,
      trustedCaSubject: trusted.caSubject,
      hasSignatures: verification.hasSignatures,
      allValid: verification.allValid && signatures.every((entry) => entry.tteMatch.matched),
      signatures,
      disclaimer: PDF_VERIFICATION_DISCLAIMER,
    };
  }

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
    const signed = await this.applyPkcs7Signature(
      pdfBuffer,
      { ...config, p12Base64: config.p12Base64 },
      {
        name: riwayat.user.nama,
        reason: buildPdfTteSigningReason(config.reason, {
          dokumenTteId: dto.dokumenTteId,
          userId: dto.userId,
          jenisDokumen: String(dto.jenisDokumen),
        }),
      },
    );
    await this.repository.updateRiwayatPdfSignatureMetadata({
      userId: dto.userId,
      dokumenTteId: dto.dokumenTteId,
      metadata: signed.riwayatMetadata,
    });
    return signed.response;
  }

  async signBeritaAcaraArsip(
    user: JwtAccessPayload,
    dto: SignBeritaAcaraArsipDto,
  ): Promise<SignPdfResponse> {
    const pengguna = await this.repository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }
    if (pengguna.peran !== PeranPengguna.KEPALA_OPD) {
      throw new ForbiddenException('Penandatanganan arsip Berita Acara hanya untuk Kepala OPD.');
    }
    const pdfBuffer = this.decodePdf(dto.pdfBase64);
    const pengajuan = await this.repository.findBeritaAcaraArsipForPdfSigning(
      dto.pengajuanEvaluasiId,
    );
    if (pengajuan === null) {
      throw new NotFoundException('Pengajuan evaluasi tidak ditemukan.');
    }
    if (pengajuan.opdId !== pengguna.opdId) {
      throw new ForbiddenException('Pengajuan evaluasi bukan milik OPD Anda.');
    }
    if (!BERITA_ACARA_ARSIP_ALLOWED_STATUSES.has(pengajuan.status)) {
      throw new BadRequestException(
        'Berita Acara belum siap arsip: kedua PJ harus menandatangani TTE terlebih dahulu.',
      );
    }
    const dokumen = pengajuan.dokumenTte;
    if (dokumen === null) {
      throw new BadRequestException('Dokumen TTE Berita Acara belum tersedia.');
    }
    if (dokumen.jenisDokumen !== JenisDokumenTte.BERITA_ACARA_EVALUASI) {
      throw new BadRequestException('Jenis dokumen TTE bukan Berita Acara evaluasi.');
    }
    const signedPerans = new Set(dokumen.riwayatTandaTangan.map((entry) => entry.peran));
    if (
      !signedPerans.has(PeranPengguna.PJ_EVALUATOR) ||
      !signedPerans.has(PeranPengguna.PJ_PENYUSUN)
    ) {
      throw new BadRequestException(
        'Riwayat TTE PJ Evaluator dan PJ Penyusun belum lengkap untuk arsip PDF.',
      );
    }
    const bindingRiwayat = this.selectBeritaAcaraArsipBinding(dokumen.riwayatTandaTangan);
    if (bindingRiwayat === null) {
      throw new BadRequestException('Riwayat TTE Berita Acara tidak valid untuk arsip PDF.');
    }
    const config = this.getConfig();
    if (!config.enabled) {
      return this.buildDisabledResponse(pdfBuffer);
    }
    if (!config.p12Base64) {
      throw new ServiceUnavailableException('Konfigurasi sertifikat PDF belum tersedia.');
    }
    const opdLabel = pengajuan.opd.nama.trim() || BERITA_ACARA_ARSIP_SIGNER_NAME;
    const signed = await this.applyPkcs7Signature(
      pdfBuffer,
      { ...config, p12Base64: config.p12Base64 },
      {
        name: `${BERITA_ACARA_ARSIP_SIGNER_NAME} (${opdLabel})`,
        reason: buildPdfTteSigningReason(BERITA_ACARA_ARSIP_SIGN_REASON, {
          dokumenTteId: dokumen.dokumenTteId,
          userId: bindingRiwayat.userId,
          jenisDokumen: String(dokumen.jenisDokumen),
        }),
      },
    );
    await this.repository.updateRiwayatPdfSignatureMetadata({
      userId: bindingRiwayat.userId,
      dokumenTteId: dokumen.dokumenTteId,
      metadata: signed.riwayatMetadata,
    });
    return signed.response;
  }

  private async buildPlaceholderPdf(
    pdfBuffer: Buffer,
    config: PdfSigningConfig,
    placeholder: { name: string; reason: string },
    signingTime: Date,
  ): Promise<Buffer> {
    const placeholderInput = {
      reason: placeholder.reason,
      contactInfo: config.contactInfo,
      name: placeholder.name,
      location: config.location,
      signingTime,
      signatureLength: DEFAULT_SIGNATURE_LENGTH,
    };
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      pdflibAddPlaceholder({ pdfDoc, ...placeholderInput });
      return Buffer.from(
        await pdfDoc.save({
          useObjectStreams: false,
          addDefaultPage: false,
          updateFieldAppearances: false,
        }),
      );
    } catch (pdflibError) {
      const detail =
        pdflibError instanceof Error ? pdflibError.message : 'format PDF tidak dikenali';
      this.logger.warn(`Placeholder pdf-lib gagal (${detail}); mencoba plainAddPlaceholder.`);
      return plainAddPlaceholder({ pdfBuffer, ...placeholderInput });
    }
  }

  private async applyPkcs7Signature(
    pdfBuffer: Buffer,
    config: PdfSigningConfig & { p12Base64: string },
    placeholder: { name: string; reason: string },
  ): Promise<{ response: SignPdfResponse; riwayatMetadata: PdfSignatureMetadataInput }> {
    const p12Buffer = Buffer.from(config.p12Base64, 'base64');
    const signingTime = new Date();
    try {
      const trusted = loadTrustedCertificatesFromP12(p12Buffer, config.passphrase);
      const certificate = mapCertificateToResponse(trusted.signingCertificate);
      const placeholderPdf = await this.buildPlaceholderPdf(
        pdfBuffer,
        config,
        placeholder,
        signingTime,
      );
      const signer = new P12Signer(p12Buffer, {
        passphrase: config.passphrase,
        asn1StrictParsing: false,
      });
      const signedPdf = await new SignPdf().sign(placeholderPdf, signer, signingTime);
      const signatureFields = extractPdfSignatureFields(signedPdf);
      const pkcs7Signature = signatureFields[signatureFields.length - 1]?.pkcs7Buffer;
      const signatureValue =
        pkcs7Signature === undefined ? this.sha256Hex(signedPdf) : this.sha256Hex(pkcs7Signature);
      return {
        response: {
          signed: true,
          signedPdfBase64: signedPdf.toString('base64'),
          sha256SignedPdf: this.sha256Hex(signedPdf),
          signatureFormat: 'PKCS7_DETACHED',
          certificate,
        },
        riwayatMetadata: {
          signatureValue: `sha256:${signatureValue}`,
          signatureAlgorithm: 'SHA256withRSA',
          signatureFormat: 'PKCS7_DETACHED',
          certSerialNumber: certificate.serialNumber,
          certIssuer: certificate.issuer,
          certSubject: certificate.subject,
          certFingerprint: certificate.fingerprint,
          certValidFrom: new Date(certificate.validFrom),
          certValidTo: new Date(certificate.validTo),
        },
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
    const p12Raw = this.configService.get<string>('PDF_SIGNING_P12_BASE64');
    return {
      enabled: this.readEnvBoolean('PDF_SIGNING_ENABLED', false),
      p12Base64: typeof p12Raw === 'string' && p12Raw.trim() !== '' ? p12Raw.trim() : undefined,
      passphrase: this.configService.get<string>('PDF_SIGNING_P12_PASSPHRASE', ''),
      reason: this.configService.get<string>('PDF_SIGNING_REASON', 'Pengesahan dokumen SOP'),
      location: this.configService.get<string>('PDF_SIGNING_LOCATION', 'Indonesia'),
      contactInfo: this.configService.get<string>('PDF_SIGNING_CONTACT', ''),
    };
  }

  private readEnvBoolean(key: string, fallback: boolean): boolean {
    const value = this.configService.get<boolean | string | undefined>(key);
    if (value === undefined) {
      return fallback;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
    return fallback;
  }

  private decodePdf(pdfBase64: string): Buffer {
    if (pdfBase64.length > PDF_BASE64_MAX_LENGTH) {
      throw new BadRequestException('Ukuran PDF melebihi batas unggah.');
    }
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    if (pdfBuffer.byteLength > PDF_BINARY_MAX_BYTES) {
      throw new BadRequestException('Ukuran PDF melebihi batas unggah.');
    }
    try {
      assertValidPdfBuffer(pdfBuffer);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Ukuran PDF tidak valid.',
      );
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

  private selectBeritaAcaraArsipBinding(
    riwayat: readonly { userId: string; peran: PeranPengguna; ditandatanganiPada: Date }[],
  ): { userId: string; peran: PeranPengguna } | null {
    const pjPenyusun = riwayat.find((entry) => entry.peran === PeranPengguna.PJ_PENYUSUN);
    if (pjPenyusun) {
      return { userId: pjPenyusun.userId, peran: pjPenyusun.peran };
    }
    const pjEvaluator = riwayat.find((entry) => entry.peran === PeranPengguna.PJ_EVALUATOR);
    return pjEvaluator ? { userId: pjEvaluator.userId, peran: pjEvaluator.peran } : null;
  }

  private sha256Hex(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private async attachTteMatch(
    entry: PdfSignatureVerificationEntry,
  ): Promise<PdfSignatureVerificationEntryWithTteMatch> {
    const binding = entry.binding;
    if (binding === null) {
      return {
        ...entry,
        tteMatch: {
          matched: false,
          reason:
            'Signature PDF valid kriptografis, tetapi tidak memuat binding dokumen TTE aplikasi.',
        },
      };
    }
    const row = await this.repository.findRiwayatByPdfSignatureBinding({
      userId: binding.userId,
      dokumenTteId: binding.dokumenTteId,
    });
    if (row === null) {
      return {
        ...entry,
        tteMatch: {
          matched: false,
          reason: 'Binding signature tidak ditemukan pada riwayat TTE aplikasi.',
          dokumenTteId: binding.dokumenTteId,
          userId: binding.userId,
          jenisDokumen: binding.jenisDokumen,
        },
      };
    }
    if (String(row.dokumenTte.jenisDokumen) !== binding.jenisDokumen) {
      return {
        ...entry,
        tteMatch: {
          matched: false,
          reason: 'Jenis dokumen pada signature PDF tidak cocok dengan riwayat TTE aplikasi.',
          dokumenTteId: row.dokumenTteId,
          userId: row.userId,
          peran: String(row.peran),
          jenisDokumen: String(row.dokumenTte.jenisDokumen),
        },
      };
    }
    if (
      row.signatureValue === null ||
      row.certFingerprint === null ||
      row.certSerialNumber === null
    ) {
      return {
        ...entry,
        tteMatch: {
          matched: false,
          reason: 'Riwayat TTE ditemukan, tetapi metadata signature PDF belum tersimpan.',
          dokumenTteId: row.dokumenTteId,
          userId: row.userId,
          peran: String(row.peran),
          jenisDokumen: String(row.dokumenTte.jenisDokumen),
          nomorDokumen: row.dokumenTte.nomorDokumen,
          judulDokumen: row.dokumenTte.judulDokumen,
          ditandatanganiPada: row.ditandatanganiPada.toISOString(),
        },
      };
    }
    const certMatches =
      row.certFingerprint === entry.certificate.fingerprint &&
      row.certSerialNumber === entry.certificate.serialNumber;
    const signatureValueMatches = row.signatureValue === entry.signatureValue;
    return {
      ...entry,
      tteMatch: {
        matched: entry.valid && certMatches && signatureValueMatches,
        reason:
          entry.valid && certMatches && signatureValueMatches
            ? 'Signature PDF cocok dengan riwayat TTE aplikasi, signature value, dan sertifikat yang tersimpan.'
            : 'Signature PDF tidak cocok dengan signature value/fingerprint/serial sertifikat pada riwayat TTE aplikasi.',
        dokumenTteId: row.dokumenTteId,
        userId: row.userId,
        peran: String(row.peran),
        jenisDokumen: String(row.dokumenTte.jenisDokumen),
        nomorDokumen: row.dokumenTte.nomorDokumen,
        judulDokumen: row.dokumenTte.judulDokumen,
        ditandatanganiPada: row.ditandatanganiPada.toISOString(),
      },
    };
  }
}

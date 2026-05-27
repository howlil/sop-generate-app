import { execSync } from 'child_process';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JenisDokumenTte, PeranPengguna, StatusPengajuanEvaluasi } from '../../../generated/prisma';
import { verifyPdfWithP12 } from '../shared/utils/pdf-signature-verification.util';
import { TtePdfSigningService } from './tte-pdf-signing.service';
import { TteRepository } from '../shared/repository/tte.repository';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require(
  require.resolve('pdfkit', { paths: [require.resolve('@signpdf/placeholder-plain')] }),
);

describe('Pengujian TtePdfSigningService.signBeritaAcaraArsip', () => {
  let service: TtePdfSigningService;
  let repository: {
    findPenggunaAktif: jest.Mock;
    findBeritaAcaraArsipForPdfSigning: jest.Mock;
    findRiwayatForPdfSigning: jest.Mock;
    updateRiwayatPdfSignatureMetadata: jest.Mock;
  };
  let p12Base64 = '';
  const passphrase = 'test-passphrase';
  const kepalaOpdUser = {
    sub: 'kepala-1',
    email: 'k@opd.id',
    peran: PeranPengguna.KEPALA_OPD,
    opdId: 'opd-1',
  };

  beforeAll(() => {
    const output = execSync(`node scripts/generate-pdf-signing-cert.cjs ${passphrase}`, {
      encoding: 'utf8',
    });
    const line = output.split('\n').find((entry) => entry.startsWith('PDF_SIGNING_P12_BASE64='));
    if (!line) {
      throw new Error('Gagal menghasilkan sertifikat uji PDF.');
    }
    p12Base64 = line.split('=')[1];
  });

  beforeEach(async () => {
    repository = {
      findPenggunaAktif: jest.fn(),
      findBeritaAcaraArsipForPdfSigning: jest.fn(),
      findRiwayatForPdfSigning: jest.fn(),
      updateRiwayatPdfSignatureMetadata: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TtePdfSigningService,
        {
          provide: TteRepository,
          useValue: repository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => {
              const values: Record<string, unknown> = {
                PDF_SIGNING_ENABLED: true,
                PDF_SIGNING_P12_BASE64: p12Base64,
                PDF_SIGNING_P12_PASSPHRASE: passphrase,
                PDF_SIGNING_REASON: 'Uji',
                PDF_SIGNING_LOCATION: 'Indonesia',
                PDF_SIGNING_CONTACT: '',
              };
              return values[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();
    service = module.get(TtePdfSigningService);
    repository.findPenggunaAktif.mockResolvedValue({
      penggunaId: kepalaOpdUser.sub,
      peran: PeranPengguna.KEPALA_OPD,
      opdId: 'opd-1',
      nama: 'Kepala OPD',
      nip: '123',
      jabatan: 'Kepala',
      pangkat: 'IV/a',
      email: 'k@opd.id',
    });
  });

  it('seharusnya menolak ketika pengajuan status tidak siap untuk arsip', async () => {
    repository.findBeritaAcaraArsipForPdfSigning.mockResolvedValue({
      pengajuanEvaluasiId: 'pgj-1',
      status: StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR,
      opdId: 'opd-1',
      opd: { nama: 'Dinkes' },
      dokumenTte: {
        dokumenTteId: 'doc-1',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        pengajuanEvaluasiId: 'pgj-1',
        riwayatTandaTangan: [
          { userId: 'pj-evaluator-1', peran: PeranPengguna.PJ_EVALUATOR },
          { userId: 'pj-penyusun-1', peran: PeranPengguna.PJ_PENYUSUN },
        ],
      },
    });
    const pdfBase64 = (await createSamplePdf()).toString('base64');
    await expect(
      service.signBeritaAcaraArsip(kepalaOpdUser, {
        pengajuanEvaluasiId: 'pgj-1',
        pdfBase64,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('seharusnya menolak ketika riwayat PJ belum lengkap', async () => {
    repository.findBeritaAcaraArsipForPdfSigning.mockResolvedValue({
      pengajuanEvaluasiId: 'pgj-1',
      status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
      opdId: 'opd-1',
      opd: { nama: 'Dinkes' },
      dokumenTte: {
        dokumenTteId: 'doc-1',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        pengajuanEvaluasiId: 'pgj-1',
        riwayatTandaTangan: [{ userId: 'pj-evaluator-1', peran: PeranPengguna.PJ_EVALUATOR }],
      },
    });
    const pdfBase64 = (await createSamplePdf()).toString('base64');
    await expect(
      service.signBeritaAcaraArsip(kepalaOpdUser, {
        pengajuanEvaluasiId: 'pgj-1',
        pdfBase64,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('seharusnya menolak ketika OPD tidak cocok', async () => {
    repository.findBeritaAcaraArsipForPdfSigning.mockResolvedValue({
      pengajuanEvaluasiId: 'pgj-1',
      status: StatusPengajuanEvaluasi.SELESAI,
      opdId: 'opd-lain',
      opd: { nama: 'Dinkes' },
      dokumenTte: {
        dokumenTteId: 'doc-1',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        pengajuanEvaluasiId: 'pgj-1',
        riwayatTandaTangan: [
          { userId: 'pj-evaluator-1', peran: PeranPengguna.PJ_EVALUATOR },
          { userId: 'pj-penyusun-1', peran: PeranPengguna.PJ_PENYUSUN },
        ],
      },
    });
    const pdfBase64 = (await createSamplePdf()).toString('base64');
    await expect(
      service.signBeritaAcaraArsip(kepalaOpdUser, {
        pengajuanEvaluasiId: 'pgj-1',
        pdfBase64,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('seharusnya menandatangani PDF ketika arsip siap dan penandatanganan PDF aktif', async () => {
    repository.findBeritaAcaraArsipForPdfSigning.mockResolvedValue({
      pengajuanEvaluasiId: 'pgj-1',
      status: StatusPengajuanEvaluasi.SELESAI,
      opdId: 'opd-1',
      opd: { nama: 'Dinkes' },
      dokumenTte: {
        dokumenTteId: 'doc-1',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        pengajuanEvaluasiId: 'pgj-1',
        riwayatTandaTangan: [
          { userId: 'pj-evaluator-1', peran: PeranPengguna.PJ_EVALUATOR },
          { userId: 'pj-penyusun-1', peran: PeranPengguna.PJ_PENYUSUN },
        ],
      },
    });
    const pdfBase64 = (await createSamplePdf()).toString('base64');
    const actual = await service.signBeritaAcaraArsip(kepalaOpdUser, {
      pengajuanEvaluasiId: 'pgj-1',
      pdfBase64,
    });
    expect(actual.signed).toBe(true);
    expect(actual.signatureFormat).toBe('PKCS7_DETACHED');
    expect(actual.certificate).not.toBeNull();
    expect(actual.signedPdfBase64.length).toBeGreaterThan(pdfBase64.length);
    expect(repository.updateRiwayatPdfSignatureMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'pj-penyusun-1',
        dokumenTteId: 'doc-1',
        metadata: expect.objectContaining({
          signatureAlgorithm: 'SHA256withRSA',
          signatureFormat: 'PKCS7_DETACHED',
        }),
      }),
    );
    const verification = verifyPdfWithP12(
      Buffer.from(actual.signedPdfBase64, 'base64'),
      Buffer.from(p12Base64, 'base64'),
      passphrase,
    );
    expect(verification.signatures[0]?.binding).toEqual({
      dokumenTteId: 'doc-1',
      userId: 'pj-penyusun-1',
      jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
    });
  });

  it('seharusnya menyimpan metadata sertifikat real dan binding TTE pada PDF', async () => {
    const userId = '00000000-0000-4000-8000-0000000000aa';
    const dokumenTteId = '00000000-0000-4000-8000-0000000000bb';
    repository.findRiwayatForPdfSigning.mockResolvedValue({
      userId,
      dokumenTteId,
      peran: PeranPengguna.PJ_EVALUATOR,
      ditandatanganiPada: new Date('2026-05-01T00:00:00.000Z'),
      dokumenTte: {
        dokumenTteId,
        nomorDokumen: 'BA-REAL-CERT',
        judulDokumen: 'Berita Acara Real Cert',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
      },
      user: {
        penggunaId: userId,
        nama: 'PJ Evaluator',
        nip: '198001011234567890',
        jabatan: 'PJ Evaluator',
      },
    });
    const pdfBase64 = (await createSamplePdf()).toString('base64');
    const actual = await service.signPdf(
      { sub: userId, email: 'pj@example.test', peran: PeranPengguna.PJ_EVALUATOR },
      {
        dokumenTteId,
        userId,
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        pdfBase64,
      },
    );
    expect(actual.signed).toBe(true);
    expect(repository.updateRiwayatPdfSignatureMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        dokumenTteId,
        metadata: expect.objectContaining({
          signatureAlgorithm: 'SHA256withRSA',
          signatureFormat: 'PKCS7_DETACHED',
          certFingerprint: actual.certificate?.fingerprint,
          certSerialNumber: actual.certificate?.serialNumber,
        }),
      }),
    );
    const verification = verifyPdfWithP12(
      Buffer.from(actual.signedPdfBase64, 'base64'),
      Buffer.from(p12Base64, 'base64'),
      passphrase,
    );
    expect(verification.signatures[0]?.binding).toEqual({
      dokumenTteId,
      userId,
      jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
    });
  });
});

function createSamplePdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument() as {
      on(event: string, listener: (...args: unknown[]) => void): void;
      text(value: string): void;
      end(): void;
    };
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.text('Dokumen uji Berita Acara arsip');
    doc.end();
  });
}

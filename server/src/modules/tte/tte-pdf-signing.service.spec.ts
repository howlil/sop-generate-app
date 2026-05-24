import { execSync } from 'child_process';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  JenisDokumenTte,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../generated/prisma';
import { TtePdfSigningService } from './tte-pdf-signing.service';
import { TteRepository } from './tte.repository';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require(
  require.resolve('pdfkit', { paths: [require.resolve('@signpdf/placeholder-plain')] }),
);

describe('TtePdfSigningService.signBeritaAcaraArsip', () => {
  let service: TtePdfSigningService;
  let repository: {
    findPenggunaAktif: jest.Mock;
    findBeritaAcaraArsipForPdfSigning: jest.Mock;
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

  it('should_reject_when_pengajuan_status_not_ready_for_arsip', async () => {
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
          { peran: PeranPengguna.PJ_EVALUATOR },
          { peran: PeranPengguna.PJ_PENYUSUN },
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

  it('should_reject_when_riwayat_pj_incomplete', async () => {
    repository.findBeritaAcaraArsipForPdfSigning.mockResolvedValue({
      pengajuanEvaluasiId: 'pgj-1',
      status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
      opdId: 'opd-1',
      opd: { nama: 'Dinkes' },
      dokumenTte: {
        dokumenTteId: 'doc-1',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        pengajuanEvaluasiId: 'pgj-1',
        riwayatTandaTangan: [{ peran: PeranPengguna.PJ_EVALUATOR }],
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

  it('should_reject_when_opd_mismatch', async () => {
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
          { peran: PeranPengguna.PJ_EVALUATOR },
          { peran: PeranPengguna.PJ_PENYUSUN },
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

  it('should_sign_pdf_when_arsip_ready_and_pdf_signing_enabled', async () => {
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
          { peran: PeranPengguna.PJ_EVALUATOR },
          { peran: PeranPengguna.PJ_PENYUSUN },
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

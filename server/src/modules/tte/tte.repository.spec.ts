import { PeranPengguna, StatusPengajuanEvaluasi, StatusSOP } from '../../generated/prisma';
import { toWibDateOnly } from '../../common/date/wib-date.util';
import type { PrismaService } from '../../common/prisma/prisma.service';
import { TteRepository } from './tte.repository';

describe('TteRepository', () => {
  const signedAt = new Date('2026-05-19T14:30:00+07:00');
  const expectedTanggalEfektif = toWibDateOnly(signedAt);

  const validSignatureFields = {
    signatureValue: 'sig',
    signatureAlgorithm: 'SHA256withRSA',
    signatureFormat: 'CMS',
    certSerialNumber: 'serial',
    certIssuer: 'issuer',
    certSubject: 'subject',
    certFingerprint: 'fingerprint',
    certValidFrom: new Date('2026-01-01T00:00:00.000Z'),
    certValidTo: new Date('2027-01-01T00:00:00.000Z'),
    keyId: 'key-1',
  };

  function createRepository<T>(tx: T) {
    const prisma = {
      $transaction: jest.fn((callback: (transactionClient: T) => unknown) =>
        callback(tx),
      ),
    };
    return new TteRepository(prisma as unknown as PrismaService);
  }

  it('should_use_unique_nomor_dokumen_per_sop_when_batch_signing_multiple_sop', async () => {
    const tx = {
      pengajuanEvaluasi: {
        findUnique: jest.fn().mockResolvedValue({
          pengajuanEvaluasiId: 'pengajuan-1',
          opdId: 'opd-1',
          status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
          nilaiEvaluasi: [
            {
              detailSop: {
                detailSopId: 'detail-1',
                sopId: 'sop-1',
                nomorSOP: 'SOP-001',
                status: StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
                sop: { opdId: 'opd-1', judul: 'SOP A' },
              },
            },
            {
              detailSop: {
                detailSopId: 'detail-2',
                sopId: 'sop-2',
                nomorSOP: 'SOP-002',
                status: StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
                sop: { opdId: 'opd-1', judul: 'SOP B' },
              },
            },
          ],
        }),
        update: jest.fn().mockResolvedValue(undefined),
      },
      dokumenTte: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }: { data: { detailSopId: string } }) => ({
          dokumenTteId: `dok-${data.detailSopId}`,
          detailSopId: data.detailSopId,
          pengajuanEvaluasiId: null,
        })),
        update: jest.fn().mockResolvedValue(undefined),
      },
      riwayatTandaTangan: {
        create: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      detailSOP: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const repo = createRepository(tx);

    await repo.transaksiTandaTanganiSemuaSopPengajuan({
      pengajuanEvaluasiId: 'pengajuan-1',
      userId: 'kepala-1',
      userOpdId: 'opd-1',
      peran: PeranPengguna.KEPALA_OPD,
      signedAt,
      hashDokumen: 'hash',
      nomorDokumen: 'DOC-BATCH',
      judulDokumen: 'Dokumen Batch',
      signatureFields: validSignatureFields,
    });

    expect(tx.detailSOP.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tanggalEfektif: expectedTanggalEfektif }),
      }),
    );
    expect(tx.dokumenTte.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ nomorDokumen: 'DOC-BATCH-SOP-001' }),
      }),
    );
    expect(tx.dokumenTte.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ nomorDokumen: 'DOC-BATCH-SOP-002' }),
      }),
    );
  });

  it('should_suffix_nomor_dokumen_when_batch_signing_single_sop', async () => {
    const tx = {
      pengajuanEvaluasi: {
        findUnique: jest.fn().mockResolvedValue({
          pengajuanEvaluasiId: 'pengajuan-1',
          opdId: 'opd-1',
          status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
          nilaiEvaluasi: [
            {
              detailSop: {
                detailSopId: 'detail-1',
                sopId: 'sop-1',
                nomorSOP: 'SOP-DINKES-006-V1',
                status: StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
                sop: { opdId: 'opd-1', judul: 'Manajemen Farmasi Puskesmas' },
              },
            },
          ],
        }),
        update: jest.fn().mockResolvedValue(undefined),
      },
      dokumenTte: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }: { data: { detailSopId: string } }) => ({
          dokumenTteId: `dok-${data.detailSopId}`,
          detailSopId: data.detailSopId,
          pengajuanEvaluasiId: null,
        })),
        update: jest.fn().mockResolvedValue(undefined),
      },
      riwayatTandaTangan: {
        create: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      detailSOP: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const repo = createRepository(tx);

    await repo.transaksiTandaTanganiSemuaSopPengajuan({
      pengajuanEvaluasiId: 'pengajuan-1',
      userId: 'kepala-1',
      userOpdId: 'opd-1',
      peran: PeranPengguna.KEPALA_OPD,
      signedAt,
      hashDokumen: 'hash',
      nomorDokumen: 'BA-DINKES-2026-002',
      judulDokumen: 'Dokumen Batch',
      signatureFields: validSignatureFields,
    });

    expect(tx.detailSOP.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tanggalEfektif: expectedTanggalEfektif }),
      }),
    );
    expect(tx.dokumenTte.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          nomorDokumen: 'BA-DINKES-2026-002-SOP-DINKES-006-V1',
        }),
      }),
    );
  });
});

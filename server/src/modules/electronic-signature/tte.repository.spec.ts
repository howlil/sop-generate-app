import { PeranPengguna, StatusPengajuanEvaluasi, StatusSOP } from '../../generated/prisma';
import type { PrismaService } from '../../common/prisma/prisma.service';
import { TteRepository } from './tte.repository';

describe('TteRepository', () => {
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

  function createTx(overrides?: {
    pengajuanStatuses?: StatusSOP[];
  }) {
    return {
      detailSOP: {
        findUnique: jest.fn().mockResolvedValue({
          detailSopId: 'detail-1',
          sopId: 'sop-1',
          status: StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
          sop: { opdId: 'opd-1' },
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue(undefined),
      },
      dokumenTte: {
        findUnique: jest.fn().mockResolvedValue({
          dokumenTteId: 'dok-1',
          detailSopId: 'detail-1',
          pengajuanEvaluasiId: null,
        }),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
      },
      riwayatTandaTangan: {
        create: jest.fn().mockResolvedValue(undefined),
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ riwayatTandaTanganId: 'rt-1' }),
      },
      pengajuanEvaluasi: {
        findFirst: jest.fn().mockResolvedValue({
          pengajuanEvaluasiId: 'pengajuan-1',
          nilaiEvaluasi: (overrides?.pengajuanStatuses ?? [StatusSOP.BERLAKU]).map((status) => ({
            detailSop: { status },
          })),
        }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
  }

  function createRepository(tx: ReturnType<typeof createTx>) {
    const prisma = {
      $transaction: jest.fn((callback: (transactionClient: typeof tx) => unknown) =>
        callback(tx),
      ),
    };
    return new TteRepository(prisma as unknown as PrismaService);
  }

  it('should_mark_pengajuan_selesai_when_single_sop_tte_makes_all_details_berlaku', async () => {
    const tx = createTx({
      pengajuanStatuses: [StatusSOP.BERLAKU, StatusSOP.BERLAKU],
    });
    const repo = createRepository(tx);

    await repo.transaksiTandaTanganiSop({
      detailSopId: 'detail-1',
      userId: 'kepala-1',
      userOpdId: 'opd-1',
      peran: PeranPengguna.KEPALA_OPD,
      hashDokumen: 'hash',
      nomorDokumen: 'SOP-1',
      judulDokumen: 'SOP 1',
      signatureFields: validSignatureFields,
    });

    expect(tx.pengajuanEvaluasi.update).toHaveBeenCalledWith({
      where: { pengajuanEvaluasiId: 'pengajuan-1' },
      data: {
        status: StatusPengajuanEvaluasi.SELESAI,
        version: { increment: 1 },
      },
    });
  });

  it('should_gantikan_versi_berlaku_lain_before_marking_detail_berlaku', async () => {
    const tx = createTx();
    const repo = createRepository(tx);

    await repo.transaksiTandaTanganiSop({
      detailSopId: 'detail-1',
      userId: 'kepala-1',
      userOpdId: 'opd-1',
      peran: PeranPengguna.KEPALA_OPD,
      hashDokumen: 'hash',
      nomorDokumen: 'SOP-1',
      judulDokumen: 'SOP 1',
      signatureFields: validSignatureFields,
    });

    expect(tx.detailSOP.updateMany).toHaveBeenCalledWith({
      where: {
        sopId: 'sop-1',
        detailSopId: { not: 'detail-1' },
        status: StatusSOP.BERLAKU,
      },
      data: { status: StatusSOP.DIGANTIKAN },
    });
    expect(tx.detailSOP.update).toHaveBeenCalledWith({
      where: { detailSopId: 'detail-1' },
      data: {
        status: StatusSOP.BERLAKU,
        terakhirDieditOlehId: 'kepala-1',
      },
    });
  });

  it('should_not_mark_pengajuan_selesai_when_other_details_are_not_berlaku', async () => {
    const tx = createTx({
      pengajuanStatuses: [
        StatusSOP.BERLAKU,
        StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
      ],
    });
    const repo = createRepository(tx);

    await repo.transaksiTandaTanganiSop({
      detailSopId: 'detail-1',
      userId: 'kepala-1',
      userOpdId: 'opd-1',
      peran: PeranPengguna.KEPALA_OPD,
      hashDokumen: 'hash',
      nomorDokumen: 'SOP-1',
      judulDokumen: 'SOP 1',
      signatureFields: validSignatureFields,
    });

    expect(tx.pengajuanEvaluasi.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
        }),
      }),
    );
    expect(tx.pengajuanEvaluasi.update).not.toHaveBeenCalled();
  });

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
    const repo = createRepository(tx as unknown as ReturnType<typeof createTx>);

    await repo.transaksiTandaTanganiSemuaSopPengajuan({
      pengajuanEvaluasiId: 'pengajuan-1',
      userId: 'kepala-1',
      userOpdId: 'opd-1',
      peran: PeranPengguna.KEPALA_OPD,
      hashDokumen: 'hash',
      nomorDokumen: 'DOC-BATCH',
      judulDokumen: 'Dokumen Batch',
      signatureFields: validSignatureFields,
    });

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
});

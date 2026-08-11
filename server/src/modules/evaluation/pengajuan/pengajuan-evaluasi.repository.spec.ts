import { StatusPengajuanEvaluasi, StatusSOP } from '../../../generated/prisma';
import { PengajuanEvaluasiRepository } from './pengajuan-evaluasi.repository';

describe('Pengujian PengajuanEvaluasiRepository.buildWhere dari query', () => {
  const repo = new PengajuanEvaluasiRepository(null as never);

  it('seharusnya menggunakan status In ketika non kosong dan mengabaikan tunggal status', () => {
    const actual = repo.buildWhereFromQuery({
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      statusIn: [
        StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
        StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
      ],
    });
    expect(actual).toEqual({
      AND: [
        {
          status: {
            in: [
              StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
              StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
            ],
          },
        },
      ],
    });
  });

  it('seharusnya memakai status tunggal ketika daftar status kosong', () => {
    const actual = repo.buildWhereFromQuery({
      statusIn: [],
      status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
    });
    expect(actual).toEqual({
      AND: [{ status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR }],
    });
  });
});

describe('Pengujian read repository tanpa side effect', () => {
  const signedAt = new Date('2026-06-04T08:37:30.794Z');
  const staleSignedPengajuan = {
    pengajuanEvaluasiId: 'peng-1',
    status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
    opdId: 'opd-1',
    nilaiEvaluasi: [
      {
        detailSop: {
          detailSopId: 'detail-1',
          sopId: 'sop-1',
          status: StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
          tanggalEfektif: null,
          sop: { opdId: 'opd-1' },
          dokumenTte: [
            {
              dokumenTteId: 'doc-1',
              pdfPath: 'opd/sop/detail.pdf',
              pdfSha256: 'sha256',
              pdfStatus: 'PUBLISHED',
              riwayatTandaTangan: [
                {
                  userId: 'kepala-1',
                  ditandatanganiPada: signedAt,
                },
              ],
            },
          ],
        },
      },
    ],
  };

  it('findByIdFull seharusnya hanya membaca tanpa menjalankan transaksi repair', async () => {
    const prisma = {
      pengajuanEvaluasi: {
        findUnique: jest.fn().mockResolvedValue(staleSignedPengajuan),
      },
      $transaction: jest.fn(),
    };
    const repository = new PengajuanEvaluasiRepository(prisma as never);

    await repository.findByIdFull('peng-1');

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.pengajuanEvaluasi.findUnique).toHaveBeenCalledTimes(1);
  });

  it('findManyFiltered seharusnya hanya membaca tanpa menjalankan transaksi repair', async () => {
    const prisma = {
      pengajuanEvaluasi: {
        findMany: jest.fn().mockResolvedValue([staleSignedPengajuan]),
        findUnique: jest.fn().mockResolvedValue(staleSignedPengajuan),
      },
      $transaction: jest.fn(),
    };
    const repository = new PengajuanEvaluasiRepository(prisma as never);

    await repository.findManyFiltered({});

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.pengajuanEvaluasi.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.pengajuanEvaluasi.findUnique).not.toHaveBeenCalled();
  });
});

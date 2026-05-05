import { ForbiddenException } from '@nestjs/common';
import {
  JenisPengajuanEvaluasi,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../generated/prisma';
import type { PengajuanEvaluasiRepository } from './pengajuan-evaluasi.repository';
import { PengajuanEvaluasiService } from './pengajuan-evaluasi.service';

describe('PengajuanEvaluasiService', () => {
  const userPjPenyusun = {
    sub: 'u1',
    email: 'pj@test',
    peran: PeranPengguna.PJ_PENYUSUN,
  };

  it('should_forbid_findAll_when_bukan_evaluator_atau_pj_penyusun', async () => {
    const repo = {} as unknown as PengajuanEvaluasiRepository;
    const service = new PengajuanEvaluasiService(repo);
    await expect(
      service.findAll({ sub: 'x', email: 'e', peran: PeranPengguna.PENYUSUN }, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should_apply_opd_filter_for_pj_penyusun_on_findAll', async () => {
    const repo = {
      findOpdIdPengguna: jest.fn().mockResolvedValue('opd-a'),
      buildWhereFromQuery: jest.fn().mockReturnValue({ AND: [{ opdId: 'opd-a' }] }),
      findManyFiltered: jest.fn().mockResolvedValue([]),
    } as unknown as PengajuanEvaluasiRepository;
    const service = new PengajuanEvaluasiService(repo);
    const actual = await service.findAll(userPjPenyusun, {});
    expect(repo.findOpdIdPengguna).toHaveBeenCalledWith('u1');
    expect(repo.buildWhereFromQuery).toHaveBeenCalledWith(expect.any(Object), 'opd-a');
    expect(repo.findManyFiltered).toHaveBeenCalledWith({ AND: [{ opdId: 'opd-a' }] });
    expect(actual).toEqual([]);
  });

  it('should_forbid_create_when_bukan_pj_evaluator', async () => {
    const runTransaction = jest.fn();
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = new PengajuanEvaluasiService(repo);
    await expect(
      service.create(
        { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
        {
          opdId: '00000000-0000-4000-8000-000000000001',
          jenis: JenisPengajuanEvaluasi.TERJADWAL,
          sopDetailIds: ['00000000-0000-4000-8000-000000000002'],
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(runTransaction).not.toHaveBeenCalled();
  });

  it('should_noop_pastikan_mandiri_when_bukan_evaluator', async () => {
    const runTransaction = jest.fn();
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = new PengajuanEvaluasiService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.PJ_EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId: '00000000-0000-4000-8000-000000000002', statusDetail: StatusSOP.DIAJUKAN_EVALUASI }],
    );
    expect(runTransaction).not.toHaveBeenCalled();
  });

  it('should_noop_pastikan_mandiri_when_pipeline_tidak_eligible_batch', async () => {
    const runTransaction = jest.fn();
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = new PengajuanEvaluasiService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId: '00000000-0000-4000-8000-000000000002', statusDetail: StatusSOP.SIAP_DIVERIFIKASI }],
    );
    expect(runTransaction).not.toHaveBeenCalled();
  });

  it('should_exit_transaction_early_when_blocking_pengajuan_exists', async () => {
    const detailSopId = '00000000-0000-4000-8000-000000000002';
    const tx = {
      pengajuanEvaluasi: {
        findFirst: jest.fn().mockResolvedValue({ pengajuanEvaluasiId: 'existing' }),
        create: jest.fn(),
      },
      detailSOP: {
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    const runTransaction = jest.fn(async (cb: (t: typeof tx) => Promise<void>) => {
      await cb(tx);
    });
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = new PengajuanEvaluasiService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId, statusDetail: StatusSOP.DIAJUKAN_EVALUASI }],
    );
    expect(tx.pengajuanEvaluasi.create).not.toHaveBeenCalled();
    expect(tx.detailSOP.updateMany).not.toHaveBeenCalled();
  });

  it('should_create_mandiri_dalam_transaksi_when_tidak_blocking', async () => {
    const detailSopId = '00000000-0000-4000-8000-000000000002';
    const tx = {
      pengajuanEvaluasi: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ pengajuanEvaluasiId: 'p1' }),
      },
      detailSOP: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ detailSopId, status: StatusSOP.DIAJUKAN_EVALUASI }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const runTransaction = jest.fn(async (cb: (t: typeof tx) => Promise<void>) => {
      await cb(tx);
    });
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = new PengajuanEvaluasiService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId, statusDetail: StatusSOP.DIAJUKAN_EVALUASI }],
    );
    expect(tx.pengajuanEvaluasi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jenis: JenisPengajuanEvaluasi.MANDIRI,
          status: StatusPengajuanEvaluasi.MENUNGGU_EVALUASI,
          nilaiEvaluasi: {
            create: [{ detailSopId }],
          },
        }),
      }),
    );
    expect(tx.detailSOP.updateMany).toHaveBeenCalled();
  });
});

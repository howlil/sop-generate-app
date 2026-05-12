import { ForbiddenException } from '@nestjs/common';
import {
  JenisPengajuanEvaluasi,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../generated/prisma';
import { STATUS_PENGAJUAN_AKTIF_LINTAS_JOBDESK } from './pengajuan-evaluasi-status.constants';
import type { PengajuanEvaluasiDetailRow } from './pengajuan-evaluasi.repository';
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

  it.each([JenisPengajuanEvaluasi.TERJADWAL, JenisPengajuanEvaluasi.MANDIRI])(
    'should_persist_jenis_%s_on_create',
    async (jenis) => {
    const opdId = '00000000-0000-4000-8000-000000000001';
    const detailSopId = '00000000-0000-4000-8000-000000000002';
    const pengajuanId = '00000000-0000-4000-8000-000000000099';
    const tx = {
      pengajuanEvaluasi: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ pengajuanEvaluasiId: pengajuanId }),
      },
      detailSOP: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ detailSopId, status: StatusSOP.DIAJUKAN_EVALUASI }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const runTransaction = jest.fn(async (cb: (t: typeof tx) => Promise<string>) => cb(tx));
    const now = new Date('2026-06-01T12:00:00.000Z');
    const mockRow = {
      pengajuanEvaluasiId: pengajuanId,
      opdId,
      jenis,
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      nomorBA: null,
      tanggalPermintaan: now,
      tanggalEvaluasi: now,
      nilaiOPD: null,
      diverifikasiOlehUserId: null,
      diselesaikanOlehId: null,
      ditandatanganiOlehPjPenyusunUserId: null,
      tanggalTTDBaPjPenyusun: null,
      tanggalDiselesaikan: null,
      version: 0,
      createdAt: now,
      updatedAt: now,
      opd: { opdId, nama: 'OPD Uji' },
      nilaiEvaluasi: [
        {
          pengajuanEvaluasiId: pengajuanId,
          detailSopId,
          hasil: null,
          catatan: null,
          version: 0,
          dinilaiOlehId: null,
          dinilaiOleh: null,
          detailSop: {
            detailSopId,
            nomorSOP: 'SOP-001',
            status: StatusSOP.SEDANG_DIEVALUASI,
            sop: { sopId: '00000000-0000-4000-8000-000000000077', judul: 'Judul SOP' },
          },
          createdAt: now,
          updatedAt: now,
        },
      ],
      logNilaiEvaluasi: [],
      dokumenTte: [],
      diselesaikanOleh: null,
      diverifikasiOlehUser: null,
      ditandatanganiOlehPjPenyusunUser: null,
    } as unknown as PengajuanEvaluasiDetailRow;
    const findByIdFull = jest.fn().mockResolvedValue(mockRow);
    const repo = { runTransaction, findByIdFull } as unknown as PengajuanEvaluasiRepository;
    const service = new PengajuanEvaluasiService(repo);
    const userPj = { sub: 'pj-1', email: 'pj@test', peran: PeranPengguna.PJ_EVALUATOR };
    const actual = await service.create(userPj, {
      opdId,
      jenis,
      sopDetailIds: [detailSopId],
    });
    expect(tx.pengajuanEvaluasi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          opdId,
          jenis,
          status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        }),
      }),
    );
    expect(findByIdFull).toHaveBeenCalledWith(pengajuanId);
    expect(actual).toMatchObject({ id: pengajuanId, jenis: String(jenis), opdId });
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

  it('should_check_blocking_pengajuan_with_all_active_jobdesk_statuses', async () => {
    const tx = {
      pengajuanEvaluasi: {
        findFirst: jest.fn().mockResolvedValue({ pengajuanEvaluasiId: 'existing' }),
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
      [{ detailSopId: '00000000-0000-4000-8000-000000000002', statusDetail: StatusSOP.DIAJUKAN_EVALUASI }],
    );
    expect(tx.pengajuanEvaluasi.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: [...STATUS_PENGAJUAN_AKTIF_LINTAS_JOBDESK] },
        }),
      }),
    );
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
          status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
          tanggalEvaluasi: expect.any(Date),
          nilaiEvaluasi: {
            create: [{ detailSopId }],
          },
        }),
      }),
    );
    expect(tx.detailSOP.updateMany).toHaveBeenCalled();
  });
});

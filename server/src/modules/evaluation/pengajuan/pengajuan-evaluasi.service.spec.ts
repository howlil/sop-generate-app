import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import {
  JenisPengajuanEvaluasi,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';
import { STATUS_PENGAJUAN_AKTIF_LINTAS_JOBDESK } from './pengajuan-evaluasi-status.constants';
import type { PengajuanEvaluasiDetailRow } from './pengajuan-evaluasi.repository';
import type { PengajuanEvaluasiRepository } from './pengajuan-evaluasi.repository';
import { UserOpdAccessService } from '../../core/opd/user-opd-access.service';
import { PengajuanEvaluasiService } from '../pengajuan/pengajuan-evaluasi.service';

function buildService(
  repo: PengajuanEvaluasiRepository,
  userOpdAccessOverrides?: Partial<{
    getRequiredUserOpdId: jest.Mock;
    assertSameOpd: jest.Mock;
  }>,
): PengajuanEvaluasiService {
  const userOpdAccess = {
    getRequiredUserOpdId: jest.fn().mockResolvedValue('opd-a'),
    assertSameOpd: jest.fn().mockResolvedValue(undefined),
    ...userOpdAccessOverrides,
  } as unknown as UserOpdAccessService;
  return new PengajuanEvaluasiService(repo, userOpdAccess);
}

describe('PengajuanEvaluasiService', () => {
  const userPjPenyusun = {
    sub: 'u1',
    email: 'pj@test',
    peran: PeranPengguna.PJ_PENYUSUN,
  };

  it('should_return_paginated_ringkas_with_total_items', async () => {
    const ringkasRow = {
      pengajuanEvaluasiId: 'p1',
      opdId: 'opd-a',
      opdNama: 'OPD A',
      jenis: 'TERJADWAL',
      status: 'SELESAI_DIEVALUASI',
      createdAt: '2026-01-01T00:00:00.000Z',
      jumlahSop: 2,
      jumlahSudahDinilai: 2,
    };
    const repo = {
      findOpdIdPengguna: jest.fn(),
      buildWhereRingkasFromQuery: jest.fn().mockReturnValue({}),
      countWhere: jest.fn().mockResolvedValue(25),
      findRingkasPage: jest.fn().mockResolvedValue([ringkasRow]),
    } as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo);
    const actual = await service.findAllRingkas(
      { sub: 'pj', email: 'pj@test', peran: PeranPengguna.PJ_EVALUATOR },
      { page: 2, limit: 10 },
    );
    expect(repo.countWhere).toHaveBeenCalled();
    expect(repo.findRingkasPage).toHaveBeenCalledWith({}, 10, 10);
    expect(actual.items).toHaveLength(1);
    expect(actual.pagination).toEqual({
      page: 2,
      limit: 10,
      totalItems: 25,
      totalPages: 3,
    });
  });

  it('should_forbid_findAll_when_bukan_evaluator_atau_pj_penyusun', async () => {
    const repo = {} as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo);
    await expect(
      service.findAll({ sub: 'x', email: 'e', peran: PeranPengguna.PENYUSUN }, {}),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should_apply_opd_filter_for_pj_penyusun_on_findAll', async () => {
    const getRequiredUserOpdId = jest.fn().mockResolvedValue('opd-a');
    const repo = {
      buildWhereFromQuery: jest.fn().mockReturnValue({ AND: [{ opdId: 'opd-a' }] }),
      findManyFiltered: jest.fn().mockResolvedValue([]),
    } as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo, { getRequiredUserOpdId });
    const actual = await service.findAll(userPjPenyusun, {});
    expect(getRequiredUserOpdId).toHaveBeenCalledWith('u1', 'OPD pengguna tidak ditemukan');
    expect(repo.buildWhereFromQuery).toHaveBeenCalledWith(expect.any(Object), 'opd-a');
    expect(repo.findManyFiltered).toHaveBeenCalledWith({ AND: [{ opdId: 'opd-a' }] });
    expect(actual).toEqual([]);
  });

  it('should_forbid_create_when_bukan_pj_penyusun', async () => {
    const runTransaction = jest.fn();
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo);
    await expect(
      service.create(
        { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
        {
          jenis: JenisPengajuanEvaluasi.TERJADWAL,
          sopDetailIds: ['00000000-0000-4000-8000-000000000002'],
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(runTransaction).not.toHaveBeenCalled();
  });

  it('should_forbid_create_when_pj_penyusun_tidak_punya_opd', async () => {
    const getRequiredUserOpdId = jest.fn().mockRejectedValue(new ForbiddenException('OPD pengguna tidak ditemukan'));
    const runTransaction = jest.fn();
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo, { getRequiredUserOpdId });
    await expect(
      service.create(userPjPenyusun, {
        jenis: JenisPengajuanEvaluasi.TERJADWAL,
        sopDetailIds: ['00000000-0000-4000-8000-000000000002'],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(getRequiredUserOpdId).toHaveBeenCalledWith('u1', 'OPD pengguna tidak ditemukan');
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
          .mockResolvedValue({ detailSopId, status: StatusSOP.SIAP_DIEVALUASI }),
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
    const getRequiredUserOpdId = jest.fn().mockResolvedValue(opdId);
    const repo = { runTransaction, findByIdFull } as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo, { getRequiredUserOpdId });
    const userPj = { sub: 'pj-1', email: 'pj@test', peran: PeranPengguna.PJ_PENYUSUN };
    const actual = await service.create(userPj, {
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

  it('should_reject_create_when_detail_status_is_not_siap_dievaluasi', async () => {
    const opdId = '00000000-0000-4000-8000-000000000001';
    const detailSopId = '00000000-0000-4000-8000-000000000002';
    const tx = {
      pengajuanEvaluasi: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      detailSOP: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ detailSopId, status: StatusSOP.SEDANG_DIEVALUASI }),
        updateMany: jest.fn(),
      },
    };
    const runTransaction = jest.fn(async (cb: (t: typeof tx) => Promise<string>) => cb(tx));
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const getRequiredUserOpdId = jest.fn().mockResolvedValue(opdId);
    const service = buildService(repo, { getRequiredUserOpdId });

    await expect(
      service.create(userPjPenyusun, {
        jenis: JenisPengajuanEvaluasi.TERJADWAL,
        sopDetailIds: [detailSopId],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.pengajuanEvaluasi.create).not.toHaveBeenCalled();
    expect(tx.detailSOP.updateMany).not.toHaveBeenCalled();
  });

  it('should_conflict_create_when_status_changes_before_promote', async () => {
    const opdId = '00000000-0000-4000-8000-000000000001';
    const detailSopId = '00000000-0000-4000-8000-000000000002';
    const tx = {
      pengajuanEvaluasi: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ pengajuanEvaluasiId: 'p1' }),
      },
      detailSOP: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ detailSopId, status: StatusSOP.SIAP_DIEVALUASI }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const runTransaction = jest.fn(async (cb: (t: typeof tx) => Promise<string>) => cb(tx));
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const getRequiredUserOpdId = jest.fn().mockResolvedValue(opdId);
    const service = buildService(repo, { getRequiredUserOpdId });

    await expect(
      service.create(userPjPenyusun, {
        jenis: JenisPengajuanEvaluasi.TERJADWAL,
        sopDetailIds: [detailSopId],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should_noop_pastikan_mandiri_when_bukan_evaluator', async () => {
    const runTransaction = jest.fn();
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.PJ_EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId: '00000000-0000-4000-8000-000000000002', statusDetail: StatusSOP.SIAP_DIEVALUASI }],
    );
    expect(runTransaction).not.toHaveBeenCalled();
  });

  it('should_noop_pastikan_mandiri_when_pipeline_tidak_eligible_pengajuan', async () => {
    const runTransaction = jest.fn();
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId: '00000000-0000-4000-8000-000000000002', statusDetail: StatusSOP.SIAP_DIVERIFIKASI }],
    );
    expect(runTransaction).not.toHaveBeenCalled();
  });

  it('should_noop_pastikan_mandiri_when_status_sudah_diajukan_evaluasi', async () => {
    const runTransaction = jest.fn();
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId: '00000000-0000-4000-8000-000000000002', statusDetail: StatusSOP.DIAJUKAN_EVALUASI }],
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
    const service = buildService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId, statusDetail: StatusSOP.SIAP_DIEVALUASI }],
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
    const service = buildService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId: '00000000-0000-4000-8000-000000000002', statusDetail: StatusSOP.SIAP_DIEVALUASI }],
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
          .mockResolvedValue({ detailSopId, status: StatusSOP.SIAP_DIEVALUASI }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const runTransaction = jest.fn(async (cb: (t: typeof tx) => Promise<void>) => {
      await cb(tx);
    });
    const repo = { runTransaction } as unknown as PengajuanEvaluasiRepository;
    const service = buildService(repo);
    await service.pastikanPengajuanMandiriUntukEvaluator(
      { sub: 'x', email: 'e', peran: PeranPengguna.EVALUATOR },
      '00000000-0000-4000-8000-000000000001',
      [{ detailSopId, statusDetail: StatusSOP.SIAP_DIEVALUASI }],
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

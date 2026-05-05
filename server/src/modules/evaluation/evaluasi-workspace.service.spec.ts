import { NotFoundException } from '@nestjs/common';
import { StatusPengajuanEvaluasi, StatusSOP, PeranPengguna } from '../../generated/prisma';
import type { JwtAccessPayload } from '../../common/types/jwt-access-payload.type';
import { SopCatalogService } from '../sop/sop-catalog/sop-catalog.service';
import type { EvaluasiWorkspaceRepository } from './evaluasi-workspace.repository';
import { EvaluasiWorkspaceService } from './evaluasi-workspace.service';
import type { PengajuanEvaluasiService } from './pengajuan-evaluasi.service';

describe('EvaluasiWorkspaceService', () => {
  const userEvaluator: JwtAccessPayload = {
    sub: 'pengguna-test',
    email: 'e@test.id',
    peran: PeranPengguna.EVALUATOR,
  };

  const detailId = '11111111-1111-1111-1111-111111111111';
  const sopId = '22222222-2222-2222-2222-222222222222';

  function createRepoMock(partial: Partial<jest.Mocked<EvaluasiWorkspaceRepository>>): jest.Mocked<EvaluasiWorkspaceRepository> {
    return {
      findOpdRingkas: jest.fn(),
      findDaftarDetailPipeline: jest.fn(),
      findPengajuanAktif: jest.fn(),
      findRiwayatOpdSelesai: jest.fn(),
      findRiwayatNilaiUntukDetail: jest.fn(),
      detailMilikiOpd: jest.fn(),
      evaluatorTerakhirBatch: jest.fn(),
      ...partial,
    } as jest.Mocked<EvaluasiWorkspaceRepository>;
  }

  function createPastikanMock(): { pastikanPengajuanMandiriUntukEvaluator: jest.Mock } {
    return {
      pastikanPengajuanMandiriUntukEvaluator: jest.fn().mockResolvedValue(undefined),
    };
  }

  const mockWorkbench = {
    detail: { id: detailId } as never,
    langkah: [],
    logEdit: [],
  };

  it('should_throw_not_found_when_opd_missing', async () => {
    const repo = createRepoMock({
      findOpdRingkas: jest.fn().mockResolvedValue(null),
    });
    const sopCatalog = { getPenyusunWorkbench: jest.fn() } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    await expect(
      service.getWorkspaceOpd(userEvaluator, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', {}),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should_call_bootstrap_then_reload_pengajuan_when_evaluator_and_awalnya_null', async () => {
    const repo = createRepoMock({
      findOpdRingkas: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'OPD Test' }),
      findDaftarDetailPipeline: jest.fn().mockResolvedValue([
        {
          detailSopId: detailId,
          sopId,
          judul: 'SOP A',
          nomorSOP: '001',
          statusDetail: StatusSOP.DIAJUKAN_EVALUASI,
        },
      ]),
      findPengajuanAktif: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          pengajuanEvaluasiId: 'p-new',
          status: StatusPengajuanEvaluasi.MENUNGGU_EVALUASI,
          nilaiEvaluasi: [
            {
              detailSopId: detailId,
              hasil: null,
              catatan: null,
              version: 0,
            },
          ],
        }),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findRiwayatNilaiUntukDetail: jest.fn().mockResolvedValue([]),
      evaluatorTerakhirBatch: jest.fn().mockResolvedValue(new Map()),
    });
    const sopCatalog = { getPenyusunWorkbench: jest.fn() } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    const actual = await service.getWorkspaceOpd(userEvaluator, 'opd-1', {});
    expect(pastikan.pastikanPengajuanMandiriUntukEvaluator).toHaveBeenCalledWith(
      userEvaluator,
      'opd-1',
      expect.arrayContaining([expect.objectContaining({ detailSopId: detailId })]),
    );
    expect(repo.findPengajuanAktif).toHaveBeenCalledTimes(2);
    expect(actual.pengajuanAktif?.id).toBe('p-new');
    expect(actual.daftarSop).toHaveLength(1);
    expect(actual.daftarSop[0]?.tampilanAlur).toBe('sedang_dievaluasi');
    expect(sopCatalog.getPenyusunWorkbench).not.toHaveBeenCalled();
  });

  it('should_not_call_bootstrap_when_pj_evaluator', async () => {
    const userPj: JwtAccessPayload = {
      sub: 'pj-1',
      email: 'pj@test.id',
      peran: PeranPengguna.PJ_EVALUATOR,
    };
    const repo = createRepoMock({
      findOpdRingkas: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'OPD Test' }),
      findDaftarDetailPipeline: jest.fn().mockResolvedValue([
        {
          detailSopId: detailId,
          sopId,
          judul: 'SOP A',
          nomorSOP: '001',
          statusDetail: StatusSOP.DIAJUKAN_EVALUASI,
        },
      ]),
      findPengajuanAktif: jest.fn().mockResolvedValue(null),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findRiwayatNilaiUntukDetail: jest.fn().mockResolvedValue([]),
      evaluatorTerakhirBatch: jest.fn().mockResolvedValue(new Map()),
    });
    const sopCatalog = { getPenyusunWorkbench: jest.fn() } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    const actual = await service.getWorkspaceOpd(userPj, 'opd-1', {});
    expect(pastikan.pastikanPengajuanMandiriUntukEvaluator).not.toHaveBeenCalled();
    expect(repo.findPengajuanAktif).toHaveBeenCalledTimes(1);
    expect(actual.pengajuanAktif).toBeNull();
  });

  it('should_map_tampilan_alur_when_nilai_draft_and_selesai', async () => {
    const detailOther = '33333333-3333-3333-3333-333333333333';
    const repo = createRepoMock({
      findOpdRingkas: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'OPD Test' }),
      findDaftarDetailPipeline: jest.fn().mockResolvedValue([
        {
          detailSopId: detailId,
          sopId,
          judul: 'SOP A',
          nomorSOP: '001',
          statusDetail: StatusSOP.SEDANG_DIEVALUASI,
        },
        {
          detailSopId: detailOther,
          sopId: '44444444-4444-4444-4444-444444444444',
          judul: 'SOP B',
          nomorSOP: '002',
          statusDetail: StatusSOP.SEDANG_DIEVALUASI,
        },
      ]),
      findPengajuanAktif: jest.fn().mockResolvedValue({
        pengajuanEvaluasiId: 'peng-1',
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        nilaiEvaluasi: [
          {
            detailSopId: detailId,
            hasil: null,
            catatan: null,
            version: 0,
          },
          {
            detailSopId: detailOther,
            hasil: 'SESUAI',
            catatan: 'ok',
            version: 1,
          },
        ],
      }),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findRiwayatNilaiUntukDetail: jest.fn().mockResolvedValue([]),
      evaluatorTerakhirBatch: jest.fn().mockResolvedValue(new Map()),
    });
    const sopCatalog = { getPenyusunWorkbench: jest.fn() } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    const actual = await service.getWorkspaceOpd(userEvaluator, 'opd-1', {});
    expect(pastikan.pastikanPengajuanMandiriUntukEvaluator).not.toHaveBeenCalled();
    expect(actual.daftarSop).toHaveLength(2);
    expect(actual.daftarSop.find((r) => r.detailSopId === detailId)?.tampilanAlur).toBe(
      'sedang_dievaluasi',
    );
    expect(actual.daftarSop.find((r) => r.detailSopId === detailOther)?.tampilanAlur).toBe(
      'selesai_pengajuan_ini',
    );
    expect(actual.pengajuanAktif?.nilaiPerDetail).toHaveLength(2);
  });

  it('should_fill_preview_only_when_expand_preview_and_allowed_detail', async () => {
    const repo = createRepoMock({
      findOpdRingkas: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'OPD Test' }),
      findDaftarDetailPipeline: jest.fn().mockResolvedValue([
        {
          detailSopId: detailId,
          sopId,
          judul: 'SOP A',
          nomorSOP: '001',
          statusDetail: StatusSOP.DIAJUKAN_EVALUASI,
        },
      ]),
      findPengajuanAktif: jest.fn().mockResolvedValue(null),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findRiwayatNilaiUntukDetail: jest.fn().mockResolvedValue([]),
      detailMilikiOpd: jest.fn().mockResolvedValue(true),
      evaluatorTerakhirBatch: jest.fn().mockResolvedValue(new Map()),
    });
    const getWorkbench = jest.fn().mockResolvedValue(mockWorkbench);
    const sopCatalog = { getPenyusunWorkbench: getWorkbench } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    const withoutExpand = await service.getWorkspaceOpd(userEvaluator, 'opd-1', {
      detailSopId: detailId,
    });
    expect(withoutExpand.preview).toBeNull();
    expect(getWorkbench).not.toHaveBeenCalled();
    const withExpand = await service.getWorkspaceOpd(userEvaluator, 'opd-1', {
      detailSopId: detailId,
      expand: 'preview',
    });
    expect(withExpand.preview?.detailSopId).toBe(detailId);
    expect(getWorkbench).toHaveBeenCalledTimes(1);
    expect(getWorkbench).toHaveBeenCalledWith(userEvaluator, detailId, 50);
  });

  it('should_skip_preview_when_detail_not_in_pipeline', async () => {
    const repo = createRepoMock({
      findOpdRingkas: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'OPD Test' }),
      findDaftarDetailPipeline: jest.fn().mockResolvedValue([]),
      findPengajuanAktif: jest.fn().mockResolvedValue(null),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findRiwayatNilaiUntukDetail: jest.fn().mockResolvedValue([]),
      detailMilikiOpd: jest.fn().mockResolvedValue(true),
      evaluatorTerakhirBatch: jest.fn().mockResolvedValue(new Map()),
    });
    const getWorkbench = jest.fn().mockResolvedValue(mockWorkbench);
    const sopCatalog = { getPenyusunWorkbench: getWorkbench } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    const actual = await service.getWorkspaceOpd(userEvaluator, 'opd-1', {
      detailSopId: detailId,
      expand: 'preview',
    });
    expect(actual.preview).toBeNull();
    expect(getWorkbench).not.toHaveBeenCalled();
    expect(pastikan.pastikanPengajuanMandiriUntukEvaluator).not.toHaveBeenCalled();
  });
});

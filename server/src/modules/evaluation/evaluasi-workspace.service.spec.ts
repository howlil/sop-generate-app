import { NotFoundException } from '@nestjs/common';
import {
  JenisPengajuanEvaluasi,
  StatusPengajuanEvaluasi,
  StatusSOP,
  PeranPengguna,
} from '../../generated/prisma';
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
  const detailMeta = {
    versi: 1,
    detailUpdatedAt: new Date('2026-05-01T08:00:00.000Z'),
  };

  function pipelineRow(
    overrides: Partial<{
      detailSopId: string;
      sopId: string;
      judul: string;
      nomorSOP: string;
      statusDetail: StatusSOP;
    }> = {},
  ) {
    return {
      detailSopId: detailId,
      sopId,
      judul: 'SOP A',
      nomorSOP: '001',
      statusDetail: StatusSOP.DIAJUKAN_EVALUASI,
      ...detailMeta,
      ...overrides,
    };
  }

  function nilaiEvaluasiRow(
    overrides: Partial<{
      detailSopId: string;
      hasil: string | null;
      catatan: string | null;
      version: number;
      statusTindakLanjut: string | null;
      ditindaklanjutiPada: Date | null;
    }> = {},
  ) {
    return {
      detailSopId: detailId,
      hasil: null,
      catatan: null,
      version: 0,
      statusTindakLanjut: null,
      ditindaklanjutiPada: null,
      ...detailMeta,
      ...overrides,
    };
  }

  function createRepoMock(partial: Partial<jest.Mocked<EvaluasiWorkspaceRepository>>): jest.Mocked<EvaluasiWorkspaceRepository> {
    return {
      findOpdRingkas: jest.fn(),
      findDaftarDetailPipeline: jest.fn(),
      findPengajuanAktif: jest.fn(),
      findRiwayatOpdSelesai: jest.fn(),
      findLogNilaiUntukDetailWorkspace: jest.fn(),
      detailMilikiOpd: jest.fn(),
      evaluatorTerakhirUntukDetailSop: jest.fn(),
      findPengajuanBundleForWorkspace: jest.fn(),
      ...partial,
    } as jest.Mocked<EvaluasiWorkspaceRepository>;
  }

  function createPastikanMock(): {
    pastikanPengajuanMandiriUntukEvaluator: jest.Mock;
    assertUserCanAccessPengajuan: jest.Mock;
  } {
    return {
      pastikanPengajuanMandiriUntukEvaluator: jest.fn().mockResolvedValue(undefined),
      assertUserCanAccessPengajuan: jest.fn().mockResolvedValue(undefined),
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
      findDaftarDetailPipeline: jest.fn().mockResolvedValue([pipelineRow()]),
      findPengajuanAktif: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          pengajuanEvaluasiId: 'p-new',
          status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
          jenis: JenisPengajuanEvaluasi.MANDIRI,
          nilaiEvaluasi: [nilaiEvaluasiRow()],
        }),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findLogNilaiUntukDetailWorkspace: jest.fn().mockResolvedValue([]),
      evaluatorTerakhirUntukDetailSop: jest.fn().mockResolvedValue(new Map()),
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
    expect(actual.pengajuanAktif?.jenis).toBe('MANDIRI');
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
      findDaftarDetailPipeline: jest.fn().mockResolvedValue([pipelineRow()]),
      findPengajuanAktif: jest.fn().mockResolvedValue(null),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findLogNilaiUntukDetailWorkspace: jest.fn().mockResolvedValue([]),
      evaluatorTerakhirUntukDetailSop: jest.fn().mockResolvedValue(new Map()),
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
        pipelineRow({ statusDetail: StatusSOP.SEDANG_DIEVALUASI }),
        pipelineRow({
          detailSopId: detailOther,
          sopId: '44444444-4444-4444-4444-444444444444',
          judul: 'SOP B',
          nomorSOP: '002',
          statusDetail: StatusSOP.SEDANG_DIEVALUASI,
        }),
      ]),
      findPengajuanAktif: jest.fn().mockResolvedValue({
        pengajuanEvaluasiId: 'peng-1',
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        jenis: JenisPengajuanEvaluasi.TERJADWAL,
        nilaiEvaluasi: [
          nilaiEvaluasiRow(),
          nilaiEvaluasiRow({
            detailSopId: detailOther,
            hasil: 'SESUAI',
            catatan: 'ok',
            version: 1,
          }),
        ],
      }),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findLogNilaiUntukDetailWorkspace: jest.fn().mockResolvedValue([]),
      evaluatorTerakhirUntukDetailSop: jest.fn().mockResolvedValue(new Map()),
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
      findDaftarDetailPipeline: jest.fn().mockResolvedValue([pipelineRow()]),
      findPengajuanAktif: jest.fn().mockResolvedValue(null),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findLogNilaiUntukDetailWorkspace: jest.fn().mockResolvedValue([]),
      detailMilikiOpd: jest.fn().mockResolvedValue(true),
      evaluatorTerakhirUntukDetailSop: jest.fn().mockResolvedValue(new Map()),
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
      findLogNilaiUntukDetailWorkspace: jest.fn().mockResolvedValue([]),
      detailMilikiOpd: jest.fn().mockResolvedValue(true),
      evaluatorTerakhirUntukDetailSop: jest.fn().mockResolvedValue(new Map()),
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

  it('should_throw_not_found_when_pengajuan_bundle_missing', async () => {
    const repo = createRepoMock({
      findPengajuanBundleForWorkspace: jest.fn().mockResolvedValue(null),
    });
    const sopCatalog = { getPenyusunWorkbench: jest.fn() } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    await expect(service.getWorkspacePengajuan(userEvaluator, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(pastikan.assertUserCanAccessPengajuan).not.toHaveBeenCalled();
  });

  it('should_map_workspace_pengajuan_from_bundle_nilai_only', async () => {
    const repo = createRepoMock({
      findPengajuanBundleForWorkspace: jest.fn().mockResolvedValue({
        pengajuanEvaluasiId: 'peng-1',
        opdId: 'opd-1',
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        jenis: JenisPengajuanEvaluasi.TERJADWAL,
        nilaiEvaluasi: [nilaiEvaluasiRow()],
        daftarRows: [
          pipelineRow({ statusDetail: StatusSOP.SEDANG_DIEVALUASI }),
        ],
      }),
      findOpdRingkas: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'OPD Test' }),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findLogNilaiUntukDetailWorkspace: jest.fn().mockResolvedValue([]),
      evaluatorTerakhirUntukDetailSop: jest.fn().mockResolvedValue(new Map()),
    });
    const sopCatalog = { getPenyusunWorkbench: jest.fn() } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    const actual = await service.getWorkspacePengajuan(userEvaluator, 'peng-1', {});
    expect(pastikan.assertUserCanAccessPengajuan).toHaveBeenCalledWith(userEvaluator, 'opd-1');
    expect(actual.daftarSop).toHaveLength(1);
    expect(actual.daftarSop[0]?.detailSopId).toBe(detailId);
    expect(actual.pengajuanAktif?.id).toBe('peng-1');
    expect(actual.pengajuanAktif?.jenis).toBe('TERJADWAL');
    expect(actual.pengajuanAktif?.nilaiPerDetail).toHaveLength(1);
    expect(actual.opd.id).toBe('opd-1');
  });

  it('should_return_log_nilai_sop_terpilih_for_active_pengajuan_when_detail_sop_set', async () => {
    const createdAt = new Date('2026-05-19T10:00:00.000Z');
    const findLogNilai = jest.fn().mockResolvedValue([
      {
        pengajuanEvaluasiId: 'peng-1',
        detailSopId: detailId,
        penggunaId: 'eval-1',
        evaluatorNama: 'Budi Evaluator',
        hasilSebelum: null,
        hasilSesudah: 'SESUAI',
        catatanSebelum: null,
        catatanSesudah: 'Sesuai standar',
        createdAt,
      },
    ]);
    const repo = createRepoMock({
      findOpdRingkas: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'OPD Test' }),
      findDaftarDetailPipeline: jest.fn().mockResolvedValue([
        pipelineRow({ statusDetail: StatusSOP.SEDANG_DIEVALUASI }),
      ]),
      findPengajuanAktif: jest.fn().mockResolvedValue({
        pengajuanEvaluasiId: 'peng-1',
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        jenis: JenisPengajuanEvaluasi.TERJADWAL,
        nilaiEvaluasi: [
          nilaiEvaluasiRow({ hasil: 'SESUAI', version: 1 }),
        ],
      }),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findLogNilaiUntukDetailWorkspace: findLogNilai,
      evaluatorTerakhirUntukDetailSop: jest.fn().mockResolvedValue(new Map()),
    });
    const sopCatalog = { getPenyusunWorkbench: jest.fn() } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    const actual = await service.getWorkspaceOpd(userEvaluator, 'opd-1', {
      detailSopId: detailId,
    });
    expect(findLogNilai).toHaveBeenCalledWith('peng-1', detailId, 30);
    expect(actual.logNilaiSopTerpilih).toHaveLength(1);
    expect(actual.logNilaiSopTerpilih[0]?.evaluatorNama).toBe('Budi Evaluator');
    expect(actual.logNilaiSopTerpilih[0]?.hasilSesudah).toBe('SESUAI');
  });

  it('should_keep_pengajuan_status_visible_for_late_jobdesk_stage', async () => {
    const repo = createRepoMock({
      findPengajuanBundleForWorkspace: jest.fn().mockResolvedValue({
        pengajuanEvaluasiId: 'peng-2',
        opdId: 'opd-1',
        status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
        jenis: JenisPengajuanEvaluasi.TERJADWAL,
        nilaiEvaluasi: [
          nilaiEvaluasiRow({ hasil: 'SESUAI', version: 2 }),
        ],
        daftarRows: [
          pipelineRow({
            statusDetail: StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
          }),
        ],
      }),
      findOpdRingkas: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'OPD Test' }),
      findRiwayatOpdSelesai: jest.fn().mockResolvedValue([]),
      findLogNilaiUntukDetailWorkspace: jest.fn().mockResolvedValue([]),
      evaluatorTerakhirUntukDetailSop: jest.fn().mockResolvedValue(new Map()),
    });
    const sopCatalog = { getPenyusunWorkbench: jest.fn() } as unknown as SopCatalogService;
    const pastikan = createPastikanMock();
    const service = new EvaluasiWorkspaceService(
      repo,
      sopCatalog,
      pastikan as unknown as PengajuanEvaluasiService,
    );
    const actual = await service.getWorkspacePengajuan(userEvaluator, 'peng-2', {});
    expect(actual.pengajuanAktif?.status).toBe('DITANDATANGANI_PJ_PENYUSUN');
  });
});

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EvaluasiNilaiService } from '../../evaluation/evaluasi-nilai.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
  JenisLangkahProsedur,
  PeranPengguna,
  Prisma,
  SatuanWaktu,
  StatusSOP,
} from '../../../generated/prisma';
import type { JwtAccessPayload } from '../../../common';
import type { CreateSopDto } from './dto/create-sop.dto';
import type { ListSopQueryDto } from './dto/list-sop-query.dto';
import type { UpdateDetailSopStatusDto } from './dto/update-detail-sop-status.dto';
import type { UpdateSopHeaderDto } from './dto/update-sop-header.dto';
import { encodeLogEditSopClientId } from '../sop-collaboration/log-edit-session.helper';
import { SopCatalogRepository, type SopDaftarDbRow, type SopWorkbenchDbPayload } from './sop-catalog.repository';
import { SopCatalogService } from './sop-catalog.service';

describe('SopCatalogService', () => {
  let service: SopCatalogService;
  const repoMock: jest.Mocked<
    Pick<
      SopCatalogRepository,
      | 'findOpdIdByPenggunaId'
      | 'findDaftarByOpdId'
      | 'findDaftarAll'
      | 'findOpdNama'
      | 'createSopWithInitialDetail'
      | 'findWorkbenchPayloadByDetailOrSopId'
      | 'findDetailIdByDetailOrSopId'
      | 'findLatestDetailStatusContext'
      | 'updateDetailSopStatus'
      | 'transitionDetailSopRevisiToDiajukanEvaluasi'
      | 'updateSopHeaderTransaction'
      | 'cloneDetailSopFromBerlaku'
      | 'findRiwayatVersiBySopId'
      | 'deleteVersiDraft'
    >
  > = {
    findOpdIdByPenggunaId: jest.fn(),
    findDaftarByOpdId: jest.fn(),
    findDaftarAll: jest.fn(),
    findOpdNama: jest.fn(),
    createSopWithInitialDetail: jest.fn(),
    findWorkbenchPayloadByDetailOrSopId: jest.fn(),
    findDetailIdByDetailOrSopId: jest.fn(),
    findLatestDetailStatusContext: jest.fn(),
    updateDetailSopStatus: jest.fn(),
    transitionDetailSopRevisiToDiajukanEvaluasi: jest.fn(),
    updateSopHeaderTransaction: jest.fn(),
    cloneDetailSopFromBerlaku: jest.fn(),
    findRiwayatVersiBySopId: jest.fn(),
    deleteVersiDraft: jest.fn(),
  };
  const evaluasiNilaiServiceMock = {
    assertBolehKirimUlangSetelahRevisi: jest.fn().mockResolvedValue(undefined),
  };
  const user: JwtAccessPayload = {
    sub: 'pengguna-1',
    email: 'a@b.c',
    peran: PeranPengguna.PENYUSUN,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    evaluasiNilaiServiceMock.assertBolehKirimUlangSetelahRevisi.mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SopCatalogService,
        { provide: SopCatalogRepository, useValue: repoMock as unknown as SopCatalogRepository },
        { provide: EvaluasiNilaiService, useValue: evaluasiNilaiServiceMock },
      ],
    }).compile();
    service = module.get(SopCatalogService);
    repoMock.findOpdIdByPenggunaId.mockResolvedValue('opd-1');
  });

  it('should_throw_forbidden_when_user_has_no_opd', async () => {
    repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce(null);
    await expect(service.listForCurrentUser(user)).rejects.toBeInstanceOf(ForbiddenException);
    expect(repoMock.findDaftarByOpdId).not.toHaveBeenCalled();
  });

  it('should_map_latest_detail_and_terakhir_diedit', async () => {
    const t = new Date('2026-01-15T10:00:00.000Z');
    const row: SopDaftarDbRow = {
      sopId: 'sop-1',
      opdId: 'opd-1',
      judul: 'Judul A',
      detail: {
        detailSopId: 'det-1',
        nomorSOP: '001/2026',
        status: 'DRAFT',
        versi: 1,
        updatedAt: t,
        pembuatNama: 'Budi',
        editorNama: 'Ani',
        peraturanId: 'per-1',
      },
      versiBerlaku: null,
      allStatuses: [StatusSOP.DRAFT],
    };
    repoMock.findDaftarByOpdId.mockResolvedValue([row]);
    const actual = await service.listForCurrentUser(user);
    expect(repoMock.findDaftarByOpdId).toHaveBeenCalledWith('opd-1', {});
    expect(actual).toHaveLength(1);
    expect(actual[0]).toMatchObject({
      id: 'sop-1',
      opdId: 'opd-1',
      detailSopId: 'det-1',
      judul: 'Judul A',
      nomorSop: '001/2026',
      pembuat: 'Budi',
      terakhirDiedit: { nama: 'Ani', waktu: t.toISOString() },
      status: 'DRAFT',
      peraturanId: 'per-1',
      terakhirDiperbarui: t.toISOString(),
    });
  });

  it('should_map_row_without_detail', async () => {
    const row: SopDaftarDbRow = {
      sopId: 'sop-2',
      opdId: 'opd-1',
      judul: 'Tanpa detail',
      detail: undefined,
      versiBerlaku: null,
      allStatuses: [],
    };
    repoMock.findDaftarByOpdId.mockResolvedValue([row]);
    const actual = await service.listForCurrentUser(user);
    expect(repoMock.findDaftarByOpdId).toHaveBeenCalledWith('opd-1', {});
    expect(actual[0]).toMatchObject({
      id: 'sop-2',
      opdId: 'opd-1',
      detailSopId: null,
      judul: 'Tanpa detail',
      nomorSop: null,
      pembuat: null,
      terakhirDiedit: { nama: null, waktu: null },
      status: 'DRAFT',
      peraturanId: null,
      terakhirDiperbarui: null,
    });
  });

  it('should_use_findDaftarAll_for_evaluator', async () => {
    const evaluatorUser: JwtAccessPayload = {
      sub: 'ev-1',
      email: 'ev@b.c',
      peran: PeranPengguna.EVALUATOR,
    };
    repoMock.findDaftarAll.mockResolvedValue([]);
    await service.listForCurrentUser(evaluatorUser);
    expect(repoMock.findDaftarAll).toHaveBeenCalledWith({});
    expect(repoMock.findOpdIdByPenggunaId).not.toHaveBeenCalled();
  });

  it('should_pass_filters_to_repository_when_user_is_penyusun', async () => {
    const query = {
      status: 'DRAFT',
      tanggalDari: '2026-01-01',
      tanggalSampai: '2026-01-31',
    } as ListSopQueryDto;
    repoMock.findDaftarByOpdId.mockResolvedValue([]);
    await service.listForCurrentUser(user, query);
    expect(repoMock.findDaftarByOpdId).toHaveBeenCalledWith('opd-1', {
      status: 'DRAFT',
      tanggalDari: '2026-01-01',
      tanggalSampai: '2026-01-31',
    });
  });

  it('should_use_findDaftarAll_with_filters_when_user_is_evaluator', async () => {
    const evaluatorUser: JwtAccessPayload = {
      sub: 'ev-2',
      email: 'ev2@b.c',
      peran: PeranPengguna.EVALUATOR,
    };
    const query = { status: 'SIAP_DIEVALUASI', tanggalDari: '2026-02-01' } as ListSopQueryDto;
    repoMock.findDaftarAll.mockResolvedValue([]);
    await service.listForCurrentUser(evaluatorUser, query);
    expect(repoMock.findDaftarAll).toHaveBeenCalledWith({
      status: 'SIAP_DIEVALUASI',
      tanggalDari: '2026-02-01',
      tanggalSampai: undefined,
    });
  });

  it('should_throw_BadRequest_when_tanggalDari_after_tanggalSampai', async () => {
    const query = { tanggalDari: '2026-02-10', tanggalSampai: '2026-02-01' } as ListSopQueryDto;
    await expect(service.listForCurrentUser(user, query)).rejects.toBeInstanceOf(BadRequestException);
    expect(repoMock.findDaftarByOpdId).not.toHaveBeenCalled();
  });

  it('should_treat_status_all_as_no_status_filter', async () => {
    const query = { status: 'all', tanggalSampai: '2026-06-30' } as ListSopQueryDto;
    repoMock.findDaftarByOpdId.mockResolvedValue([]);
    await service.listForCurrentUser(user, query);
    expect(repoMock.findDaftarByOpdId).toHaveBeenCalledWith('opd-1', {
      status: undefined,
      tanggalDari: undefined,
      tanggalSampai: '2026-06-30',
    });
  });

  it('should_create_sop_with_empty_nama_lembaga_when_dto_omits_field', async () => {
    const t = new Date('2026-02-01T12:00:00.000Z');
    const dbRow: SopDaftarDbRow = {
      sopId: 'sop-new',
      opdId: 'opd-1',
      judul: 'Judul Baru',
      detail: {
        detailSopId: 'det-new',
        nomorSOP: 'N-1',
        status: 'DRAFT',
        versi: 1,
        updatedAt: t,
        pembuatNama: 'Budi',
        editorNama: null,
        peraturanId: null,
      },
      versiBerlaku: null,
      allStatuses: [StatusSOP.DRAFT],
    };
    repoMock.createSopWithInitialDetail.mockResolvedValue(dbRow);
    const dto: CreateSopDto = { judul: 'Judul Baru', nomorSop: 'N-1' };
    const actual = await service.createForPenyusun(user, dto);
    expect(repoMock.findOpdNama).not.toHaveBeenCalled();
    expect(repoMock.createSopWithInitialDetail).toHaveBeenCalledWith({
      judul: 'Judul Baru',
      nomorSOP: 'N-1',
      opdId: 'opd-1',
      penggunaId: 'pengguna-1',
      namaLembaga: '',
    });
    expect(actual).toMatchObject({
      id: 'sop-new',
      detailSopId: 'det-new',
      judul: 'Judul Baru',
      nomorSop: 'N-1',
      pembuat: 'Budi',
      status: 'DRAFT',
    });
  });

  it('should_persist_empty_nama_lembaga_when_dto_omits_field_even_if_opd_nama_unknown', async () => {
    const t = new Date('2026-02-01T12:00:00.000Z');
    const dbRow: SopDaftarDbRow = {
      sopId: 'sop-new',
      opdId: 'opd-1',
      judul: 'Hanya Judul',
      detail: {
        detailSopId: 'det-new',
        nomorSOP: 'N-2',
        status: 'DRAFT',
        versi: 1,
        updatedAt: t,
        pembuatNama: 'Budi',
        editorNama: null,
        peraturanId: null,
      },
      versiBerlaku: null,
      allStatuses: [StatusSOP.DRAFT],
    };
    repoMock.createSopWithInitialDetail.mockResolvedValue(dbRow);
    const dto: CreateSopDto = { judul: 'Hanya Judul', nomorSop: 'N-2' };
    await service.createForPenyusun(user, dto);
    expect(repoMock.findOpdNama).not.toHaveBeenCalled();
    expect(repoMock.createSopWithInitialDetail).toHaveBeenCalledWith(
      expect.objectContaining({ namaLembaga: '' }),
    );
  });

  it('should_persist_trimmed_nama_lembaga_when_dto_provides_value', async () => {
    const t = new Date('2026-02-01T12:00:00.000Z');
    const dbRow: SopDaftarDbRow = {
      sopId: 'sop-new',
      opdId: 'opd-1',
      judul: 'J',
      detail: {
        detailSopId: 'det-new',
        nomorSOP: 'N-3',
        status: 'DRAFT',
        versi: 1,
        updatedAt: t,
        pembuatNama: 'Budi',
        editorNama: null,
        peraturanId: null,
      },
      versiBerlaku: null,
      allStatuses: [StatusSOP.DRAFT],
    };
    repoMock.createSopWithInitialDetail.mockResolvedValue(dbRow);
    const dto: CreateSopDto = {
      judul: 'J',
      nomorSop: 'N-3',
      namaLembaga: '  PEMERINTAH\nKABUPATEN X  ',
    };
    await service.createForPenyusun(user, dto);
    expect(repoMock.createSopWithInitialDetail).toHaveBeenCalledWith(
      expect.objectContaining({ namaLembaga: 'PEMERINTAH\nKABUPATEN X' }),
    );
  });

  it('should_throw_forbidden_when_create_and_no_opd', async () => {
    repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce(null);
    const dto: CreateSopDto = { judul: 'X', nomorSop: 'Y' };
    await expect(service.createForPenyusun(user, dto)).rejects.toBeInstanceOf(ForbiddenException);
    expect(repoMock.createSopWithInitialDetail).not.toHaveBeenCalled();
  });

  it('should_map_p2002_to_conflict', async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: 'test',
    });
    repoMock.createSopWithInitialDetail.mockRejectedValue(p2002);
    const dto: CreateSopDto = { judul: 'Judul', nomorSop: 'dup' };
    await expect(service.createForPenyusun(user, dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('should_throw_not_found_when_workbench_detail_missing', async () => {
    repoMock.findWorkbenchPayloadByDetailOrSopId.mockResolvedValue(null);
    await expect(service.getPenyusunWorkbench(user, '00000000-0000-4000-8000-000000000001')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should_throw_forbidden_when_workbench_opd_mismatch', async () => {
    const t = new Date('2026-03-01T08:00:00.000Z');
    const payload = {
      detailSopId: 'det-wb',
      sopId: 'sop-wb',
      status: 'DRAFT',
      versi: 1,
      nomorSOP: 'WB/1',
      tanggalPembuatan: t,
      tanggalRevisi: null,
      tanggalEfektif: null,
      namaLembaga: 'Lembaga',
      dibuatOlehId: 'p1',
      terakhirDieditOlehId: null,
      createdAt: t,
      updatedAt: t,
      sop: {
        sopId: 'sop-wb',
        opdId: 'opd-lain',
        judul: 'Judul WB',
        createdAt: t,
        updatedAt: t,
        opd: {
          opdId: 'opd-lain',
          nama: 'OPD Lain',
          pengguna: [],
        },
      },
      dibuatOleh: { penggunaId: 'p1', nama: 'Budi' },
      terakhirDieditOleh: null,
      lampiranPeringatan: [],
      lampiranKualifikasiPelaksanaan: [],
      lampiranPeralatanPerlengkapan: [],
      lampiranPencatatanPendataan: [],
      dasarHukum: [],
      relasiSopKeluar: [],
      relasiSopMasuk: [],
      swimlanes: [],
      nilaiEvaluasi: [],
      langkahSOP: [],
      logEditSop: [],
    } as unknown as SopWorkbenchDbPayload;
    repoMock.findWorkbenchPayloadByDetailOrSopId.mockResolvedValue(payload);
    await expect(service.getPenyusunWorkbench(user, 'det-wb')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should_return_workbench_when_penyusun_opd_matches', async () => {
    const t = new Date('2026-03-02T09:00:00.000Z');
    const payload = {
      detailSopId: 'det-wb-2',
      sopId: 'sop-wb-2',
      status: 'DRAFT',
      versi: 1,
      nomorSOP: 'WB/2',
      tanggalPembuatan: t,
      tanggalRevisi: null,
      tanggalEfektif: null,
      namaLembaga: 'Lembaga 2',
      dibuatOlehId: 'p1',
      terakhirDieditOlehId: null,
      createdAt: t,
      updatedAt: t,
      sop: {
        sopId: 'sop-wb-2',
        opdId: 'opd-1',
        judul: 'Judul OK',
        createdAt: t,
        updatedAt: t,
        opd: {
          opdId: 'opd-1',
          nama: 'OPD Satu',
          pengguna: [{ nama: 'Dr. Kepala', nip: '198001012010011001' }],
        },
      },
      dibuatOleh: { penggunaId: 'p1', nama: 'Budi' },
      terakhirDieditOleh: null,
      lampiranPeringatan: [],
      lampiranKualifikasiPelaksanaan: [],
      lampiranPeralatanPerlengkapan: [],
      lampiranPencatatanPendataan: [],
      dasarHukum: [],
      relasiSopKeluar: [],
      relasiSopMasuk: [],
      swimlanes: [],
      nilaiEvaluasi: [],
      langkahSOP: [],
      logEditSop: [
        {
          detailSopId: 'det-wb-2',
          penggunaId: 'p1',
          createdAt: t,
          bagian: 'HEADER',
          targetEntityId: null,
          keterangan: 'Header SOP: Peringatan',
          sesiChangeCount: 1,
          closedAt: null,
          updatedAt: t,
          domainFields: [{ domainField: 'peringatan' }],
          pengguna: {
            penggunaId: 'p1',
            nama: 'Budi',
            email: 'budi@x',
            peran: PeranPengguna.PENYUSUN,
          },
        },
      ],
    } as unknown as SopWorkbenchDbPayload;
    repoMock.findWorkbenchPayloadByDetailOrSopId.mockResolvedValue(payload);
    const actual = await service.getPenyusunWorkbench(user, 'det-wb-2', 50);
    expect(repoMock.findWorkbenchPayloadByDetailOrSopId).toHaveBeenCalledWith('det-wb-2', 50);
    expect(actual.detail.id).toBe('det-wb-2');
    expect(actual.detail.sop?.judul).toBe('Judul OK');
    expect(actual.detail.kepalaOpd).toEqual({ nama: 'Dr. Kepala', nip: '198001012010011001' });
    expect(actual.langkah).toHaveLength(0);
    expect(actual.logEdit).toHaveLength(1);
    expect(actual.logEdit[0]?.id).toBe(encodeLogEditSopClientId('det-wb-2', 'p1', t));
    expect(actual.logEdit[0]?.aktorRole).toBe(PeranPengguna.PENYUSUN);
  });

  describe('updatePenyusunHeader', () => {
    const t = new Date('2026-04-01T08:00:00.000Z');
    const baseWorkbenchPayload = (override?: Partial<Record<string, unknown>>): SopWorkbenchDbPayload =>
      ({
        detailSopId: 'det-up',
        sopId: 'sop-up',
        status: 'DRAFT',
        versi: 1,
        nomorSOP: 'WB/UP',
        tanggalPembuatan: t,
        tanggalRevisi: null,
        tanggalEfektif: null,
        namaLembaga: 'Lembaga',
        dibuatOlehId: 'p1',
        terakhirDieditOlehId: null,
        createdAt: t,
        updatedAt: t,
        sop: {
          sopId: 'sop-up',
          opdId: 'opd-1',
          judul: 'Judul Lama',
          createdAt: t,
          updatedAt: t,
          opd: {
            opdId: 'opd-1',
            nama: 'OPD Satu',
            pengguna: [],
          },
        },
        dibuatOleh: { penggunaId: 'p1', nama: 'Budi' },
        terakhirDieditOleh: null,
        lampiranPeringatan: [],
        lampiranKualifikasiPelaksanaan: [],
        lampiranPeralatanPerlengkapan: [],
        lampiranPencatatanPendataan: [],
        dasarHukum: [],
        relasiSopKeluar: [],
        relasiSopMasuk: [],
        swimlanes: [],
        nilaiEvaluasi: [],
        langkahSOP: [],
        logEditSop: [],
        ...override,
      }) as unknown as SopWorkbenchDbPayload;

    beforeEach(() => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValue({
        detailSopId: 'det-up',
        sopId: 'sop-up',
      });
      repoMock.findWorkbenchPayloadByDetailOrSopId.mockResolvedValue(baseWorkbenchPayload());
      repoMock.updateSopHeaderTransaction.mockResolvedValue(undefined);
    });

    it('should_throw_not_found_when_detail_or_sop_id_unresolvable', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce(null);
      const dto: UpdateSopHeaderDto = { judul: 'X' };
      await expect(service.updatePenyusunHeader(user, 'unknown', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repoMock.updateSopHeaderTransaction).not.toHaveBeenCalled();
    });

    it('should_throw_conflict_when_detail_berlaku', async () => {
      repoMock.findWorkbenchPayloadByDetailOrSopId.mockResolvedValueOnce(
        baseWorkbenchPayload({ status: StatusSOP.BERLAKU }),
      );
      const dto: UpdateSopHeaderDto = { judul: 'Baru' };
      await expect(service.updatePenyusunHeader(user, 'det-up', dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repoMock.updateSopHeaderTransaction).not.toHaveBeenCalled();
    });

    it('should_throw_forbidden_when_opd_mismatch', async () => {
      const payload = baseWorkbenchPayload({
        sop: {
          sopId: 'sop-up',
          opdId: 'opd-lain',
          judul: 'X',
          createdAt: t,
          updatedAt: t,
          opd: {
            opdId: 'opd-lain',
            nama: 'OPD Lain',
            pengguna: [],
          },
        },
      });
      repoMock.findWorkbenchPayloadByDetailOrSopId.mockResolvedValueOnce(payload);
      const dto: UpdateSopHeaderDto = { judul: 'Baru' };
      await expect(service.updatePenyusunHeader(user, 'det-up', dto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repoMock.updateSopHeaderTransaction).not.toHaveBeenCalled();
    });

    it('should_update_judul_in_sop_header_when_judul_provided', async () => {
      const dto: UpdateSopHeaderDto = { judul: 'Judul Baru' };
      await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(repoMock.updateSopHeaderTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          detailSopId: 'det-up',
          sopId: 'sop-up',
          userId: 'pengguna-1',
          input: expect.objectContaining({ judul: 'Judul Baru' }),
          changedFields: ['judul'],
        }),
      );
    });

    it('should_return_workbench_with_logEdit_after_header_patch', async () => {
      const logTime = new Date('2026-04-01T09:00:00.000Z');
      repoMock.findWorkbenchPayloadByDetailOrSopId
        .mockResolvedValueOnce(baseWorkbenchPayload())
        .mockResolvedValueOnce(
          baseWorkbenchPayload({
            logEditSop: [
              {
                detailSopId: 'det-up',
                penggunaId: 'p1',
                createdAt: logTime,
                bagian: 'HEADER',
                targetEntityId: null,
                keterangan: 'Header SOP: Judul SOP',
                sesiChangeCount: 1,
                closedAt: null,
                updatedAt: logTime,
                domainFields: [{ domainField: 'judul' }],
                pengguna: {
                  penggunaId: 'p1',
                  nama: 'Budi',
                  email: 'budi@x',
                  peran: PeranPengguna.PENYUSUN,
                },
              },
            ],
          }),
        );
      const dto: UpdateSopHeaderDto = { judul: 'Judul Baru' };
      const actual = await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(actual.logEdit.length).toBeGreaterThan(0);
      expect(actual.logEdit[0]?.meta?.fields).toContain('judul');
    });

    it('should_update_nomor_and_namaLembaga_on_detail_when_provided', async () => {
      const dto: UpdateSopHeaderDto = {
        nomorSOP: '042/2026',
        namaLembaga: 'PEMERINTAH\nKOTA Y',
      };
      await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(repoMock.updateSopHeaderTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            nomorSOP: '042/2026',
            namaLembaga: 'PEMERINTAH\nKOTA Y',
          }),
        }),
      );
    });

    it('should_replace_dasar_hukum_when_ids_provided', async () => {
      const ids = [
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
      ];
      const dto: UpdateSopHeaderDto = { dasarHukumPeraturanIds: ids };
      await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(repoMock.updateSopHeaderTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({ dasarHukumPeraturanIds: ids }),
        }),
      );
    });

    it('should_replace_sop_terkait_when_ids_provided', async () => {
      const ids = [
        '33333333-3333-4333-8333-333333333333',
        '44444444-4444-4444-8444-444444444444',
      ];
      const dto: UpdateSopHeaderDto = { sopTerkaitDetailIds: ids };
      await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(repoMock.updateSopHeaderTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({ sopTerkaitDetailIds: ids }),
        }),
      );
    });

    it('should_replace_lampiran_per_jenis_when_arrays_provided', async () => {
      const dto: UpdateSopHeaderDto = {
        lampiran: {
          peringatan: ['Hati-hati saat verifikasi'],
          kualifikasiPelaksanaan: ['S1 Hukum', 'Sertifikat A'],
          peralatanPerlengkapan: ['Komputer', 'Printer'],
          pencatatanPendataan: ['Buku register'],
        },
      };
      await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(repoMock.updateSopHeaderTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            lampiran: {
              peringatan: ['Hati-hati saat verifikasi'],
              kualifikasiPelaksanaan: ['S1 Hukum', 'Sertifikat A'],
              peralatanPerlengkapan: ['Komputer', 'Printer'],
              pencatatanPendataan: ['Buku register'],
            },
          }),
          changedFields: expect.arrayContaining([
            'peringatan',
            'kualifikasiPelaksanaan',
            'peralatanPerlengkapan',
            'pencatatanPendataan',
          ]),
        }),
      );
    });

    it('should_throw_conflict_when_nomor_sop_duplicate', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      });
      repoMock.updateSopHeaderTransaction.mockRejectedValueOnce(p2002);
      const dto: UpdateSopHeaderDto = { nomorSOP: 'dup' };
      await expect(service.updatePenyusunHeader(user, 'det-up', dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('should_propagate_bad_request_when_repo_rejects_sop_terkait_inverse', async () => {
      repoMock.updateSopHeaderTransaction.mockRejectedValueOnce(
        new BadRequestException('SOP terkait bentrok: salah satu target sudah menaut balik ke dokumen ini'),
      );
      const dto: UpdateSopHeaderDto = { sopTerkaitDetailIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'] };
      await expect(service.updatePenyusunHeader(user, 'det-up', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should_skip_repo_when_dto_has_no_field', async () => {
      const dto: UpdateSopHeaderDto = {};
      await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(repoMock.updateSopHeaderTransaction).not.toHaveBeenCalled();
      expect(repoMock.findWorkbenchPayloadByDetailOrSopId).toHaveBeenCalled();
    });

    it('should_return_workbench_with_grouped_lampiran_after_update', async () => {
      const refreshedPayload = baseWorkbenchPayload({
        lampiranPeringatan: [
          {
            lampiranPeringatanId: 'l1',
            detailSopId: 'det-up',
            teks: 'Awas!',
            createdAt: t,
            updatedAt: t,
          },
        ],
        lampiranKualifikasiPelaksanaan: [
          {
            lampiranKualifikasiPelaksanaanId: 'l2',
            detailSopId: 'det-up',
            teks: 'S1 Hukum',
            createdAt: t,
            updatedAt: t,
          },
          {
            lampiranKualifikasiPelaksanaanId: 'l3',
            detailSopId: 'det-up',
            teks: 'Sertifikat A',
            createdAt: new Date(t.getTime() + 1000),
            updatedAt: new Date(t.getTime() + 1000),
          },
        ],
      });
      repoMock.findWorkbenchPayloadByDetailOrSopId
        .mockResolvedValueOnce(baseWorkbenchPayload())
        .mockResolvedValueOnce(refreshedPayload);
      const dto: UpdateSopHeaderDto = { lampiran: { peringatan: ['Awas!'] } };
      const actual = await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(actual.detail.lampiran?.peringatan.map((i) => i.teks)).toEqual(['Awas!']);
      expect(actual.detail.lampiran?.kualifikasiPelaksanaan.map((i) => i.teks)).toEqual([
        'S1 Hukum',
        'Sertifikat A',
      ]);
      expect(actual.detail.lampiran?.peralatanPerlengkapan.map((i) => i.teks)).toEqual([]);
      expect(actual.detail.lampiran?.pencatatanPendataan.map((i) => i.teks)).toEqual([]);
    });
  });

  describe('transitionDetailSopStatus', () => {
    const t = new Date('2026-05-01T08:00:00.000Z');
    function stubWorkbenchPayload(status: string): SopWorkbenchDbPayload {
      return {
        detailSopId: 'det-st',
        sopId: 'sop-st',
        status,
        versi: 1,
        nomorSOP: 'ST/1',
        tanggalPembuatan: t,
        tanggalRevisi: null,
        tanggalEfektif: null,
        namaLembaga: 'Lembaga',
        dibuatOlehId: 'p1',
        terakhirDieditOlehId: null,
        createdAt: t,
        updatedAt: t,
        sop: {
          sopId: 'sop-st',
          opdId: 'opd-1',
          judul: 'Judul ST',
          createdAt: t,
          updatedAt: t,
          opd: {
            opdId: 'opd-1',
            nama: 'OPD Satu',
            pengguna: [],
          },
        },
        dibuatOleh: { penggunaId: 'p1', nama: 'Budi' },
        terakhirDieditOleh: null,
        lampiranPeringatan: [],
        lampiranKualifikasiPelaksanaan: [],
        lampiranPeralatanPerlengkapan: [],
        lampiranPencatatanPendataan: [],
        dasarHukum: [],
        relasiSopKeluar: [],
        relasiSopMasuk: [],
        swimlanes: [],
        nilaiEvaluasi: [],
        langkahSOP: [],
        logEditSop: [],
      } as unknown as SopWorkbenchDbPayload;
    }

    function stubWorkbenchSiapLengkap(status: string): SopWorkbenchDbPayload {
      const pelaksanaId = 'pel-1';
      const langkahId = 'langkah-1';
      const base = stubWorkbenchPayload(status);
      return {
        ...base,
        lampiranPeringatan: [
          {
            detailSopId: 'det-st',
            lampiranPeringatanId: 'lt-per',
            teks: 'Perhatikan prosedur',
            createdAt: t,
            updatedAt: t,
          },
        ],
        lampiranKualifikasiPelaksanaan: [
          {
            detailSopId: 'det-st',
            lampiranKualifikasiPelaksanaanId: 'lt-kua',
            teks: 'Kualifikasi A',
            createdAt: t,
            updatedAt: t,
          },
        ],
        lampiranPeralatanPerlengkapan: [
          {
            detailSopId: 'det-st',
            lampiranPeralatanPerlengkapanId: 'lt-alat',
            teks: 'Alat B',
            createdAt: t,
            updatedAt: t,
          },
        ],
        lampiranPencatatanPendataan: [
          {
            detailSopId: 'det-st',
            lampiranPencatatanPendataanId: 'lt-cat',
            teks: 'Catatan C',
            createdAt: t,
            updatedAt: t,
          },
        ],
        dasarHukum: [
          {
            detailSopId: 'det-st',
            peraturanId: 'per-1',
            createdAt: t,
            updatedAt: t,
            peraturan: {
              peraturanId: 'per-1',
              nama: 'PP',
              nomor: '1',
              tahun: 2024,
              tentang: 'Peraturan contoh',
              createdAt: t,
              updatedAt: t,
            },
          },
        ],
        relasiSopKeluar: [
          {
            detailSopId: 'det-st',
            detailSopTerkaitId: 'det-lain',
            createdAt: t,
            updatedAt: t,
            sopTerkait: {
              detailSopId: 'det-lain',
              sopId: 'sop-lain',
              nomorSOP: '99/2026',
              sop: { sopId: 'sop-lain', judul: 'SOP lain' },
            },
          },
        ],
        swimlanes: [
          {
            detailSopId: 'det-st',
            pelaksanaId,
            urutan: 0,
            createdAt: t,
            updatedAt: t,
            pelaksana: {
              pelaksanaId,
              opdId: 'opd-1',
              nama: 'Pelaksana',
              createdAt: t,
              updatedAt: t,
            },
          },
        ],
        langkahSOP: [
          {
            langkahSopId: langkahId,
            detailSopId: 'det-st',
            urutan: 1,
            kegiatan: 'Isi formulir',
            jenis: JenisLangkahProsedur.KEGIATAN,
            kelengkapan: 'Form',
            keluaran: 'Draft',
            waktu: 1,
            satuanWaktu: SatuanWaktu.h,
            keterangan: 'Keterangan langkah',
            pelaksanaId,
            langkahSelanjutnyaYaId: null,
            langkahSelanjutnyaTidakId: null,
            createdAt: t,
            updatedAt: t,
            pelaksana: {
              pelaksanaId,
              opdId: 'opd-1',
              nama: 'Pelaksana',
              createdAt: t,
              updatedAt: t,
            },
          },
        ],
      } as unknown as SopWorkbenchDbPayload;
    }

    beforeEach(() => {
      repoMock.updateDetailSopStatus.mockResolvedValue(undefined);
    });

    it('should_throw_not_found_when_detail_missing', async () => {
      repoMock.findLatestDetailStatusContext.mockResolvedValueOnce(null);
      const dto: UpdateDetailSopStatusDto = { status: StatusSOP.SIAP_DIEVALUASI };
      await expect(service.transitionDetailSopStatus(user, 'unknown-id', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repoMock.updateDetailSopStatus).not.toHaveBeenCalled();
    });

    it('should_throw_conflict_when_target_equals_current', async () => {
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-st',
        sopId: 'sop-st',
        status: StatusSOP.DRAFT,
        sopOpdId: 'opd-1',
      });
      const dto: UpdateDetailSopStatusDto = { status: StatusSOP.DRAFT };
      await expect(service.transitionDetailSopStatus(user, 'det-st', dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repoMock.updateDetailSopStatus).not.toHaveBeenCalled();
    });

    it('should_throw_conflict_when_generic_status_endpoint_sets_berlaku', async () => {
      const kepalaUser: JwtAccessPayload = { ...user, peran: PeranPengguna.KEPALA_OPD };
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-st',
        sopId: 'sop-st',
        status: StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
        sopOpdId: 'opd-1',
      });
      const dto: UpdateDetailSopStatusDto = { status: StatusSOP.BERLAKU };
      await expect(service.transitionDetailSopStatus(kepalaUser, 'det-st', dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repoMock.updateDetailSopStatus).not.toHaveBeenCalled();
    });

    it('should_allow_draft_to_siap_dievaluasi_for_penyusun_when_workbench_lengkap', async () => {
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-st',
        sopId: 'sop-st',
        status: StatusSOP.DRAFT,
        sopOpdId: 'opd-1',
      });
      const draftRow = stubWorkbenchSiapLengkap('DRAFT');
      const refreshed = stubWorkbenchSiapLengkap('SIAP_DIEVALUASI');
      repoMock.findWorkbenchPayloadByDetailOrSopId
        .mockResolvedValueOnce(draftRow)
        .mockResolvedValueOnce(refreshed);
      const dto: UpdateDetailSopStatusDto = { status: StatusSOP.SIAP_DIEVALUASI };
      const actual = await service.transitionDetailSopStatus(user, 'det-st', dto);
      expect(repoMock.updateDetailSopStatus).toHaveBeenCalledWith({
        detailSopId: 'det-st',
        status: StatusSOP.SIAP_DIEVALUASI,
        userId: 'pengguna-1',
      });
      expect(actual.detail.status).toBe('SIAP_DIEVALUASI');
    });

    it('should_throw_bad_request_when_workbench_tidak_lengkap_for_siap_dievaluasi', async () => {
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-st',
        sopId: 'sop-st',
        status: StatusSOP.DRAFT,
        sopOpdId: 'opd-1',
      });
      repoMock.findWorkbenchPayloadByDetailOrSopId.mockResolvedValueOnce(stubWorkbenchPayload('DRAFT'));
      const dto: UpdateDetailSopStatusDto = { status: StatusSOP.SIAP_DIEVALUASI };
      await expect(service.transitionDetailSopStatus(user, 'det-st', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repoMock.updateDetailSopStatus).not.toHaveBeenCalled();
    });

    it('should_forbid_penyusun_submitting_evaluasi_from_siap', async () => {
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-st',
        sopId: 'sop-st',
        status: StatusSOP.SIAP_DIEVALUASI,
        sopOpdId: 'opd-1',
      });
      const dto: UpdateDetailSopStatusDto = { status: StatusSOP.DIAJUKAN_EVALUASI };
      await expect(service.transitionDetailSopStatus(user, 'det-st', dto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repoMock.updateDetailSopStatus).not.toHaveBeenCalled();
    });

    it('should_allow_pj_penyusun_submitting_evaluasi_from_siap', async () => {
      const pjUser: JwtAccessPayload = { ...user, peran: PeranPengguna.PJ_PENYUSUN };
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-st',
        sopId: 'sop-st',
        status: StatusSOP.SIAP_DIEVALUASI,
        sopOpdId: 'opd-1',
      });
      const refreshed = stubWorkbenchPayload('DIAJUKAN_EVALUASI');
      repoMock.findWorkbenchPayloadByDetailOrSopId.mockResolvedValueOnce(refreshed);
      const dto: UpdateDetailSopStatusDto = { status: StatusSOP.DIAJUKAN_EVALUASI };
      const actual = await service.transitionDetailSopStatus(pjUser, 'det-st', dto);
      expect(repoMock.updateDetailSopStatus).toHaveBeenCalledWith({
        detailSopId: 'det-st',
        status: StatusSOP.DIAJUKAN_EVALUASI,
        userId: 'pengguna-1',
      });
      expect(actual.detail.status).toBe('DIAJUKAN_EVALUASI');
    });
  });

  describe('kirimUlangKeEvaluatorSetelahRevisi', () => {
    const t = new Date('2026-05-01T08:00:00.000Z');

    function minimalRevisiWorkbench(): SopWorkbenchDbPayload {
      const pelaksanaId = 'pel-1';
      const langkahId = 'langkah-1';
      return {
        detailSopId: 'det-rev',
        sopId: 'sop-rev',
        status: 'REVISI_DARI_EVALUATOR',
        versi: 1,
        nomorSOP: 'REV/1',
        tanggalPembuatan: t,
        tanggalRevisi: null,
        tanggalEfektif: null,
        namaLembaga: 'Lembaga',
        dibuatOlehId: 'p1',
        terakhirDieditOlehId: null,
        createdAt: t,
        updatedAt: t,
        sop: {
          sopId: 'sop-rev',
          opdId: 'opd-1',
          judul: 'Judul Rev',
          createdAt: t,
          updatedAt: t,
          opd: {
            opdId: 'opd-1',
            nama: 'OPD Satu',
            pengguna: [],
          },
        },
        dibuatOleh: { penggunaId: 'p1', nama: 'Budi' },
        terakhirDieditOleh: null,
        lampiranPeringatan: [
          {
            detailSopId: 'det-rev',
            lampiranPeringatanId: 'lt-per',
            teks: 'Perhatian',
            createdAt: t,
            updatedAt: t,
          },
        ],
        lampiranKualifikasiPelaksanaan: [
          {
            detailSopId: 'det-rev',
            lampiranKualifikasiPelaksanaanId: 'lt-kua',
            teks: 'Kualifikasi',
            createdAt: t,
            updatedAt: t,
          },
        ],
        lampiranPeralatanPerlengkapan: [
          {
            detailSopId: 'det-rev',
            lampiranPeralatanPerlengkapanId: 'lt-alat',
            teks: 'Alat',
            createdAt: t,
            updatedAt: t,
          },
        ],
        lampiranPencatatanPendataan: [
          {
            detailSopId: 'det-rev',
            lampiranPencatatanPendataanId: 'lt-cat',
            teks: 'Catat',
            createdAt: t,
            updatedAt: t,
          },
        ],
        dasarHukum: [
          {
            detailSopId: 'det-rev',
            peraturanId: 'per-1',
            createdAt: t,
            updatedAt: t,
            peraturan: {
              peraturanId: 'per-1',
              nama: 'PP',
              nomor: '1',
              tahun: 2024,
              tentang: 'Peraturan contoh',
              createdAt: t,
              updatedAt: t,
            },
          },
        ],
        relasiSopKeluar: [
          {
            detailSopId: 'det-rev',
            detailSopTerkaitId: 'det-lain',
            createdAt: t,
            updatedAt: t,
            sopTerkait: {
              detailSopId: 'det-lain',
              sopId: 'sop-lain',
              nomorSOP: '99/2026',
              sop: { sopId: 'sop-lain', judul: 'SOP lain' },
            },
          },
        ],
        relasiSopMasuk: [],
        swimlanes: [
          {
            detailSopId: 'det-rev',
            pelaksanaId,
            urutan: 0,
            createdAt: t,
            updatedAt: t,
            pelaksana: {
              pelaksanaId,
              opdId: 'opd-1',
              nama: 'Pelaksana',
              createdAt: t,
              updatedAt: t,
            },
          },
        ],
        nilaiEvaluasi: [],
        langkahSOP: [
          {
            langkahSopId: langkahId,
            detailSopId: 'det-rev',
            urutan: 1,
            kegiatan: 'Isi',
            jenis: JenisLangkahProsedur.KEGIATAN,
            kelengkapan: 'Form',
            keluaran: 'Out',
            waktu: 1,
            satuanWaktu: SatuanWaktu.h,
            keterangan: 'Ket',
            pelaksanaId,
            langkahSelanjutnyaYaId: null,
            langkahSelanjutnyaTidakId: null,
            createdAt: t,
            updatedAt: t,
            pelaksana: {
              pelaksanaId,
              opdId: 'opd-1',
              nama: 'Pelaksana',
              createdAt: t,
              updatedAt: t,
            },
          },
        ],
        logEditSop: [],
      } as unknown as SopWorkbenchDbPayload;
    }

    beforeEach(() => {
      repoMock.transitionDetailSopRevisiToDiajukanEvaluasi.mockResolvedValue(undefined);
    });

    it('should_forbid_evaluator', async () => {
      const evUser: JwtAccessPayload = { ...user, peran: PeranPengguna.EVALUATOR };
      await expect(service.kirimUlangKeEvaluatorSetelahRevisi(evUser, 'det-rev')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repoMock.findLatestDetailStatusContext).not.toHaveBeenCalled();
    });

    it('should_throw_conflict_when_bukan_revisi', async () => {
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-rev',
        sopId: 'sop-rev',
        status: StatusSOP.DRAFT,
        sopOpdId: 'opd-1',
      });
      await expect(service.kirimUlangKeEvaluatorSetelahRevisi(user, 'det-rev')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repoMock.transitionDetailSopRevisiToDiajukanEvaluasi).not.toHaveBeenCalled();
    });

    it('should_apply_transaction_and_return_diajukan_for_penyusun', async () => {
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-rev',
        sopId: 'sop-rev',
        status: StatusSOP.REVISI_DARI_EVALUATOR,
        sopOpdId: 'opd-1',
      });
      const lengkap = minimalRevisiWorkbench();
      const refreshed = { ...lengkap, status: 'DIAJUKAN_EVALUASI' } as unknown as SopWorkbenchDbPayload;
      repoMock.findWorkbenchPayloadByDetailOrSopId
        .mockResolvedValueOnce(lengkap)
        .mockResolvedValueOnce(refreshed);
      const actual = await service.kirimUlangKeEvaluatorSetelahRevisi(user, 'det-rev');
      expect(repoMock.transitionDetailSopRevisiToDiajukanEvaluasi).toHaveBeenCalledWith({
        detailSopId: 'det-rev',
        userId: 'pengguna-1',
      });
      expect(actual.detail.status).toBe('DIAJUKAN_EVALUASI');
    });

    it('should_allow_pj_penyusun', async () => {
      const pjUser: JwtAccessPayload = { ...user, peran: PeranPengguna.PJ_PENYUSUN };
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-rev',
        sopId: 'sop-rev',
        status: StatusSOP.REVISI_DARI_EVALUATOR,
        sopOpdId: 'opd-1',
      });
      const lengkap = minimalRevisiWorkbench();
      const refreshed = { ...lengkap, status: 'DIAJUKAN_EVALUASI' } as unknown as SopWorkbenchDbPayload;
      repoMock.findWorkbenchPayloadByDetailOrSopId
        .mockResolvedValueOnce(lengkap)
        .mockResolvedValueOnce(refreshed);
      const actual = await service.kirimUlangKeEvaluatorSetelahRevisi(pjUser, 'det-rev');
      expect(repoMock.transitionDetailSopRevisiToDiajukanEvaluasi).toHaveBeenCalledWith({
        detailSopId: 'det-rev',
        userId: 'pengguna-1',
      });
      expect(actual.detail.status).toBe('DIAJUKAN_EVALUASI');
    });

    it('should_reject_kirim_ulang_when_umpan_balik_belum_selesai', async () => {
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-rev',
        sopId: 'sop-rev',
        status: StatusSOP.REVISI_DARI_EVALUATOR,
        sopOpdId: 'opd-1',
      });
      evaluasiNilaiServiceMock.assertBolehKirimUlangSetelahRevisi.mockRejectedValueOnce(
        new BadRequestException(
          'Tandai umpan balik evaluasi sebagai selesai sebelum mengirim ulang ke evaluator',
        ),
      );
      await expect(service.kirimUlangKeEvaluatorSetelahRevisi(user, 'det-rev')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repoMock.transitionDetailSopRevisiToDiajukanEvaluasi).not.toHaveBeenCalled();
    });
  });

  describe('buatVersiBaruDariBerlaku', () => {
    const t = new Date('2026-05-20T08:00:00.000Z');
    const workbenchV2 = {
      detailSopId: 'det-v2',
      sopId: 'sop-v1',
      status: 'DRAFT',
      versi: 2,
      nomorSOP: 'SOP-V2',
      tanggalPembuatan: t,
      tanggalRevisi: t,
      tanggalEfektif: null,
      namaLembaga: 'Lembaga',
      dibuatOlehId: 'pengguna-1',
      terakhirDieditOlehId: null,
      createdAt: t,
      updatedAt: t,
      revisiDariDetailSopId: 'det-v1',
      revisiDari: { detailSopId: 'det-v1', versi: 1 },
      sop: {
        sopId: 'sop-v1',
        opdId: 'opd-1',
        judul: 'SOP Versi',
        createdAt: t,
        updatedAt: t,
        opd: { opdId: 'opd-1', nama: 'OPD Satu', pengguna: [] },
      },
      dibuatOleh: { penggunaId: 'pengguna-1', nama: 'Budi' },
      terakhirDieditOleh: null,
      lampiranPeringatan: [],
      lampiranKualifikasiPelaksanaan: [],
      lampiranPeralatanPerlengkapan: [],
      lampiranPencatatanPendataan: [],
      dasarHukum: [],
      relasiSopKeluar: [],
      relasiSopMasuk: [],
      swimlanes: [],
      nilaiEvaluasi: [],
      langkahSOP: [],
      logEditSop: [],
    } as unknown as SopWorkbenchDbPayload;

    it('should_clone_from_berlaku_and_return_workbench', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValue({
        detailSopId: 'det-v1',
        sopId: 'sop-v1',
      });
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-v1',
        sopId: 'sop-v1',
        status: StatusSOP.BERLAKU,
        sopOpdId: 'opd-1',
      });
      repoMock.cloneDetailSopFromBerlaku.mockResolvedValue({
        detailSopId: 'det-v2',
        versi: 2,
      });
      repoMock.findWorkbenchPayloadByDetailOrSopId.mockResolvedValue(workbenchV2);
      const actual = await service.buatVersiBaruDariBerlaku(user, 'det-v1');
      expect(repoMock.cloneDetailSopFromBerlaku).toHaveBeenCalledWith({
        sourceDetailSopId: 'det-v1',
        penggunaId: 'pengguna-1',
      });
      expect(actual.detail.id).toBe('det-v2');
    });

    it('should_throw_forbidden_when_not_penyusun', async () => {
      const evaluator: JwtAccessPayload = { ...user, peran: PeranPengguna.EVALUATOR };
      await expect(service.buatVersiBaruDariBerlaku(evaluator, 'det-v1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('hapusVersiDraft', () => {
    it('should_call_repo_delete_when_penyusun', async () => {
      repoMock.findLatestDetailStatusContext.mockResolvedValue({
        detailSopId: 'det-draft',
        sopId: 'sop-1',
        status: StatusSOP.DRAFT,
        sopOpdId: 'opd-1',
      });
      repoMock.deleteVersiDraft.mockResolvedValue(undefined);
      await service.hapusVersiDraft(user, 'det-draft');
      expect(repoMock.deleteVersiDraft).toHaveBeenCalledWith('det-draft');
    });
  });
});

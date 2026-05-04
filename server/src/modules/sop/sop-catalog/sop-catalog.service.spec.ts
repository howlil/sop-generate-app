import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PeranPengguna, Prisma } from '../../../generated/prisma';
import type { JwtAccessPayload } from '../../../common';
import type { CreateSopDto } from './dto/create-sop.dto';
import type { UpdateSopHeaderDto } from './dto/update-sop-header.dto';
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
      | 'updateSopHeaderTransaction'
    >
  > = {
    findOpdIdByPenggunaId: jest.fn(),
    findDaftarByOpdId: jest.fn(),
    findDaftarAll: jest.fn(),
    findOpdNama: jest.fn(),
    createSopWithInitialDetail: jest.fn(),
    findWorkbenchPayloadByDetailOrSopId: jest.fn(),
    findDetailIdByDetailOrSopId: jest.fn(),
    updateSopHeaderTransaction: jest.fn(),
  };
  const user: JwtAccessPayload = {
    sub: 'pengguna-1',
    email: 'a@b.c',
    peran: PeranPengguna.PENYUSUN,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SopCatalogService,
        { provide: SopCatalogRepository, useValue: repoMock as unknown as SopCatalogRepository },
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
        updatedAt: t,
        pembuatNama: 'Budi',
        editorNama: 'Ani',
        peraturanId: 'per-1',
      },
    };
    repoMock.findDaftarByOpdId.mockResolvedValue([row]);
    const actual = await service.listForCurrentUser(user);
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
    const row: SopDaftarDbRow = { sopId: 'sop-2', opdId: 'opd-1', judul: 'Tanpa detail', detail: undefined };
    repoMock.findDaftarByOpdId.mockResolvedValue([row]);
    const actual = await service.listForCurrentUser(user);
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
    expect(repoMock.findDaftarAll).toHaveBeenCalled();
    expect(repoMock.findOpdIdByPenggunaId).not.toHaveBeenCalled();
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
        updatedAt: t,
        pembuatNama: 'Budi',
        editorNama: null,
        peraturanId: null,
      },
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
        updatedAt: t,
        pembuatNama: 'Budi',
        editorNama: null,
        peraturanId: null,
      },
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
        updatedAt: t,
        pembuatNama: 'Budi',
        editorNama: null,
        peraturanId: null,
      },
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
      salinDariDetailSopId: null,
      status: 'DRAFT',
      versi: 1,
      nomorSOP: 'WB/1',
      tanggalPembuatan: t,
      tanggalRevisi: null,
      tanggalEfektif: null,
      namaLembaga: 'Lembaga',
      lebarKolomKegiatan: null,
      lebarKolomPelaksana: null,
      lebarKolomKelengkapan: null,
      lebarKolomWaktu: null,
      lebarKolomOutput: null,
      lebarKolomKeterangan: null,
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
          kepalaPenggunaId: null,
          kepalaPengguna: null,
        },
      },
      dibuatOleh: { penggunaId: 'p1', nama: 'Budi' },
      terakhirDieditOleh: null,
      lampiran: [],
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
      salinDariDetailSopId: null,
      status: 'DRAFT',
      versi: 1,
      nomorSOP: 'WB/2',
      tanggalPembuatan: t,
      tanggalRevisi: null,
      tanggalEfektif: null,
      namaLembaga: 'Lembaga 2',
      lebarKolomKegiatan: null,
      lebarKolomPelaksana: null,
      lebarKolomKelengkapan: null,
      lebarKolomWaktu: null,
      lebarKolomOutput: null,
      lebarKolomKeterangan: null,
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
          kepalaPenggunaId: 'kepala-1',
          kepalaPengguna: { nama: 'Dr. Kepala', nip: '198001012010011001' },
        },
      },
      dibuatOleh: { penggunaId: 'p1', nama: 'Budi' },
      terakhirDieditOleh: null,
      lampiran: [],
      dasarHukum: [],
      relasiSopKeluar: [],
      relasiSopMasuk: [],
      swimlanes: [],
      nilaiEvaluasi: [],
      langkahSOP: [],
      logEditSop: [
        {
          logEditSopId: 'log-1',
          detailSopId: 'det-wb-2',
          userId: 'p1',
          bagian: 'HEADER',
          entityId: null,
          keterangan: 'Header SOP: Peringatan',
          meta: { fields: ['peringatan'], count: 1 },
          closedAt: null,
          createdAt: t,
          updatedAt: t,
          user: {
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
    expect(actual.logEdit[0]?.aktorRole).toBe(PeranPengguna.PENYUSUN);
  });

  describe('updatePenyusunHeader', () => {
    const t = new Date('2026-04-01T08:00:00.000Z');
    const baseWorkbenchPayload = (override?: Partial<Record<string, unknown>>): SopWorkbenchDbPayload =>
      ({
        detailSopId: 'det-up',
        sopId: 'sop-up',
        salinDariDetailSopId: null,
        status: 'DRAFT',
        versi: 1,
        nomorSOP: 'WB/UP',
        tanggalPembuatan: t,
        tanggalRevisi: null,
        tanggalEfektif: null,
        namaLembaga: 'Lembaga',
        lebarKolomKegiatan: null,
        lebarKolomPelaksana: null,
        lebarKolomKelengkapan: null,
        lebarKolomWaktu: null,
        lebarKolomOutput: null,
        lebarKolomKeterangan: null,
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
            kepalaPenggunaId: null,
            kepalaPengguna: null,
          },
        },
        dibuatOleh: { penggunaId: 'p1', nama: 'Budi' },
        terakhirDieditOleh: null,
        lampiran: [],
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
            kepalaPenggunaId: null,
            kepalaPengguna: null,
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
        peringatan: 'Hati-hati saat verifikasi',
        kualifikasiPelaksanaan: ['S1 Hukum', 'Sertifikat A'],
        peralatanPerlengkapan: ['Komputer', 'Printer'],
        pencatatanPendataan: ['Buku register'],
      };
      await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(repoMock.updateSopHeaderTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            peringatan: 'Hati-hati saat verifikasi',
            kualifikasiPelaksanaan: ['S1 Hukum', 'Sertifikat A'],
            peralatanPerlengkapan: ['Komputer', 'Printer'],
            pencatatanPendataan: ['Buku register'],
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

    it('should_skip_repo_when_dto_has_no_field', async () => {
      const dto: UpdateSopHeaderDto = {};
      await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(repoMock.updateSopHeaderTransaction).not.toHaveBeenCalled();
      expect(repoMock.findWorkbenchPayloadByDetailOrSopId).toHaveBeenCalled();
    });

    it('should_return_workbench_with_grouped_lampiran_after_update', async () => {
      const refreshedPayload = baseWorkbenchPayload({
        lampiran: [
          {
            lampiranTeksId: 'l1',
            detailSopId: 'det-up',
            jenis: 'PERINGATAN',
            teks: 'Awas!',
            createdAt: t,
            updatedAt: t,
          },
          {
            lampiranTeksId: 'l2',
            detailSopId: 'det-up',
            jenis: 'KUALIFIKASI_PELAKSANAAN',
            teks: 'S1 Hukum',
            createdAt: t,
            updatedAt: t,
          },
          {
            lampiranTeksId: 'l3',
            detailSopId: 'det-up',
            jenis: 'KUALIFIKASI_PELAKSANAAN',
            teks: 'Sertifikat A',
            createdAt: new Date(t.getTime() + 1000),
            updatedAt: new Date(t.getTime() + 1000),
          },
        ],
      });
      repoMock.findWorkbenchPayloadByDetailOrSopId
        .mockResolvedValueOnce(baseWorkbenchPayload())
        .mockResolvedValueOnce(refreshedPayload);
      const dto: UpdateSopHeaderDto = { peringatan: 'Awas!' };
      const actual = await service.updatePenyusunHeader(user, 'det-up', dto);
      expect(actual.detail.peringatan).toBe('Awas!');
      expect(actual.detail.kualifikasiPelaksanaan).toEqual(['S1 Hukum', 'Sertifikat A']);
      expect(actual.detail.peralatanPerlengkapan).toEqual([]);
      expect(actual.detail.pencatatanPendataan).toEqual([]);
    });
  });
});

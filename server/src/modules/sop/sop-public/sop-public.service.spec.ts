import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SopCatalogService } from '../sop-catalog/sop-catalog.service';
import type { PublicArsipQueryDto } from './dto/public-arsip-query.dto';
import { SopPublicRepository } from './sop-public.repository';
import { SopPublicService } from './sop-public.service';

describe('SopPublicService', () => {
  let service: SopPublicService;
  const repoMock = {
    countOpdWithBerlakuSop: jest.fn(),
    findOpdWithBerlakuSop: jest.fn(),
    findOpdAktifById: jest.fn(),
    countBerlakuSopByOpd: jest.fn(),
    findBerlakuSopByOpd: jest.fn(),
    countBerlakuSopGlobal: jest.fn(),
    findBerlakuSopGlobal: jest.fn(),
  };
  const catalogMock = {
    getPublicDokumenBerlaku: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SopPublicService,
        { provide: SopPublicRepository, useValue: repoMock },
        { provide: SopCatalogService, useValue: catalogMock },
      ],
    }).compile();
    service = module.get(SopPublicService);
  });

  it('should_return_paginated_opd_list', async () => {
    repoMock.countOpdWithBerlakuSop.mockResolvedValue(2);
    repoMock.findOpdWithBerlakuSop.mockResolvedValue([
      { opdId: 'opd-1', nama: 'OPD Satu', jumlahSopBerlaku: 3 },
      { opdId: 'opd-2', nama: 'OPD Dua', jumlahSopBerlaku: 1 },
    ]);
    const query = { page: 1, limit: 10, search: 'satu' } as PublicArsipQueryDto;
    const actual = await service.listOpd(query);
    expect(repoMock.countOpdWithBerlakuSop).toHaveBeenCalledWith('satu');
    expect(repoMock.findOpdWithBerlakuSop).toHaveBeenCalledWith({
      search: 'satu',
      skip: 0,
      take: 10,
    });
    expect(actual.items).toHaveLength(2);
    expect(actual.pagination.totalItems).toBe(2);
  });

  it('should_throw_not_found_when_opd_missing_for_sop_list', async () => {
    repoMock.findOpdAktifById.mockResolvedValue(null);
    await expect(
      service.listSopByOpd('opd-x', { page: 1, limit: 10 } as PublicArsipQueryDto),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should_return_paginated_sop_list_for_opd', async () => {
    repoMock.findOpdAktifById.mockResolvedValue({ opdId: 'opd-1', nama: 'OPD Satu' });
    repoMock.countBerlakuSopByOpd.mockResolvedValue(1);
    repoMock.findBerlakuSopByOpd.mockResolvedValue([
      {
        detailSopId: 'det-1',
        sopId: 'sop-1',
        opdId: 'opd-1',
        judul: 'Judul SOP',
        nomorSOP: '01/2026',
        versi: 1,
        tanggalEfektif: new Date('2026-05-01T00:00:00.000Z'),
        opdNama: 'OPD Satu',
      },
    ]);
    const actual = await service.listSopByOpd('opd-1', {
      page: 1,
      limit: 10,
      search: 'judul',
    } as PublicArsipQueryDto);
    expect(repoMock.findBerlakuSopByOpd).toHaveBeenCalledWith({
      opdId: 'opd-1',
      search: 'judul',
      skip: 0,
      take: 10,
    });
    expect(actual.opd).toEqual({ opdId: 'opd-1', nama: 'OPD Satu' });
    expect(actual.items[0]?.detailSopId).toBe('det-1');
    expect(actual.items[0]?.opdId).toBe('opd-1');
    expect(actual.items[0]?.tanggalEfektif).toBe('2026-05-01T00:00:00.000Z');
  });

  it('should_return_paginated_global_sop_search', async () => {
    repoMock.countBerlakuSopGlobal.mockResolvedValue(1);
    repoMock.findBerlakuSopGlobal.mockResolvedValue([
      {
        detailSopId: 'det-2',
        sopId: 'sop-2',
        opdId: 'opd-2',
        judul: 'SOP Dua',
        nomorSOP: '02/2026',
        versi: 1,
        tanggalEfektif: null,
        opdNama: 'OPD Dua',
      },
    ]);
    const actual = await service.listSopGlobal({
      page: 1,
      limit: 15,
      search: 'sop',
    } as PublicArsipQueryDto);
    expect(repoMock.countBerlakuSopGlobal).toHaveBeenCalledWith('sop');
    expect(actual.items[0]?.opdNama).toBe('OPD Dua');
    expect(actual.pagination.totalItems).toBe(1);
  });

  it('should_delegate_get_dokumen_to_catalog_service', async () => {
    const dokumen = {
      opd: { id: 'opd-1', nama: 'OPD' },
      detail: { id: 'det-1' },
      langkah: [],
    };
    catalogMock.getPublicDokumenBerlaku.mockResolvedValue(dokumen);
    const actual = await service.getDokumen('det-1');
    expect(catalogMock.getPublicDokumenBerlaku).toHaveBeenCalledWith('det-1');
    expect(actual).toBe(dokumen);
  });
});

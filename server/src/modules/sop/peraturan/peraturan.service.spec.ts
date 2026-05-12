import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PeranPengguna } from '../../../generated/prisma';
import type { JwtAccessPayload } from '../../../common';
import { PeraturanRepository } from './peraturan.repository';
import { PeraturanService } from './peraturan.service';

describe('PeraturanService', () => {
  let service: PeraturanService;
  const repoMock: jest.Mocked<Pick<
    PeraturanRepository,
    | 'findOpdIdByPenggunaId'
    | 'hasOpdLink'
    | 'countDasarHukum'
    | 'deleteOpdLink'
    | 'countOpdLinks'
    | 'deletePeraturan'
    | 'findManyByOpdId'
  >> = {
    findOpdIdByPenggunaId: jest.fn(),
    hasOpdLink: jest.fn(),
    countDasarHukum: jest.fn(),
    deleteOpdLink: jest.fn(),
    countOpdLinks: jest.fn(),
    deletePeraturan: jest.fn(),
    findManyByOpdId: jest.fn(),
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
        PeraturanService,
        { provide: PeraturanRepository, useValue: repoMock as unknown as PeraturanRepository },
      ],
    }).compile();
    service = module.get(PeraturanService);
    repoMock.findOpdIdByPenggunaId.mockResolvedValue('opd-1');
    repoMock.hasOpdLink.mockResolvedValue(true);
  });

  it('should_throw_conflict_when_remove_but_dasar_hukum_exists', async () => {
    repoMock.countDasarHukum.mockResolvedValue(2);
    await expect(service.remove(user, 'per-1')).rejects.toBeInstanceOf(ConflictException);
    expect(repoMock.deleteOpdLink).not.toHaveBeenCalled();
  });

  it('should_delete_link_and_master_when_no_other_opd_after_remove', async () => {
    repoMock.countDasarHukum.mockResolvedValue(0);
    repoMock.countOpdLinks.mockResolvedValue(0);
    await service.remove(user, 'per-1');
    expect(repoMock.deleteOpdLink).toHaveBeenCalledWith('opd-1', 'per-1');
    expect(repoMock.deletePeraturan).toHaveBeenCalledWith('per-1');
  });

  it('should_not_delete_master_when_other_opd_still_linked', async () => {
    repoMock.countDasarHukum.mockResolvedValue(0);
    repoMock.countOpdLinks.mockResolvedValue(1);
    await service.remove(user, 'per-1');
    expect(repoMock.deleteOpdLink).toHaveBeenCalledWith('opd-1', 'per-1');
    expect(repoMock.deletePeraturan).not.toHaveBeenCalled();
  });

  it('should_include_last_edited_by_fields_on_list_mapping', async () => {
    repoMock.findManyByOpdId.mockResolvedValue([
      {
        peraturanId: 'per-1',
        nama: 'Permen A',
        nomor: '1',
        tahun: 2026,
        tentang: 'Tentang A',
        lastEditedById: 'u-last',
        lastEditedBy: { penggunaId: 'u-last', nama: 'Budi', opd: { opdId: 'opd-1', nama: 'OPD X' } },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        dasarHukumCount: 3,
      },
    ]);
    const rows = await service.list(user, undefined);
    expect(rows[0]?.lastEditedById).toBe('u-last');
    expect(rows[0]?.lastEditedBy?.nama).toBe('Budi');
    expect(rows[0]?.lastEditedBy?.opd?.nama).toBe('OPD X');
  });
});

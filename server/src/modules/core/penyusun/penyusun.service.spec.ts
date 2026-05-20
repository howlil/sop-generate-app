import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PeranPengguna, type Pengguna } from '../../../generated/prisma';
import { PenggunaRepository } from '../pengguna/pengguna.repository';
import { PenyusunRepository } from './penyusun.repository';
import { PenyusunService } from './penyusun.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('PenyusunService', () => {
  let service: PenyusunService;

  const penyusunRepoMock = {
    findOpdsWithPenyusun: jest.fn().mockResolvedValue([
      {
        opdId: 'opd-1',
        nama: 'Dinas A',
        pengguna: [
          {
            penggunaId: 'u1',
            nama: 'A',
            nip: '1',
            jabatan: 'J',
            pangkat: 'P',
            email: 'a@b.c',
            nohp: '0',
            peran: PeranPengguna.PENYUSUN,
            deletedAt: null,
          } as Pengguna,
        ],
      },
    ]),
    findPenyusunById: jest.fn(),
    findPenyusunAktifById: jest.fn(),
    findOpdById: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'X' }),
    findOtherPjPenyusunAktif: jest.fn().mockResolvedValue(null),
    createWithRiwayatOpd: jest.fn(),
    updatePenyusun: jest.fn(),
    aktifkanPenyusun: jest.fn(),
    pindahPenyusun: jest.fn(),
  };

  const penggunaRepoMock = {
    existsEmailOtherThan: jest.fn().mockResolvedValue(false),
    existsNipOtherThan: jest.fn().mockResolvedValue(false),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    penyusunRepoMock.findOtherPjPenyusunAktif.mockResolvedValue(null);
    penyusunRepoMock.findOpdById.mockResolvedValue({ opdId: 'opd-1', nama: 'X' });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PenyusunService,
        { provide: PenyusunRepository, useValue: penyusunRepoMock },
        { provide: PenggunaRepository, useValue: penggunaRepoMock },
      ],
    }).compile();
    service = module.get(PenyusunService);
  });

  it('should_map_list_grup_with_status', async () => {
    const grup = await service.listGrup();
    expect(grup).toHaveLength(1);
    expect(grup[0].namaOpd).toBe('Dinas A');
    expect(grup[0].penyusun[0].status).toBe('AKTIF');
    expect(grup[0].penyusun[0].peran).toBe('PENYUSUN');
  });

  it('should_throw_conflict_when_create_pj_but_opd_already_has_pj', async () => {
    penyusunRepoMock.findOtherPjPenyusunAktif.mockResolvedValueOnce({
      penggunaId: 'pj-existing',
      peran: PeranPengguna.PJ_PENYUSUN,
    } as Pengguna);
    await expect(
      service.create({
        opdId: 'opd-1',
        nama: 'B',
        nip: '2',
        peran: 'PJ_PENYUSUN',
        pangkat: 'IV/a',
        jabatan: 'Analis',
        email: 'b@x.id',
        nohp: '081',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(penyusunRepoMock.createWithRiwayatOpd).not.toHaveBeenCalled();
  });

  it('should_throw_conflict_when_promote_to_pj_but_other_pj_exists', async () => {
    penyusunRepoMock.findPenyusunById.mockResolvedValueOnce({
      penggunaId: 'u-promote',
      email: 'u@x.id',
      nip: '9',
      opdId: 'opd-1',
      peran: PeranPengguna.PENYUSUN,
      nama: 'U',
      pangkat: 'IV/a',
      jabatan: 'J',
      nohp: '0',
      deletedAt: null,
    } as Pengguna);
    penyusunRepoMock.findOtherPjPenyusunAktif.mockResolvedValueOnce({
      penggunaId: 'pj-lain',
      peran: PeranPengguna.PJ_PENYUSUN,
    } as Pengguna);
    await expect(
      service.update('u-promote', { peran: 'PJ_PENYUSUN' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(penyusunRepoMock.updatePenyusun).not.toHaveBeenCalled();
  });

  it('should_throw_conflict_when_aktifkan_pj_but_slot_taken', async () => {
    penyusunRepoMock.findPenyusunById.mockResolvedValueOnce({
      penggunaId: 'pj-inaktif',
      email: 'pj@x.id',
      nip: '7',
      opdId: 'opd-1',
      peran: PeranPengguna.PJ_PENYUSUN,
      nama: 'PJ',
      pangkat: 'IV/a',
      jabatan: 'J',
      nohp: '0',
      deletedAt: new Date(),
    } as Pengguna);
    penyusunRepoMock.findOtherPjPenyusunAktif.mockResolvedValueOnce({
      penggunaId: 'pj-aktif-lain',
      peran: PeranPengguna.PJ_PENYUSUN,
    } as Pengguna);
    await expect(service.aktifkan('pj-inaktif')).rejects.toBeInstanceOf(ConflictException);
    expect(penyusunRepoMock.aktifkanPenyusun).not.toHaveBeenCalled();
  });

  it('should_throw_conflict_when_pindah_pj_to_opd_that_already_has_pj', async () => {
    penyusunRepoMock.findPenyusunAktifById.mockResolvedValueOnce({
      penggunaId: 'pj-move',
      email: 'm@x.id',
      nip: '3',
      opdId: 'opd-asal',
      peran: PeranPengguna.PJ_PENYUSUN,
      nama: 'M',
      pangkat: 'IV/a',
      jabatan: 'J',
      nohp: '0',
      deletedAt: null,
    } as Pengguna);
    penyusunRepoMock.findOpdById.mockResolvedValueOnce({ opdId: 'opd-tujuan', nama: 'Tujuan' });
    penyusunRepoMock.findOtherPjPenyusunAktif.mockResolvedValueOnce({
      penggunaId: 'pj-di-tujuan',
      peran: PeranPengguna.PJ_PENYUSUN,
    } as Pengguna);
    await expect(service.pindah('pj-move', 'opd-tujuan')).rejects.toBeInstanceOf(ConflictException);
    expect(penyusunRepoMock.pindahPenyusun).not.toHaveBeenCalled();
  });

  it('should_create_penyusun_via_repository', async () => {
    const createdUser = {
      penggunaId: 'new-u',
      email: 'n@x.id',
      nip: '99',
      opdId: 'opd-1',
      peran: PeranPengguna.PENYUSUN,
      nama: 'N',
      pangkat: 'IV/a',
      jabatan: 'J',
      nohp: '0',
      deletedAt: null,
    } as Pengguna;
    penyusunRepoMock.createWithRiwayatOpd.mockResolvedValueOnce(createdUser);
    const actual = await service.create({
      opdId: 'opd-1',
      nama: 'N',
      nip: '99',
      peran: 'PENYUSUN',
      pangkat: 'IV/a',
      jabatan: 'J',
      email: 'n@x.id',
      nohp: '0',
    });
    expect(actual.id).toBe('new-u');
    expect(penyusunRepoMock.createWithRiwayatOpd).toHaveBeenCalledWith(
      expect.objectContaining({ opdId: 'opd-1', email: 'n@x.id' }),
    );
  });

  it('should_pindah_penyusun_via_repository', async () => {
    penyusunRepoMock.findPenyusunAktifById.mockResolvedValueOnce({
      penggunaId: 'u-move',
      email: 'mv@x.id',
      nip: '88',
      opdId: 'opd-asal',
      peran: PeranPengguna.PENYUSUN,
      nama: 'MV',
      pangkat: 'IV/a',
      jabatan: 'J',
      nohp: '0',
      deletedAt: null,
    } as Pengguna);
    penyusunRepoMock.findOpdById.mockResolvedValueOnce({ opdId: 'opd-tujuan', nama: 'Tujuan' });
    penyusunRepoMock.pindahPenyusun.mockResolvedValueOnce({
      penggunaId: 'u-move',
      opdId: 'opd-tujuan',
      peran: PeranPengguna.PENYUSUN,
      nama: 'MV',
      nip: '88',
      email: 'mv@x.id',
      pangkat: 'IV/a',
      jabatan: 'J',
      nohp: '0',
      deletedAt: null,
    } as Pengguna);
    await service.pindah('u-move', 'opd-tujuan');
    expect(penyusunRepoMock.pindahPenyusun).toHaveBeenCalledWith('u-move', 'opd-asal', 'opd-tujuan');
  });
});

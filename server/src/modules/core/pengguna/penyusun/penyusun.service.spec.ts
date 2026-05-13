import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PeranPengguna, type Pengguna } from '../../../../generated/prisma';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { PenyusunRepository } from './penyusun.repository';
import { PenyusunService } from './penyusun.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('PenyusunService', () => {
  let service: PenyusunService;

  const prismaMock = {
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(prismaMock),
    ),
    pengguna: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    oPD: {
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    riwayatOpdPengguna: {
      create: jest.fn(),
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
  };

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
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(prismaMock),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PenyusunService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PenyusunRepository, useValue: penyusunRepoMock },
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
    prismaMock.pengguna.findFirst.mockResolvedValueOnce({
      penggunaId: 'pj-existing',
      peran: PeranPengguna.PJ_PENYUSUN,
    });
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
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
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
    prismaMock.pengguna.findFirst.mockResolvedValueOnce({
      penggunaId: 'pj-lain',
      peran: PeranPengguna.PJ_PENYUSUN,
    });
    prismaMock.pengguna.count.mockResolvedValue(0);
    await expect(
      service.update('u-promote', { peran: 'PJ_PENYUSUN' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
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
    prismaMock.pengguna.findFirst.mockResolvedValueOnce({
      penggunaId: 'pj-di-tujuan',
      peran: PeranPengguna.PJ_PENYUSUN,
    });
    await expect(service.pindah('pj-move', 'opd-tujuan')).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('should_create_riwayat_dengan_isAktif_true_saat_create_penyusun', async () => {
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
    prismaMock.pengguna.create.mockResolvedValueOnce(createdUser);
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
    expect(prismaMock.riwayatOpdPengguna.create).toHaveBeenCalledWith({
      data: { penggunaId: 'new-u', opdId: 'opd-1', isAktif: true },
    });
  });

  it('should_sinkronkan_isAktif_saat_pindah_penyusun', async () => {
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
    prismaMock.pengguna.findFirstOrThrow.mockResolvedValueOnce({
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
    expect(prismaMock.riwayatOpdPengguna.upsert).toHaveBeenNthCalledWith(1, {
      where: { penggunaId_opdId: { penggunaId: 'u-move', opdId: 'opd-asal' } },
      create: { penggunaId: 'u-move', opdId: 'opd-asal', isAktif: false },
      update: { isAktif: false, updatedAt: expect.any(Date) as Date },
    });
    expect(prismaMock.riwayatOpdPengguna.updateMany).toHaveBeenCalledWith({
      where: { penggunaId: 'u-move' },
      data: { isAktif: false },
    });
    expect(prismaMock.riwayatOpdPengguna.upsert).toHaveBeenNthCalledWith(2, {
      where: { penggunaId_opdId: { penggunaId: 'u-move', opdId: 'opd-tujuan' } },
      create: { penggunaId: 'u-move', opdId: 'opd-tujuan', isAktif: true },
      update: { isAktif: true, updatedAt: expect.any(Date) as Date },
    });
  });
});

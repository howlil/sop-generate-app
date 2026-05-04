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
});

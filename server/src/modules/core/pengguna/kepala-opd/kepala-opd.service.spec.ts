import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PeranPengguna, type Pengguna } from '../../../../generated/prisma';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { PenggunaRepository } from '../pengguna.repository';
import { KepalaOpdRepository, type KepalaOpdWithCounts } from './kepala-opd.repository';
import { KepalaOpdService } from './kepala-opd.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('KepalaOpdService', () => {
  let service: KepalaOpdService;

  const prismaMock = {
    $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(prismaMock)),
    pengguna: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    oPD: {
      findFirst: jest.fn(),
    },
    riwayatOpdPengguna: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const penggunaRepoMock = {
    countAktifByOpdIdAndPeran: jest.fn(),
  };

  const kepalaRepoMock = {
    findOpdAktifById: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'Dinas A' }),
    findKepalaById: jest.fn(),
    findManyKepala: jest.fn().mockResolvedValue([]),
  };

  const baseKepala = (overrides: Partial<KepalaOpdWithCounts> = {}): KepalaOpdWithCounts =>
    ({
      penggunaId: 'kepala-1',
      email: 'k@x.id',
      nip: '1',
      opdId: 'opd-1',
      peran: PeranPengguna.KEPALA_OPD,
      nama: 'Kepala',
      pangkat: 'IV/a',
      jabatan: 'Kepala',
      nohp: '0',
      kataSandi: 'x',
      ttePinHash: null,
      ttePinSetAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      opd: { opdId: 'opd-1', nama: 'Dinas A', deletedAt: null, createdAt: new Date(), updatedAt: new Date() },
      _count: { detailSopDibuat: 0 },
      ...overrides,
    }) as KepalaOpdWithCounts;

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(prismaMock),
    );
    penggunaRepoMock.countAktifByOpdIdAndPeran.mockResolvedValue(0);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KepalaOpdService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: KepalaOpdRepository, useValue: kepalaRepoMock },
        { provide: PenggunaRepository, useValue: penggunaRepoMock },
      ],
    }).compile();
    service = module.get(KepalaOpdService);
  });

  it('should_create_kepala_when_opd_has_no_active_kepala', async () => {
    const created = {
      penggunaId: 'new-kepala',
      email: 'n@x.id',
      nip: '99',
      opdId: 'opd-1',
      peran: PeranPengguna.KEPALA_OPD,
      nama: 'Baru',
      pangkat: 'IV/a',
      jabatan: 'Kepala',
      nohp: '0',
      deletedAt: null,
    } as Pengguna;
    prismaMock.pengguna.create.mockResolvedValueOnce(created);
    kepalaRepoMock.findKepalaById.mockResolvedValueOnce(baseKepala({ penggunaId: 'new-kepala' }));
    const actual = await service.create({
      opdId: 'opd-1',
      nama: 'Baru',
      nip: '99',
      email: 'n@x.id',
      jabatan: 'Kepala',
      pangkat: 'IV/a',
      nohp: '0',
    });
    expect(actual.id).toBe('new-kepala');
    expect(penggunaRepoMock.countAktifByOpdIdAndPeran).toHaveBeenCalledWith(
      'opd-1',
      PeranPengguna.KEPALA_OPD,
    );
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('should_throw_conflict_when_create_but_opd_already_has_kepala', async () => {
    penggunaRepoMock.countAktifByOpdIdAndPeran.mockResolvedValueOnce(1);
    await expect(
      service.create({
        opdId: 'opd-1',
        nama: 'B',
        nip: '2',
        email: 'b@x.id',
        jabatan: 'Kepala',
        pangkat: 'IV/a',
        nohp: '081',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('should_throw_conflict_when_reactivate_but_other_kepala_active', async () => {
    kepalaRepoMock.findKepalaById.mockResolvedValueOnce(
      baseKepala({ penggunaId: 'kepala-nonaktif', deletedAt: new Date() }),
    );
    prismaMock.pengguna.findUnique.mockResolvedValueOnce({
      penggunaId: 'kepala-nonaktif',
      opdId: 'opd-1',
    });
    prismaMock.pengguna.count.mockResolvedValueOnce(1);
    await expect(service.update('kepala-nonaktif', { status: 'AKTIF' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('should_throw_conflict_when_pindah_to_opd_with_existing_kepala', async () => {
    kepalaRepoMock.findKepalaById
      .mockResolvedValueOnce(baseKepala({ penggunaId: 'kepala-move', opdId: 'opd-asal' }))
      .mockResolvedValueOnce(baseKepala({ penggunaId: 'kepala-move', opdId: 'opd-tujuan' }));
    prismaMock.oPD.findFirst.mockResolvedValueOnce({
      opdId: 'opd-tujuan',
      nama: 'Tujuan',
      deletedAt: null,
    });
    prismaMock.pengguna.count.mockResolvedValueOnce(1);
    await expect(
      service.update('kepala-move', { opdId: 'opd-tujuan' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

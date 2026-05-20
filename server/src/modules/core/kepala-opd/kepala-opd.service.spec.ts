import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PeranPengguna, type Pengguna } from '../../../generated/prisma';
import { PenggunaRepository } from '../pengguna/pengguna.repository';
import { KepalaOpdRepository, type KepalaOpdWithCounts } from './kepala-opd.repository';
import { KepalaOpdService } from './kepala-opd.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('KepalaOpdService', () => {
  let service: KepalaOpdService;

  const penggunaRepoMock = {
    countAktifByOpdIdAndPeran: jest.fn(),
    existsEmailOtherThan: jest.fn(),
    existsNipOtherThan: jest.fn(),
  };

  const kepalaRepoMock = {
    findOpdAktifById: jest.fn().mockResolvedValue({ opdId: 'opd-1', nama: 'Dinas A' }),
    findKepalaById: jest.fn(),
    findManyKepala: jest.fn().mockResolvedValue([]),
    createWithRiwayatOpd: jest.fn(),
    persistUpdate: jest.fn(),
    softDeleteKepalaOpd: jest.fn(),
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
    kepalaRepoMock.findKepalaById.mockReset();
    kepalaRepoMock.findOpdAktifById.mockReset();
    kepalaRepoMock.findOpdAktifById.mockResolvedValue({ opdId: 'opd-1', nama: 'Dinas A' });
    penggunaRepoMock.countAktifByOpdIdAndPeran.mockResolvedValue(0);
    penggunaRepoMock.existsEmailOtherThan.mockResolvedValue(false);
    penggunaRepoMock.existsNipOtherThan.mockResolvedValue(false);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KepalaOpdService,
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
    kepalaRepoMock.createWithRiwayatOpd.mockResolvedValueOnce(created);
    kepalaRepoMock.findKepalaById.mockResolvedValueOnce(baseKepala({ penggunaId: 'new-kepala' }));
    const actual = await service.create({
      opdId: 'opd-1',
      nama: 'Baru',
      nip: '99',
      email: 'n@x.id',
      jabatan: 'Kepala',
      pangkat: 'IV/a',
      nohp: '081234567890',
    });
    expect(actual.id).toBe('new-kepala');
    expect(penggunaRepoMock.countAktifByOpdIdAndPeran).toHaveBeenCalledWith(
      'opd-1',
      PeranPengguna.KEPALA_OPD,
      undefined,
    );
    expect(kepalaRepoMock.createWithRiwayatOpd).toHaveBeenCalled();
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
        nohp: '081234567890',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(kepalaRepoMock.createWithRiwayatOpd).not.toHaveBeenCalled();
  });

  it('should_throw_conflict_when_reactivate_but_other_kepala_active', async () => {
    kepalaRepoMock.findKepalaById
      .mockResolvedValueOnce(baseKepala({ penggunaId: 'kepala-nonaktif', deletedAt: new Date() }))
      .mockResolvedValueOnce(baseKepala({ penggunaId: 'kepala-nonaktif', deletedAt: null }));
    penggunaRepoMock.countAktifByOpdIdAndPeran.mockResolvedValueOnce(1);
    await expect(service.update('kepala-nonaktif', { status: 'AKTIF' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(kepalaRepoMock.persistUpdate).not.toHaveBeenCalled();
  });

  it('should_throw_conflict_when_pindah_to_opd_with_existing_kepala', async () => {
    kepalaRepoMock.findKepalaById.mockResolvedValueOnce(
      baseKepala({ penggunaId: 'kepala-move', opdId: 'opd-asal' }),
    );
    kepalaRepoMock.findOpdAktifById.mockResolvedValueOnce({ opdId: 'opd-tujuan', nama: 'Tujuan' });
    penggunaRepoMock.countAktifByOpdIdAndPeran.mockResolvedValueOnce(1);
    await expect(
      service.update('kepala-move', { opdId: 'opd-tujuan' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(kepalaRepoMock.persistUpdate).not.toHaveBeenCalled();
  });

  it('should_throw_bad_request_when_nonaktif_pindah_opd', async () => {
    kepalaRepoMock.findKepalaById.mockResolvedValue(
      baseKepala({ penggunaId: 'kepala-x', deletedAt: new Date() }),
    );
    await expect(service.update('kepala-x', { opdId: 'opd-tujuan' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(kepalaRepoMock.persistUpdate).not.toHaveBeenCalled();
  });

  it('should_throw_conflict_when_remove_but_has_sop', async () => {
    kepalaRepoMock.findKepalaById.mockResolvedValueOnce(
      baseKepala({ _count: { detailSopDibuat: 2 } }),
    );
    await expect(service.remove('kepala-1')).rejects.toBeInstanceOf(ConflictException);
    expect(kepalaRepoMock.softDeleteKepalaOpd).not.toHaveBeenCalled();
  });

  it('should_throw_not_found_when_opd_missing_on_create', async () => {
    kepalaRepoMock.findOpdAktifById.mockResolvedValueOnce(null);
    await expect(
      service.create({
        opdId: 'opd-x',
        nama: 'B',
        nip: '2',
        email: 'b@x.id',
        jabatan: 'Kepala',
        pangkat: 'IV/a',
        nohp: '081234567890',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should_throw_conflict_when_update_email_taken', async () => {
    kepalaRepoMock.findKepalaById.mockResolvedValueOnce(baseKepala());
    penggunaRepoMock.existsEmailOtherThan.mockResolvedValueOnce(true);
    await expect(service.update('kepala-1', { email: 'lain@x.id' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(kepalaRepoMock.persistUpdate).not.toHaveBeenCalled();
  });

  it('should_throw_conflict_when_update_nip_taken', async () => {
    kepalaRepoMock.findKepalaById.mockResolvedValueOnce(baseKepala());
    penggunaRepoMock.existsNipOtherThan.mockResolvedValueOnce(true);
    await expect(service.update('kepala-1', { nip: '999' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(kepalaRepoMock.persistUpdate).not.toHaveBeenCalled();
  });
});

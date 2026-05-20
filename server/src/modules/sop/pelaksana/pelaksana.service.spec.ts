import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PeranPengguna } from '../../../generated/prisma';
import type { JwtAccessPayload } from '../../../common';
import { UserOpdAccessService } from '../../core/opd/user-opd-access.service';
import { PelaksanaRepository } from './pelaksana.repository';
import { PelaksanaService } from './pelaksana.service';

describe('PelaksanaService', () => {
  let service: PelaksanaService;

  const pelaksanaRepoMock = {
    findManyByOpdId: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    findByIdAndOpd: jest.fn(),
    updateNama: jest.fn(),
    countLangkahReferences: jest.fn(),
    countSwimlaneReferences: jest.fn(),
    delete: jest.fn(),
  };

  const userOpdAccessMock = {
    resolveOwnOpdAllowingOptionalQuery: jest.fn().mockResolvedValue('opd-1'),
  };

  const penyusunUser: JwtAccessPayload = {
    sub: 'u1',
    email: 'p@x.id',
    peran: PeranPengguna.PENYUSUN,
  };

  const baseRow = {
    pelaksanaId: 'pl-1',
    opdId: 'opd-1',
    nama: 'Staf A',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PelaksanaService(
      pelaksanaRepoMock as unknown as PelaksanaRepository,
      userOpdAccessMock as unknown as UserOpdAccessService,
    );
    userOpdAccessMock.resolveOwnOpdAllowingOptionalQuery.mockResolvedValue('opd-1');
  });

  it('should_forbid_create_when_opd_query_mismatch', async () => {
    userOpdAccessMock.resolveOwnOpdAllowingOptionalQuery.mockRejectedValueOnce(
      new ForbiddenException('Akses OPD ditolak'),
    );
    await expect(
      service.create(penyusunUser, { opdId: 'opd-lain', namaPelaksana: 'X' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(pelaksanaRepoMock.create).not.toHaveBeenCalled();
  });

  it('should_create_pelaksana_for_resolved_opd', async () => {
    pelaksanaRepoMock.create.mockResolvedValueOnce(baseRow);
    const actual = await service.create(penyusunUser, {
      opdId: 'opd-1',
      namaPelaksana: 'Staf A',
    });
    expect(actual.id).toBe('pl-1');
    expect(pelaksanaRepoMock.create).toHaveBeenCalledWith('opd-1', 'Staf A');
  });

  it('should_throw_not_found_when_update_pelaksana_outside_opd', async () => {
    pelaksanaRepoMock.findByIdAndOpd.mockResolvedValueOnce(null);
    await expect(
      service.update(penyusunUser, 'pl-x', { namaPelaksana: 'Baru' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(pelaksanaRepoMock.updateNama).not.toHaveBeenCalled();
  });

  it('should_update_nama_when_pelaksana_in_opd', async () => {
    pelaksanaRepoMock.findByIdAndOpd.mockResolvedValueOnce(baseRow);
    pelaksanaRepoMock.updateNama.mockResolvedValueOnce({ ...baseRow, nama: 'Staf B' });
    const actual = await service.update(penyusunUser, 'pl-1', { namaPelaksana: 'Staf B' });
    expect(actual.namaPelaksana).toBe('Staf B');
  });

  it('should_throw_conflict_when_remove_but_still_referenced', async () => {
    pelaksanaRepoMock.findByIdAndOpd.mockResolvedValueOnce(baseRow);
    pelaksanaRepoMock.countLangkahReferences.mockResolvedValueOnce(1);
    pelaksanaRepoMock.countSwimlaneReferences.mockResolvedValueOnce(0);
    await expect(service.remove(penyusunUser, 'pl-1')).rejects.toBeInstanceOf(ConflictException);
    expect(pelaksanaRepoMock.delete).not.toHaveBeenCalled();
  });
});

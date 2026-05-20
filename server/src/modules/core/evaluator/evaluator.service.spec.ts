import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  BCRYPT_SALT_ROUNDS,
  DEFAULT_PENGGUNA_PASSWORD,
} from '../../../common/auth/password.constants';
import { PeranPengguna, type Pengguna } from '../../../generated/prisma';
import { PenggunaRepository } from '../pengguna/pengguna.repository';
import { EvaluatorService } from './evaluator.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-default-password'),
}));

describe('EvaluatorService', () => {
  let service: EvaluatorService;
  let repository: jest.Mocked<
    Pick<
      PenggunaRepository,
      | 'findPjEvaluatorOrganisasiOpdId'
      | 'findPjEvaluatorOrganisasiOpd'
      | 'findEvaluatorsByOpd'
      | 'findEvaluatorByIdInOpd'
      | 'findEvaluatorAktifById'
      | 'createPengguna'
      | 'updateEvaluator'
      | 'softDeleteEvaluator'
    >
  >;

  const baseRow: Pengguna = {
    penggunaId: 'u-1',
    email: 'a@b.c',
    opdId: 'opd-biro',
    nama: 'Test',
    kataSandi: 'x',
    peran: PeranPengguna.EVALUATOR,
    nip: '1',
    jabatan: 'J',
    pangkat: 'P',
    nohp: '0',
    ttePinHash: null,
    ttePinSetAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      findPjEvaluatorOrganisasiOpdId: jest.fn().mockResolvedValue('opd-biro'),
      findPjEvaluatorOrganisasiOpd: jest.fn().mockResolvedValue({ opdId: 'opd-biro', nama: 'Biro' }),
      findEvaluatorsByOpd: jest.fn().mockResolvedValue([baseRow]),
      findEvaluatorByIdInOpd: jest.fn().mockResolvedValue(baseRow),
      findEvaluatorAktifById: jest.fn().mockResolvedValue(baseRow),
      createPengguna: jest.fn().mockImplementation(async (data) => ({
        ...baseRow,
        email: String(data.email),
        nama: String(data.nama),
        penggunaId: 'new-id',
      })),
      updateEvaluator: jest.fn().mockResolvedValue(baseRow),
      softDeleteEvaluator: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluatorService, { provide: PenggunaRepository, useValue: repository }],
    }).compile();

    service = module.get(EvaluatorService);
  });

  it('should_hash_default_password_on_create', async () => {
    (bcrypt.hash as jest.Mock).mockClear();
    await service.createAnggota({
      email: 'e@test.com',
      nama: 'N',
      nip: 'nip1',
      jabatan: 'Jab',
      pangkat: 'P',
      nohp: '08',
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(DEFAULT_PENGGUNA_PASSWORD, BCRYPT_SALT_ROUNDS);
    expect(repository.createPengguna).toHaveBeenCalled();
  });

  it('should_return_grup_from_listGrup', async () => {
    const grup = await service.listGrup();
    expect(grup).toHaveLength(1);
    expect(grup[0].opdId).toBe('opd-biro');
    expect(grup[0].namaOpd).toBe('Biro');
    expect(grup[0].evaluator).toHaveLength(1);
    expect(repository.findEvaluatorsByOpd).toHaveBeenCalledWith('opd-biro', undefined);
  });

  it('should_pass_search_to_findEvaluatorsByOpd', async () => {
    await service.listGrup('  teguh  ');
    expect(repository.findEvaluatorsByOpd).toHaveBeenCalledWith('opd-biro', '  teguh  ');
  });

  it('should_throw_service_unavailable_on_listGrup_when_no_pj', async () => {
    repository.findPjEvaluatorOrganisasiOpd.mockResolvedValueOnce(null);
    await expect(service.listGrup()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('should_throw_service_unavailable_when_biro_not_configured_on_create', async () => {
    repository.findPjEvaluatorOrganisasiOpdId.mockResolvedValueOnce(null);
    await expect(
      service.createAnggota({
        email: 'e@test.com',
        nama: 'N',
        nip: 'nip1',
        jabatan: 'Jab',
        pangkat: 'P',
        nohp: '08',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(repository.createPengguna).not.toHaveBeenCalled();
  });

  it('should_assign_evaluator_to_biro_opd_on_create', async () => {
    await service.createAnggota({
      email: 'e@test.com',
      nama: 'N',
      nip: 'nip1',
      jabatan: 'Jab',
      pangkat: 'P',
      nohp: '08',
    });
    expect(repository.createPengguna).toHaveBeenCalledWith(
      expect.objectContaining({
        opd: { connect: { opdId: 'opd-biro' } },
        peran: PeranPengguna.EVALUATOR,
      }),
    );
  });

  it('should_throw_not_found_when_update_evaluator_outside_biro', async () => {
    repository.findEvaluatorByIdInOpd.mockResolvedValueOnce(null);
    await expect(service.updateAnggota('u-unknown', { nama: 'X' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

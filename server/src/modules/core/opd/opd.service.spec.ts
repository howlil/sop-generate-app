import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OpdRepository } from './opd.repository';
import { OpdService } from './opd.service';

describe('Pengujian OpdService', () => {
  let service: OpdService;
  let opdRepository: jest.Mocked<
    Pick<
      OpdRepository,
      | 'findOpdIdByPenggunaId'
      | 'findManyRingkasAktif'
      | 'findRingkasAktifById'
      | 'findAktifById'
      | 'create'
      | 'update'
      | 'softDelete'
      | 'summarizeBlockingRelations'
      | 'countPenggunaStrukturalAktifByOpdId'
    >
  >;

  beforeEach(async () => {
    opdRepository = {
      findOpdIdByPenggunaId: jest.fn(),
      findManyRingkasAktif: jest.fn(),
      findRingkasAktifById: jest.fn(),
      findAktifById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      summarizeBlockingRelations: jest.fn(),
      countPenggunaStrukturalAktifByOpdId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpdService,
        {
          provide: OpdRepository,
          useValue: opdRepository,
        },
      ],
    }).compile();

    service = module.get(OpdService);
  });

  it('seharusnya melempar ConflictException ketika soft delete dan OPD masih memiliki baris terkait', async () => {
    const now = new Date();
    opdRepository.findAktifById.mockResolvedValue({
      opdId: 'opd-a',
      nama: 'OPD A',
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    opdRepository.countPenggunaStrukturalAktifByOpdId.mockResolvedValue(0);
    opdRepository.summarizeBlockingRelations.mockResolvedValue({
      pengguna: 1,
      sop: 0,
      pengajuanEvaluasi: 0,
      pelaksana: 0,
      riwayatOpdPengguna: 0,
      opdPeraturan: 0,
    });

    await expect(service.softDelete('opd-a')).rejects.toBeInstanceOf(ConflictException);
    expect(opdRepository.softDelete).not.toHaveBeenCalled();
  });

  it('seharusnya melempar ConflictException ketika soft delete dan pengguna struktural masih ada', async () => {
    const now = new Date();
    opdRepository.findAktifById.mockResolvedValue({
      opdId: 'opd-b',
      nama: 'OPD B',
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    opdRepository.countPenggunaStrukturalAktifByOpdId.mockResolvedValue(1);

    await expect(service.softDelete('opd-b')).rejects.toBeInstanceOf(ConflictException);
    expect(opdRepository.summarizeBlockingRelations).not.toHaveBeenCalled();
    expect(opdRepository.softDelete).not.toHaveBeenCalled();
  });
});

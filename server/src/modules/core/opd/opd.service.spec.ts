import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OpdRepository } from './opd.repository';
import { OpdService } from './opd.service';

describe('OpdService', () => {
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
      | 'findEvaluasiRingkas'
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
      findEvaluasiRingkas: jest.fn(),
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

  it('should_throw_conflict_when_soft_delete_and_opd_has_related_rows', async () => {
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

  it('should_throw_conflict_when_soft_delete_and_struktural_pengguna_exists', async () => {
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

  it('should_map_evaluasi_ringkas_rows_to_response_dto', async () => {
    opdRepository.findEvaluasiRingkas.mockResolvedValue([
      {
        opdId: '11111111-1111-1111-1111-111111111111',
        nama: 'Dinas Contoh',
        jumlahSop: 3,
        jumlahSopBaru: 1,
      },
    ]);
    const actual = await service.listEvaluasiRingkas('Contoh');
    expect(opdRepository.findEvaluasiRingkas).toHaveBeenCalledWith('Contoh');
    expect(actual).toEqual([
      {
        id: '11111111-1111-1111-1111-111111111111',
        nama: 'Dinas Contoh',
        jumlahSop: 3,
        jumlahSopBaru: 1,
      },
    ]);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { OpdService } from './opd.service';
import { OpdRepository } from '../repository/opd.repository';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PeranPengguna } from '../../../generated/prisma';
import { OpdMessages } from '../../../common/messages';

describe('OpdService', () => {
  let service: OpdService;
  let mockRepository: jest.Mocked<OpdRepository>;

  const mockUser: any = {
    id: 'user-1',
    peran: PeranPengguna.BIRO_ORGANISASI,
    opdId: null,
  };

  const mockOpd = {
    id: 'opd-1',
    nama: 'Test OPD',
    totalSOP: 5,
    sopBerlaku: 3,
    sopDraft: 1,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      hasActivePengajuanEvaluasi: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpdService,
        { provide: OpdRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<OpdService>(OpdService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all OPDs for BIRO_ORGANISASI', async () => {
      mockRepository.findAll.mockResolvedValue([mockOpd]);

      const result = await service.findAll(mockUser);

      expect(result).toEqual([mockOpd]);
      expect(mockRepository.findAll).toHaveBeenCalledWith();
    });

    it('should filter OPDs for non-BIRO roles', async () => {
      const penyusunUser: any = { ...mockUser, peran: PeranPengguna.TIM_PENYUSUN, opdId: 'opd-1' };
      mockRepository.findAll.mockResolvedValue([
        mockOpd,
        { ...mockOpd, id: 'opd-2', nama: 'Other OPD' },
      ]);

      const result = await service.findAll(penyusunUser);

      expect(result).toEqual([mockOpd]);
      expect(result.length).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return OPD by ID for BIRO_ORGANISASI', async () => {
      mockRepository.findById.mockResolvedValue(mockOpd);

      const result = await service.findById('opd-1', mockUser);

      expect(result).toEqual(mockOpd);
      expect(mockRepository.findById).toHaveBeenCalledWith('opd-1');
    });

    it('should allow TIM_EVALUASI to view any OPD', async () => {
      const evaluasiUser: any = { ...mockUser, peran: PeranPengguna.TIM_EVALUASI };
      mockRepository.findById.mockResolvedValue(mockOpd);

      const result = await service.findById('opd-1', evaluasiUser);

      expect(result).toEqual(mockOpd);
    });

    it('should allow TIM_PENYUSUN to view only their own OPD', async () => {
      const penyusunUser: any = { ...mockUser, peran: PeranPengguna.TIM_PENYUSUN, opdId: 'opd-1' };
      mockRepository.findById.mockResolvedValue(mockOpd);

      const result = await service.findById('opd-1', penyusunUser);

      expect(result).toEqual(mockOpd);
    });

    it('should throw ForbiddenException for viewing other OPD', async () => {
      const penyusunUser: any = { ...mockUser, peran: PeranPengguna.TIM_PENYUSUN, opdId: 'opd-1' };
      const otherOpd = { ...mockOpd, id: 'opd-2' };
      mockRepository.findById.mockResolvedValue(otherOpd);

      await expect(service.findById('opd-2', penyusunUser))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent OPD', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent', mockUser))
        .rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent', mockUser))
        .rejects.toThrow(OpdMessages.OPD_NOT_FOUND);
    });
  });

  describe('create', () => {
    const createDto = {
      nama: 'New OPD',
    };

    it('should create OPD successfully', async () => {
      mockRepository.create.mockResolvedValue({ ...mockOpd, nama: 'New OPD' });

      const result = await service.create(createDto);

      expect(result.nama).toBe('New OPD');
      expect(mockRepository.create).toHaveBeenCalledWith({ nama: 'New OPD' });
    });
  });

  describe('update', () => {
    const updateDto = {
      nama: 'Updated OPD',
    };

    it('should update OPD successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockOpd);
      mockRepository.update.mockResolvedValue({ ...mockOpd, nama: 'Updated OPD' });

      const result = await service.update('opd-1', updateDto);

      expect(result.nama).toBe('Updated OPD');
      expect(mockRepository.update).toHaveBeenCalledWith('opd-1', { nama: 'Updated OPD' });
    });

    it('should throw NotFoundException for non-existent OPD', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto))
        .rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', updateDto))
        .rejects.toThrow(OpdMessages.OPD_NOT_FOUND);
    });
  });

  describe('softDelete', () => {
    it('should delete OPD successfully if no active evaluations', async () => {
      mockRepository.findById.mockResolvedValue(mockOpd);
      mockRepository.hasActivePengajuanEvaluasi.mockResolvedValue(false);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await expect(service.softDelete('opd-1')).resolves.toBeUndefined();

      expect(mockRepository.hasActivePengajuanEvaluasi).toHaveBeenCalledWith('opd-1');
      expect(mockRepository.softDelete).toHaveBeenCalledWith('opd-1');
    });

    it('should throw ConflictException if OPD has active evaluations', async () => {
      mockRepository.findById.mockResolvedValue(mockOpd);
      mockRepository.hasActivePengajuanEvaluasi.mockResolvedValue(true);

      await expect(service.softDelete('opd-1'))
        .rejects.toThrow(ConflictException);
      await expect(service.softDelete('opd-1'))
        .rejects.toThrow(OpdMessages.OPD_HAS_ACTIVE_EVALUATION);

      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent OPD', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.softDelete('non-existent'))
        .rejects.toThrow(NotFoundException);
      await expect(service.softDelete('non-existent'))
        .rejects.toThrow(OpdMessages.OPD_NOT_FOUND);
    });
  });
});

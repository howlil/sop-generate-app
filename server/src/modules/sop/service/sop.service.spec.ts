import { Test, TestingModule } from '@nestjs/testing';
import { SopService } from './sop.service';
import { SopRepository } from '../repository/sop.repository';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PeranPengguna } from '../../../generated/prisma';
import { SopMessages } from '../../../common/messages';

describe('SopService', () => {
  let service: SopService;
  let repository: Partial<Record<keyof SopRepository, jest.Mock>>;

  const mockUser: any = {
    id: 'user-1',
    peran: PeranPengguna.TIM_PENYUSUN,
    opdId: 'opd-1',
  };

  const mockSop = {
    id: 'sop-1',
    judul: 'SOP Test',
    opdId: 'opd-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasSignaturesOrEvaluations: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SopService,
        { provide: SopRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<SopService>(SopService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return SOPs filtered by OPD for TIM_PENYUSUN', async () => {
      repository.findAll.mockResolvedValue([mockSop]);

      const result = await service.findAll(mockUser);

      expect(result).toEqual([mockSop]);
      expect(repository.findAll).toHaveBeenCalledWith({ opdId: 'opd-1' });
    });

    it('should return all SOPs for BIRO_ORGANISASI', async () => {
      const biroUser: any = { ...mockUser, peran: PeranPengguna.BIRO_ORGANISASI, opdId: null };
      repository.findAll.mockResolvedValue([mockSop]);

      await service.findAll(biroUser);

      expect(repository.findAll).toHaveBeenCalledWith({});
    });

    it('should return SOPs filtered by status', async () => {
      repository.findAll.mockResolvedValue([mockSop]);

      await service.findAll(mockUser, undefined, 'DRAFT');

      expect(repository.findAll).toHaveBeenCalledWith({
        opdId: 'opd-1',
        status: 'DRAFT',
      });
    });

    it('should filter by OPD for TIM_EVALUASI with optional status', async () => {
      const evaluasiUser: any = { ...mockUser, peran: PeranPengguna.TIM_EVALUASI, opdId: null };
      repository.findAll.mockResolvedValue([mockSop]);

      await service.findAll(evaluasiUser, 'opd-2', 'DRAFT');

      expect(repository.findAll).toHaveBeenCalledWith({
        status: 'DRAFT',
        opdId: 'opd-2',
      });
    });
  });

  describe('findById', () => {
    it('should return SOP by ID', async () => {
      repository.findById.mockResolvedValue(mockSop);

      const result = await service.findById('sop-1', mockUser);

      expect(result).toEqual(mockSop);
      expect(repository.findById).toHaveBeenCalledWith('sop-1');
    });

    it('should throw NotFoundException for non-existent SOP', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent', mockUser))
        .rejects.toThrow(NotFoundException);
      
      await expect(service.findById('non-existent', mockUser))
        .rejects.toThrow(SopMessages.SOP_NOT_FOUND);
    });

    it('should allow BIRO_ORGANISASI to view any SOP', async () => {
      const biroUser: any = { ...mockUser, peran: PeranPengguna.BIRO_ORGANISASI, opdId: null };
      const sopOtherOpd = { ...mockSop, opdId: 'opd-other' };
      repository.findById.mockResolvedValue(sopOtherOpd);

      const result = await service.findById('sop-1', biroUser);

      expect(result).toEqual(sopOtherOpd);
    });

    it('should allow TIM_EVALUASI to view any SOP', async () => {
      const evaluasiUser: any = { ...mockUser, peran: PeranPengguna.TIM_EVALUASI, opdId: null };
      const sopOtherOpd = { ...mockSop, opdId: 'opd-other' };
      repository.findById.mockResolvedValue(sopOtherOpd);

      const result = await service.findById('sop-1', evaluasiUser);

      expect(result).toEqual(sopOtherOpd);
    });

    it('should throw ForbiddenException for viewing SOP from different OPD', async () => {
      const sopOtherOpd = { ...mockSop, opdId: 'opd-other' };
      repository.findById.mockResolvedValue(sopOtherOpd);

      await expect(service.findById('sop-1', mockUser))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    const createDto: any = {
      judul: 'SOP Baru',
      opdId: 'opd-1',
      logoInstansi: 'https://example.com/logo.png',
      namaLembaga: 'Test Institution',
    };

    it('should create SOP successfully', async () => {
      const createdSop = { id: 'sop-new', ...createDto };
      repository.create.mockResolvedValue(createdSop);

      const result = await service.create(createDto, mockUser);

      expect(result).toEqual(createdSop);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        dibuatOlehId: 'user-1',
      });
    });

    it('should pass logoInstansi and namaLembaga to repository', async () => {
      repository.create.mockResolvedValue({ id: 'sop-new', ...createDto });

      await service.create(createDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          logoInstansi: 'https://example.com/logo.png',
          namaLembaga: 'Test Institution',
        }),
      );
    });
  });

  describe('update', () => {
    it('should update SOP judul successfully', async () => {
      repository.findById.mockResolvedValue(mockSop);
      const updatedSop = { ...mockSop, judul: 'SOP Updated' };
      repository.update.mockResolvedValue(updatedSop);

      const result = await service.update('sop-1', 'SOP Updated');

      expect(result).toEqual(updatedSop);
      expect(repository.update).toHaveBeenCalledWith('sop-1', { judul: 'SOP Updated' });
    });

    it('should throw NotFoundException for non-existent SOP', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', 'New Title'))
        .rejects.toThrow(NotFoundException);
      
      await expect(service.update('non-existent', 'New Title'))
        .rejects.toThrow(SopMessages.SOP_NOT_FOUND);
    });
  });

  describe('delete', () => {
    it('should delete SOP successfully if no signatures or evaluations', async () => {
      repository.findById.mockResolvedValue(mockSop);
      repository.hasSignaturesOrEvaluations.mockResolvedValue(false);
      repository.delete.mockResolvedValue(undefined);

      await expect(service.delete('sop-1')).resolves.toBeUndefined();

      expect(repository.hasSignaturesOrEvaluations).toHaveBeenCalledWith('sop-1');
      expect(repository.delete).toHaveBeenCalledWith('sop-1');
    });

    it('should throw ConflictException if SOP has signatures or evaluations', async () => {
      repository.findById.mockResolvedValue(mockSop);
      repository.hasSignaturesOrEvaluations.mockResolvedValue(true);

      await expect(service.delete('sop-1'))
        .rejects.toThrow(ConflictException);
      
      await expect(service.delete('sop-1'))
        .rejects.toThrow(SopMessages.SOP_HAS_EVALUATION);

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent SOP', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent'))
        .rejects.toThrow(NotFoundException);
      
      await expect(service.delete('non-existent'))
        .rejects.toThrow(SopMessages.SOP_NOT_FOUND);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SopService } from './sop.service';
import { SopRepository } from '../repository/sop.repository';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PeranPengguna, StatusSOP } from '../../../generated/prisma';
import { SopMessages, GenericMessages } from '../../../common/messages';

describe('SopService', () => {
  let service: SopService;
  let mockRepository: jest.Mocked<SopRepository>;

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
    _count: { detailSops: 1 },
    detailSops: [{ id: 'detail-1', status: StatusSOP.DRAFT, versi: 1, nomorSOP: 'SOP/TEST/2026/001' }],
  };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasSignaturesOrEvaluations: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SopService,
        { provide: SopRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<SopService>(SopService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return SOPs filtered by OPD for TIM_PENYUSUN', async () => {
      mockRepository.findAll.mockResolvedValue([mockSop]);

      const result = await service.findAll(mockUser);

      expect(result).toEqual([mockSop]);
      expect(mockRepository.findAll).toHaveBeenCalledWith({ opdId: 'opd-1' });
    });

    it('should return all SOPs for BIRO_ORGANISASI', async () => {
      const biroUser: any = { ...mockUser, peran: PeranPengguna.BIRO_ORGANISASI, opdId: null };
      mockRepository.findAll.mockResolvedValue([mockSop]);

      await service.findAll(biroUser);

      expect(mockRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should return SOPs filtered by status', async () => {
      mockRepository.findAll.mockResolvedValue([mockSop]);

      await service.findAll(mockUser, undefined, 'DRAFT');

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        opdId: 'opd-1',
        status: 'DRAFT',
      });
    });

    it('should filter by OPD for TIM_EVALUASI with optional status', async () => {
      const evaluasiUser: any = { ...mockUser, peran: PeranPengguna.TIM_EVALUASI, opdId: null };
      mockRepository.findAll.mockResolvedValue([mockSop]);

      await service.findAll(evaluasiUser, 'opd-2', 'DRAFT');

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        status: 'DRAFT',
        opdId: 'opd-2',
      });
    });
  });

  describe('findById', () => {
    it('should return SOP by ID', async () => {
      mockRepository.findById.mockResolvedValue(mockSop);

      const result = await service.findById('sop-1', mockUser);

      expect(result).toEqual(mockSop);
      expect(mockRepository.findById).toHaveBeenCalledWith('sop-1');
    });

    it('should throw NotFoundException for non-existent SOP', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent', mockUser))
        .rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent', mockUser))
        .rejects.toThrow(SopMessages.SOP_NOT_FOUND);
    });

    it('should allow BIRO_ORGANISASI to view any SOP', async () => {
      const biroUser: any = { ...mockUser, peran: PeranPengguna.BIRO_ORGANISASI, opdId: null };
      const sopOtherOpd = { ...mockSop, opdId: 'opd-other' };
      mockRepository.findById.mockResolvedValue(sopOtherOpd);

      const result = await service.findById('sop-1', biroUser);

      expect(result).toEqual(sopOtherOpd);
    });

    it('should allow TIM_EVALUASI to view any SOP', async () => {
      const evaluasiUser: any = { ...mockUser, peran: PeranPengguna.TIM_EVALUASI, opdId: null };
      const sopOtherOpd = { ...mockSop, opdId: 'opd-other' };
      mockRepository.findById.mockResolvedValue(sopOtherOpd);

      const result = await service.findById('sop-1', evaluasiUser);

      expect(result).toEqual(sopOtherOpd);
    });

    it('should throw ForbiddenException for viewing SOP from different OPD', async () => {
      const sopOtherOpd = { ...mockSop, opdId: 'opd-other' };
      mockRepository.findById.mockResolvedValue(sopOtherOpd);

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
      const createdSop = { id: 'sop-new', ...createDto, createdAt: new Date(), updatedAt: new Date() };
      mockRepository.create.mockResolvedValue(createdSop);

      const result = await service.create(createDto, mockUser);

      expect(result).toEqual(createdSop);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        dibuatOlehId: 'user-1',
      });
    });

    it('should pass logoInstansi and namaLembaga to repository', async () => {
      const createdSop = { id: 'sop-new', ...createDto, createdAt: new Date(), updatedAt: new Date() };
      mockRepository.create.mockResolvedValue(createdSop);

      await service.create(createDto, mockUser);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          logoInstansi: 'https://example.com/logo.png',
          namaLembaga: 'Test Institution',
        }),
      );
    });
  });

  describe('update', () => {
    it('should update SOP judul successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockSop);
      const updatedSop = { ...mockSop, judul: 'SOP Updated' };
      mockRepository.update.mockResolvedValue(updatedSop);

      const result = await service.update('sop-1', 'SOP Updated');

      expect(result).toEqual(updatedSop);
      expect(mockRepository.update).toHaveBeenCalledWith('sop-1', { judul: 'SOP Updated' });
    });

    it('should throw NotFoundException for non-existent SOP', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', 'New Title'))
        .rejects.toThrow(NotFoundException);
      await expect(service.update('non-existent', 'New Title'))
        .rejects.toThrow(SopMessages.SOP_NOT_FOUND);
    });
  });

  describe('delete', () => {
    it('should delete SOP successfully if no signatures or evaluations', async () => {
      mockRepository.findById.mockResolvedValue(mockSop);
      mockRepository.hasSignaturesOrEvaluations.mockResolvedValue(false);
      mockRepository.delete.mockResolvedValue(undefined);

      await expect(service.delete('sop-1')).resolves.toBeUndefined();

      expect(mockRepository.hasSignaturesOrEvaluations).toHaveBeenCalledWith('sop-1');
      expect(mockRepository.delete).toHaveBeenCalledWith('sop-1');
    });

    it('should throw ConflictException if SOP has signatures or evaluations', async () => {
      mockRepository.findById.mockResolvedValue(mockSop);
      mockRepository.hasSignaturesOrEvaluations.mockResolvedValue(true);

      await expect(service.delete('sop-1'))
        .rejects.toThrow(ConflictException);
      await expect(service.delete('sop-1'))
        .rejects.toThrow(SopMessages.SOP_HAS_EVALUATION);

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent SOP', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent'))
        .rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent'))
        .rejects.toThrow(SopMessages.SOP_NOT_FOUND);
    });
  });
});

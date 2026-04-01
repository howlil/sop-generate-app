import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../service/user.service';
import { UserRepository } from '../repository/user.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PeranPengguna } from '../../../generated/prisma';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepository = {
  findByEmailWithPassword: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  findActiveRoleInOpd: jest.fn(),
  hasActiveMembership: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        nama: 'Test User',
        kataSandi: 'password123',
        peran: PeranPengguna.TIM_PENYUSUN,
        opdId: 'opd-1',
        nip: '199001012020011001',
        jabatan: 'Kepala Subbagian',
        pangkat: 'Penata Muda',
        nohp: '08123456789',
      };

      mockUserRepository.findByEmailWithPassword.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(repository.findByEmailWithPassword).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        nama: 'Test User',
        kataSandi: 'password123',
        peran: PeranPengguna.TIM_PENYUSUN,
        opdId: 'opd-1',
        nip: '199001012020011001',
        jabatan: 'Kepala Subbagian',
        pangkat: 'Penata Muda',
        nohp: '08123456789',
      };

      mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('should return a user', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(result).toEqual(mockUser);
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockUserRepository.findAll.mockResolvedValue([mockUser]);
      mockUserRepository.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});

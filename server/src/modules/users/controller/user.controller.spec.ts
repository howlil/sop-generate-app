import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../controller/user.controller';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PeranPengguna } from '../../../generated/prisma';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  nama: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
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

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        nama: mockUser.nama,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockUserService.findAll.mockResolvedValue({
        data: [mockUser],
        total: 1,
      });

      const result = await controller.findAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });
});

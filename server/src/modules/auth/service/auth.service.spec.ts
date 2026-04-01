import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRepository } from '../../users/repository/user.repository';
import { AuthMessages } from '../../../common/messages';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: Partial<ConfigService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    nama: 'Test User',
    peran: 'TIM_PENYUSUN',
    opdId: 'opd-1',
    nip: 'NIP123',
    jabatan: 'Staff',
    pangkat: 'Penata Muda',
    nohp: '081234567890',
    kataSandi: 'hashedpassword',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUserRepository = {
      findByEmailWithPassword: jest.fn(),
      findByIdWithPassword: jest.fn(),
      update: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findActiveRoleInOpd: jest.fn(),
      hasActiveMembership: jest.fn(),
    } as any;

    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      kataSandi: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithPassword = { ...mockUser, kataSandi: hashedPassword };
      
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(userWithPassword);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockConfigService.get = jest.fn().mockReturnValue('1d');

      const result = await authService.login(loginDto);

      expect(result).toMatchObject({
        accessToken: 'mock-jwt-token',
        tokenType: 'Bearer',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          nama: 'Test User',
          peran: 'TIM_PENYUSUN',
          opdId: 'opd-1',
        },
      });
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith('test@example.com');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          email: 'test@example.com',
        }),
        expect.any(Object),
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(authService.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto))
        .rejects.toThrow(AuthMessages.INVALID_EMAIL_OR_PASSWORD);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const wrongHashedPassword = await bcrypt.hash('wrongpassword', 10);
      const userWithWrongPassword = { ...mockUser, kataSandi: wrongHashedPassword };
      
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(userWithWrongPassword);

      await expect(authService.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto))
        .rejects.toThrow(AuthMessages.INVALID_EMAIL_OR_PASSWORD);
    });

    it('should throw UnauthorizedException for deleted user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithDeleted = { ...mockUser, kataSandi: hashedPassword, deletedAt: new Date() };
      
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(userWithDeleted);

      await expect(authService.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto))
        .rejects.toThrow(AuthMessages.ACCOUNT_DEACTIVATED);
    });
  });

  describe('changePassword', () => {
    const userId = 'user-1';
    const changePasswordDto = {
      kataSandiLama: 'oldpassword123',
      kataSandiBaru: 'newpassword123',
    };

    it('should change password successfully', async () => {
      const hashedOldPassword = await bcrypt.hash('oldpassword123', 10);
      const userWithPassword = { ...mockUser, kataSandi: hashedOldPassword };
      
      mockUserRepository.findByIdWithPassword.mockResolvedValue(userWithPassword);
      mockUserRepository.update.mockResolvedValue(mockUser as any);

      await expect(authService.changePassword(userId, changePasswordDto))
        .resolves.toBeUndefined();

      expect(mockUserRepository.findByIdWithPassword).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          kataSandi: expect.any(String),
        }),
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserRepository.findByIdWithPassword.mockResolvedValue(null);

      await expect(authService.changePassword(userId, changePasswordDto))
        .rejects.toThrow(UnauthorizedException);
      await expect(authService.changePassword(userId, changePasswordDto))
        .rejects.toThrow(AuthMessages.USER_NOT_FOUND);
    });

    it('should throw UnauthorizedException for wrong old password', async () => {
      const hashedWrongPassword = await bcrypt.hash('wrongpassword', 10);
      const userWithWrongPassword = { ...mockUser, kataSandi: hashedWrongPassword };
      
      mockUserRepository.findByIdWithPassword.mockResolvedValue(userWithWrongPassword);

      await expect(authService.changePassword(userId, changePasswordDto))
        .rejects.toThrow(UnauthorizedException);
      await expect(authService.changePassword(userId, changePasswordDto))
        .rejects.toThrow(AuthMessages.INVALID_OLD_PASSWORD);
    });

    it('should hash new password before saving', async () => {
      const hashedOldPassword = await bcrypt.hash('oldpassword123', 10);
      const userWithPassword = { ...mockUser, kataSandi: hashedOldPassword };
      
      mockUserRepository.findByIdWithPassword.mockResolvedValue(userWithPassword);
      mockUserRepository.update.mockResolvedValue(mockUser as any);

      await authService.changePassword(userId, changePasswordDto);

      const updateCall = mockUserRepository.update.mock.calls[0];
      const updatedData = updateCall[1] as any;
      
      expect(updatedData.kataSandi).toBeDefined();
      const isValidNewPassword = await bcrypt.compare('newpassword123', updatedData.kataSandi);
      expect(isValidNewPassword).toBe(true);
    });
  });
});

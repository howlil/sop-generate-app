import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UserRepository } from '../../src/modules/users/repository/user.repository';
import { AuthMessages } from '../../src/common/messages';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Partial<Record<keyof UserRepository, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  let configService: Partial<Record<keyof ConfigService, jest.Mock>>;

  beforeEach(async () => {
    userRepository = {
      findByEmailWithPassword: jest.fn(),
      findByIdWithPassword: jest.fn(),
      update: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    configService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
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

    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      nama: 'Test User',
      peran: 'TIM_PENYUSUN',
      opdId: 'opd-1',
      nip: 'NIP123',
      jabatan: 'Staff',
      kataSandi: '', // Will be hashed
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithPassword = { ...mockUser, kataSandi: hashedPassword };
      
      userRepository.findByEmailWithPassword.mockResolvedValue(userWithPassword);
      jwtService.sign.mockReturnValue('mock-jwt-token');
      configService.get.mockReturnValue('1d');

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
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(authService.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
      
      await expect(authService.login(loginDto))
        .rejects.toThrow(AuthMessages.INVALID_EMAIL_OR_PASSWORD);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const wrongHashedPassword = await bcrypt.hash('wrongpassword', 10);
      const userWithWrongPassword = { ...mockUser, kataSandi: wrongHashedPassword };
      
      userRepository.findByEmailWithPassword.mockResolvedValue(userWithWrongPassword);

      await expect(authService.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
      
      await expect(authService.login(loginDto))
        .rejects.toThrow(AuthMessages.INVALID_EMAIL_OR_PASSWORD);
    });

    it('should throw UnauthorizedException for deleted user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithDeleted = { ...mockUser, kataSandi: hashedPassword, deletedAt: new Date() };
      
      userRepository.findByEmailWithPassword.mockResolvedValue(userWithDeleted);

      await expect(authService.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
      
      await expect(authService.login(loginDto))
        .rejects.toThrow(AuthMessages.ACCOUNT_DEACTIVATED);
    });

    it('should use JWT_EXPIRATION from config', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userRepository.findByEmailWithPassword.mockResolvedValue({ ...mockUser, kataSandi: hashedPassword });
      jwtService.sign.mockReturnValue('mock-jwt-token');
      configService.get.mockReturnValue('7d');

      await authService.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: 'user-1',
          email: 'test@example.com',
          peran: 'TIM_PENYUSUN',
          opdId: 'opd-1',
        },
        { expiresIn: '7d' },
      );
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
      const userWithPassword = { id: userId, kataSandi: hashedOldPassword };
      
      userRepository.findByIdWithPassword.mockResolvedValue(userWithPassword);
      userRepository.update.mockResolvedValue({ id: userId });

      await expect(authService.changePassword(userId, changePasswordDto))
        .resolves.toBeUndefined();

      expect(userRepository.findByIdWithPassword).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining({
        kataSandi: expect.any(String),
      }));
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      userRepository.findByIdWithPassword.mockResolvedValue(null);

      await expect(authService.changePassword(userId, changePasswordDto))
        .rejects.toThrow(UnauthorizedException);
      
      await expect(authService.changePassword(userId, changePasswordDto))
        .rejects.toThrow(AuthMessages.USER_NOT_FOUND);
    });

    it('should throw UnauthorizedException for wrong old password', async () => {
      const hashedWrongPassword = await bcrypt.hash('wrongpassword', 10);
      const userWithWrongPassword = { id: userId, kataSandi: hashedWrongPassword };
      
      userRepository.findByIdWithPassword.mockResolvedValue(userWithWrongPassword);

      await expect(authService.changePassword(userId, changePasswordDto))
        .rejects.toThrow(UnauthorizedException);
      
      await expect(authService.changePassword(userId, changePasswordDto))
        .rejects.toThrow(AuthMessages.INVALID_OLD_PASSWORD);
    });

    it('should hash new password before saving', async () => {
      const hashedOldPassword = await bcrypt.hash('oldpassword123', 10);
      const userWithPassword = { id: userId, kataSandi: hashedOldPassword };
      
      userRepository.findByIdWithPassword.mockResolvedValue(userWithPassword);
      userRepository.update.mockResolvedValue({ id: userId });

      await authService.changePassword(userId, changePasswordDto);

      const updateCall = userRepository.update.mock.calls[0];
      const updatedData = updateCall[1] as any;
      
      // Verify password was hashed
      const isValidNewPassword = await bcrypt.compare('newpassword123', updatedData.kataSandi);
      expect(isValidNewPassword).toBe(true);
    });
  });
});

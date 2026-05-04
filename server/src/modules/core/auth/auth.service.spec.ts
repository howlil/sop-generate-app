jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthRepository, type PenggunaAuthRecord } from './auth.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<Pick<AuthRepository, 'findActivePenggunaByEmail' | 'findActivePenggunaById'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  const sampleRow: PenggunaAuthRecord = {
    penggunaId: 'p-1',
    email: 'a@b.c',
    opdId: 'opd-1',
    nama: 'Tester',
    kataSandi: 'hashed',
    peran: 'PENYUSUN',
    nip: '198001012009011001',
    jabatan: 'Staf',
    pangkat: 'III/a',
    nohp: '08123456789',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    (bcrypt.compare as jest.Mock).mockReset();
    authRepository = {
      findActivePenggunaByEmail: jest.fn(),
      findActivePenggunaById: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-jwt'),
    };
    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'JWT_EXPIRATION') {
          return '15m';
        }
        return defaultValue;
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: authRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('should_throw_unauthorized_when_pengguna_not_found', async () => {
    authRepository.findActivePenggunaByEmail.mockResolvedValue(null);
    await expect(
      service.login({ email: 'x@y.z', password: 'secret' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should_throw_unauthorized_when_password_mismatch', async () => {
    authRepository.findActivePenggunaByEmail.mockResolvedValue(sampleRow);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: sampleRow.email, password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should_return_token_and_public_pengguna_when_credentials_valid', async () => {
    authRepository.findActivePenggunaByEmail.mockResolvedValue(sampleRow);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const actual = await service.login({ email: sampleRow.email, password: 'ok' });
    expect(actual.accessToken).toBe('signed-jwt');
    expect(actual.cookieMaxAgeMs).toBeGreaterThan(0);
    expect(actual.pengguna).toEqual({
      penggunaId: sampleRow.penggunaId,
      email: sampleRow.email,
      nama: sampleRow.nama,
      peran: sampleRow.peran,
      opdId: sampleRow.opdId,
      nip: sampleRow.nip,
      jabatan: sampleRow.jabatan,
      pangkat: sampleRow.pangkat,
      nohp: sampleRow.nohp,
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: sampleRow.penggunaId, email: sampleRow.email, peran: sampleRow.peran },
      { expiresIn: 900 },
    );
  });

  it('should_throw_not_found_when_getMe_pengguna_missing', async () => {
    authRepository.findActivePenggunaById.mockResolvedValue(null);
    await expect(service.getMe('missing-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should_return_public_pengguna_when_getMe_found', async () => {
    authRepository.findActivePenggunaById.mockResolvedValue(sampleRow);
    const actual = await service.getMe(sampleRow.penggunaId);
    expect(actual).toEqual({
      penggunaId: sampleRow.penggunaId,
      email: sampleRow.email,
      nama: sampleRow.nama,
      peran: sampleRow.peran,
      opdId: sampleRow.opdId,
      nip: sampleRow.nip,
      jabatan: sampleRow.jabatan,
      pangkat: sampleRow.pangkat,
      nohp: sampleRow.nohp,
    });
  });
});

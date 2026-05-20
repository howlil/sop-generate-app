jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
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
  let authRepository: jest.Mocked<
    Pick<AuthRepository, 'findActivePenggunaByEmail' | 'findActivePenggunaById' | 'updateKataSandi'>
  >;
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
    ttePinHash: null,
    ttePinSetAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    (bcrypt.compare as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockReset();
    authRepository = {
      findActivePenggunaByEmail: jest.fn(),
      findActivePenggunaById: jest.fn(),
      updateKataSandi: jest.fn().mockResolvedValue(undefined),
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
      tte: { configured: false },
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
      tte: { configured: false },
    });
  });

  it('should_update_password_when_old_password_valid', async () => {
    authRepository.findActivePenggunaById.mockResolvedValue(sampleRow);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    await service.changePassword(sampleRow.penggunaId, {
      kataSandiLama: 'old-pass',
      kataSandiBaru: 'new-pass-8',
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('old-pass', sampleRow.kataSandi);
    expect(bcrypt.hash).toHaveBeenCalledWith('new-pass-8', 10);
    expect(authRepository.updateKataSandi).toHaveBeenCalledWith(sampleRow.penggunaId, 'new-hash');
  });

  it('should_throw_unauthorized_when_changePassword_old_password_wrong', async () => {
    authRepository.findActivePenggunaById.mockResolvedValue(sampleRow);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.changePassword(sampleRow.penggunaId, {
        kataSandiLama: 'wrong',
        kataSandiBaru: 'new-pass-8',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authRepository.updateKataSandi).not.toHaveBeenCalled();
  });

  it('should_refresh_access_token_with_same_claims', async () => {
    const payload = {
      sub: sampleRow.penggunaId,
      email: sampleRow.email,
      peran: sampleRow.peran,
    };
    const actual = await service.refreshAccessToken(payload);
    expect(actual.accessToken).toBe('signed-jwt');
    expect(actual.cookieMaxAgeMs).toBeGreaterThan(0);
    expect(jwtService.signAsync).toHaveBeenCalledWith(payload, { expiresIn: 900 });
  });

  it('should_throw_not_found_when_changePassword_pengguna_missing', async () => {
    authRepository.findActivePenggunaById.mockResolvedValue(null);
    await expect(
      service.changePassword('missing-id', {
        kataSandiLama: 'old',
        kataSandiBaru: 'new-pass-8',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(authRepository.updateKataSandi).not.toHaveBeenCalled();
  });
});

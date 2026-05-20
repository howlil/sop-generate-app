import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../../../common/auth/password.constants';
import { AuthRepository, type PenggunaAuthRecord } from './auth.repository';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { LoginDto } from './dto/login.dto';
import {
  resolveAccessTokenExpiry,
  type JwtAccessPayload,
  type PublicPengguna,
} from './helpers/auth.shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Autentikasi email/kata sandi; menghasilkan JWT untuk cookie dan data pengguna publik.
   */
  async login(dto: LoginDto): Promise<{
    accessToken: string;
    pengguna: PublicPengguna;
    cookieMaxAgeMs: number;
  }> {
    const row = await this.authRepository.findActivePenggunaByEmail(dto.email);
    if (row === null) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid');
    }
    const isMatch = await bcrypt.compare(dto.password, row.kataSandi);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid');
    }
    const payload: JwtAccessPayload = {
      sub: row.penggunaId,
      email: row.email,
      peran: row.peran,
    };
    const { expiresInSeconds, maxAgeMs } = resolveAccessTokenExpiry(
      this.config.get('JWT_EXPIRATION'),
    );
    const signOptions: JwtSignOptions = {
      expiresIn: expiresInSeconds,
    };
    const accessToken = await this.jwtService.signAsync({ ...payload }, signOptions);
    const cookieMaxAgeMs = maxAgeMs;
    return {
      accessToken,
      pengguna: this.mapToPublicPengguna(row),
      cookieMaxAgeMs,
    };
  }

  /**
   * Mengambil data publik pengguna yang sedang masuk (berdasarkan klaim JWT).
   */
  async getMe(penggunaId: string): Promise<PublicPengguna> {
    const row = await this.authRepository.findActivePenggunaById(penggunaId);
    if (row === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    return this.mapToPublicPengguna(row);
  }

  /**
   * Menerbitkan ulang JWT akses dengan klaim yang sama (token masih valid).
   */
  /**
   * Ubah kata sandi pengguna yang sedang login; wajib kata sandi lama valid.
   */
  async changePassword(penggunaId: string, dto: ChangePasswordDto): Promise<void> {
    const row = await this.authRepository.findActivePenggunaById(penggunaId);
    if (row === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    const isMatch = await bcrypt.compare(dto.kataSandiLama, row.kataSandi);
    if (!isMatch) {
      throw new UnauthorizedException('Kata sandi lama tidak valid');
    }
    const kataSandiHash = await bcrypt.hash(dto.kataSandiBaru, BCRYPT_SALT_ROUNDS);
    await this.authRepository.updateKataSandi(penggunaId, kataSandiHash);
  }

  async refreshAccessToken(payload: JwtAccessPayload): Promise<{
    accessToken: string;
    cookieMaxAgeMs: number;
  }> {
    const { expiresInSeconds, maxAgeMs } = resolveAccessTokenExpiry(
      this.config.get('JWT_EXPIRATION'),
    );
    const signOptions: JwtSignOptions = {
      expiresIn: expiresInSeconds,
    };
    const accessToken = await this.jwtService.signAsync(
      { sub: payload.sub, email: payload.email, peran: payload.peran },
      signOptions,
    );
    return { accessToken, cookieMaxAgeMs: maxAgeMs };
  }

  private mapToPublicPengguna(row: PenggunaAuthRecord): PublicPengguna {
    const configured = row.ttePinHash !== null && row.ttePinSetAt !== null;
    return {
      penggunaId: row.penggunaId,
      email: row.email,
      nama: row.nama,
      peran: row.peran,
      opdId: row.opdId,
      nip: row.nip,
      jabatan: row.jabatan,
      pangkat: row.pangkat,
      nohp: row.nohp,
      tte: {
        configured,
        ...(configured && row.ttePinSetAt !== null
          ? { pinSetAt: row.ttePinSetAt.toISOString() }
          : {}),
      },
    };
  }
}

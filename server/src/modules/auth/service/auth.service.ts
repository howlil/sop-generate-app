import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import ms, { type StringValue } from 'ms';
import { UserRepository } from '../../users/repository/user.repository';
import { LoginDto, ChangePasswordDto } from '../dto/auth.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuthMessages } from '../../../common/messages';
import { PasswordValidator } from '../../../common/validators/password.validator';
import { JwtPayload } from '../../../common/strategy/jwt.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getJwtExpiration(
    key: 'JWT_EXPIRATION' | 'JWT_REFRESH_EXPIRATION',
    fallback: StringValue,
  ): StringValue {
    return (this.configService.get<string>(key) ?? fallback) as StringValue;
  }

  private getJwtExpirationMs(
    key: 'JWT_EXPIRATION' | 'JWT_REFRESH_EXPIRATION',
    fallback: StringValue,
    fallbackMs: number,
  ): number {
    const raw = this.getJwtExpiration(key, fallback);

    if (/^\d+$/.test(raw)) {
      return Number(raw) * 1000;
    }

    const parsed = ms(raw);
    if (typeof parsed !== 'number' || Number.isNaN(parsed)) {
      this.logger.warn(
        `Invalid ${key} value "${raw}", fallback to ${fallbackMs}ms`,
      );
      return fallbackMs;
    }

    return parsed;
  }

  private buildJwtPayload(user: {
    id: string;
    email: string;
    peran: string;
    opdId: string | null;
  }): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      peran: user.peran,
      opdId: user.opdId,
    };
  }

  private generateAuthTokens(payload: JwtPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.getJwtExpiration('JWT_EXPIRATION', '15m'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.getJwtExpiration('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return { accessToken, refreshToken };
  }

  private getBaseCookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }

  /**
   * Login user and generate tokens.
   * Tokens are returned for cookie-setting in controller, but NOT included in the API response body.
   * Clients receive tokens via HttpOnly cookies only.
   */
  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: AuthResponseDto['user'];
  }> {
    const user = await this.userRepository.findByEmailWithPassword(dto.email);

    // findByEmailWithPassword already filters deletedAt: null,
    // so this check handles both non-existent and soft-deleted users.
    if (!user) {
      throw new UnauthorizedException(AuthMessages.INVALID_EMAIL_OR_PASSWORD);
    }

    const isPasswordValid = await bcrypt.compare(dto.kataSandi, user.kataSandi);

    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthMessages.INVALID_EMAIL_OR_PASSWORD);
    }

    const payload = this.buildJwtPayload(user);
    const { accessToken, refreshToken } = this.generateAuthTokens(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        peran: user.peran,
        opdId: user.opdId,
        nip: user.nip,
        jabatan: user.jabatan,
      },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(
      dto.kataSandiLama,
      user.kataSandi,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthMessages.INVALID_OLD_PASSWORD);
    }

    // Validate new password strength
    PasswordValidator.validate(dto.kataSandiBaru);

    const hashedPassword = await bcrypt.hash(dto.kataSandiBaru, 10);
    await this.userRepository.update(userId, { kataSandi: hashedPassword });
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const user = await this.userRepository.findByIdWithPassword(payload.sub);

      if (!user || user.deletedAt) {
        throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
      }

      const newPayload = this.buildJwtPayload(user);
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        this.generateAuthTokens(newPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.logger.warn(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException(AuthMessages.TOKEN_INVALID);
    }
  }

  /**
   * Cookie options for access token (short-lived: 15 minutes)
   */
  getAccessTokenCookieOptions() {
    return {
      ...this.getBaseCookieOptions(),
      maxAge: this.getJwtExpirationMs('JWT_EXPIRATION', '15m', 15 * 60 * 1000),
    };
  }

  /**
   * Cookie options for refresh token (long-lived: 7 days)
   */
  getRefreshTokenCookieOptions() {
    return {
      ...this.getBaseCookieOptions(),
      maxAge: this.getJwtExpirationMs(
        'JWT_REFRESH_EXPIRATION',
        '7d',
        7 * 24 * 60 * 60 * 1000,
      ),
    };
  }
}

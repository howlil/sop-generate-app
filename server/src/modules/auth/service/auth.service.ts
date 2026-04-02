import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../users/repository/user.repository';
import { LoginDto, ChangePasswordDto } from '../dto/auth.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuthMessages } from '../../../common/messages';
import { PasswordValidator } from '../../../common/validators/password.validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException(AuthMessages.INVALID_EMAIL_OR_PASSWORD);
    }

    if (user.deletedAt) {
      throw new UnauthorizedException(AuthMessages.ACCOUNT_DEACTIVATED);
    }

    const isPasswordValid = await bcrypt.compare(dto.kataSandi, user.kataSandi);

    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthMessages.INVALID_EMAIL_OR_PASSWORD);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      peran: user.peran,
      opdId: user.opdId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
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

    const isPasswordValid = await bcrypt.compare(dto.kataSandiLama, user.kataSandi);

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

      const newPayload = {
        sub: user.id,
        email: user.email,
        peran: user.peran,
        opdId: user.opdId,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m') as any,
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d') as any,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException(AuthMessages.TOKEN_INVALID);
    }
  }

  getCookieOptions() {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    return {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthMessages } from '../messages';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          // Fallback: extract JWT from HttpOnly cookie
          // Parse cookie manually from Cookie header
          const cookieHeader = req.headers.cookie;
          if (!cookieHeader) {
            return null;
          }
          
          const cookies = cookieHeader
            .split(';')
            .map(c => c.trim().split('='))
            .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
          
          return cookies['access_token'] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.pengguna.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        opdId: true,
        nip: true,
        jabatan: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(AuthMessages.USER_NOT_FOUND);
    }

    return user;
  }
}

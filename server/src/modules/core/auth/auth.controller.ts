import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { JwtAuthGuard, type ApiSuccessResponse } from '../../../common';
import { AuthService } from './auth.service';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  buildAccessTokenCookieOptions,
  buildClearAccessTokenCookieOptions,
  type JwtAccessPayload,
  type PublicPengguna,
} from './helpers/auth.shared';
import { LoginDto } from './login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description:
      'Autentikasi dengan email dan kata sandi. JWT akses diset pada cookie HTTP-only; respons berisi data pengguna.',
  })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Email atau kata sandi tidak valid' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiSuccessResponse<PublicPengguna>> {
    const { accessToken, pengguna, cookieMaxAgeMs } = await this.authService.login(dto);
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    res.cookie(
      ACCESS_TOKEN_COOKIE_NAME,
      accessToken,
      buildAccessTokenCookieOptions(cookieMaxAgeMs, nodeEnv === 'production'),
    );
    return {
      message: 'Login berhasil',
      success: true,
      data: pengguna,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Profil pengguna saat ini',
    description: 'Membutuhkan cookie JWT akses (hasil login).',
  })
  @ApiResponse({ status: 200, description: 'Data pengguna' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 404, description: 'Pengguna tidak ditemukan' })
  async me(@Req() req: Request & { user: JwtAccessPayload }): Promise<ApiSuccessResponse<PublicPengguna>> {
    const pengguna = await this.authService.getMe(req.user.sub);
    return {
      message: 'Data pengguna berhasil diambil',
      success: true,
      data: pengguna,
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Perbarui sesi',
    description: 'Menerbitkan ulang cookie JWT akses berdasarkan token yang masih valid.',
  })
  @ApiResponse({ status: 200, description: 'Token diperbarui' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  async refresh(
    @Req() req: Request & { user: JwtAccessPayload },
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiSuccessResponse<{ success: true }>> {
    const { accessToken, cookieMaxAgeMs } = await this.authService.refreshAccessToken(req.user);
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    res.cookie(
      ACCESS_TOKEN_COOKIE_NAME,
      accessToken,
      buildAccessTokenCookieOptions(cookieMaxAgeMs, nodeEnv === 'production'),
    );
    return {
      message: 'Sesi diperbarui',
      success: true,
      data: { success: true },
    };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Keluar',
    description: 'Menghapus cookie JWT akses.',
  })
  @ApiResponse({ status: 200, description: 'Logout berhasil' })
  async logout(@Res({ passthrough: true }) res: Response): Promise<ApiSuccessResponse<{ success: true }>> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    res.clearCookie(
      ACCESS_TOKEN_COOKIE_NAME,
      buildClearAccessTokenCookieOptions(nodeEnv === 'production'),
    );
    return {
      message: 'Logout berhasil',
      success: true,
      data: { success: true },
    };
  }
}

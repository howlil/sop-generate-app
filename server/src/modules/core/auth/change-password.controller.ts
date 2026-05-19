import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard, type ApiSuccessResponse } from '../../../common';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './change-password.dto';
import { ACCESS_TOKEN_COOKIE_NAME, type JwtAccessPayload } from './helpers/auth.shared';

@ApiTags('Auth')
@Controller()
export class ChangePasswordController {
  constructor(private readonly authService: AuthService) {}

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Ubah kata sandi',
    description: 'Membutuhkan cookie JWT akses. Kata sandi lama harus valid.',
  })
  @ApiResponse({ status: 200, description: 'Kata sandi berhasil diubah' })
  @ApiResponse({ status: 401, description: 'Kata sandi lama tidak valid atau tidak terautentikasi' })
  @ApiResponse({ status: 404, description: 'Pengguna tidak ditemukan' })
  async changePassword(
    @Req() req: Request & { user: JwtAccessPayload },
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiSuccessResponse<{ success: true }>> {
    await this.authService.changePassword(req.user.sub, dto);
    return {
      message: 'Kata sandi berhasil diubah',
      success: true,
      data: { success: true },
    };
  }
}

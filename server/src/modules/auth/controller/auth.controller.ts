import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from '../service/auth.service';
import { LoginDto, ChangePasswordDto } from '../dto/auth.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { Public, CurrentUser } from '../../../../common/decorators';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login pengguna' })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email atau kata sandi salah',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);
    const cookieOptions = this.authService.getCookieOptions();

    // Set HttpOnly cookies
    response.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    response.cookie('refresh_token', result.refreshToken, cookieOptions);

    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token berhasil di-refresh' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = request.cookies?.['refresh_token'];
    
    if (!refreshToken) {
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      return { accessToken: '', refreshToken: '' };
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    const cookieOptions = this.authService.getCookieOptions();

    response.cookie('access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    response.cookie('refresh_token', tokens.refreshToken, cookieOptions);

    return tokens;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout pengguna' })
  @ApiResponse({ status: 200, description: 'Logout berhasil' })
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return { message: 'Logout berhasil' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ganti kata sandi pengguna yang sedang login' })
  @ApiResponse({ status: 200, description: 'Kata sandi berhasil diubah' })
  @ApiResponse({ status: 401, description: 'Kata sandi lama salah' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: { id: string },
  ): Promise<{ message: string }> {
    await this.authService.changePassword(user.id, dto);
    return { message: 'Kata sandi berhasil diubah' };
  }
}

import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from '../service/auth.service';
import { LoginDto, ChangePasswordDto } from '../dto/auth.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { Public, CurrentUser } from '../../../common/decorators';
import { AuthMessages } from '../../../common/messages';
import { getCookieValue } from '../../../common/utils/cookie.util';

@ApiTags('Auth')
@ApiBearerAuth()
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
    const { accessToken, refreshToken, user } =
      await this.authService.login(dto);

    // Set HttpOnly cookies with appropriate expiration
    response.cookie(
      'access_token',
      accessToken,
      this.authService.getAccessTokenCookieOptions(),
    );
    response.cookie(
      'refresh_token',
      refreshToken,
      this.authService.getRefreshTokenCookieOptions(),
    );

    return { user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description:
      'Token berhasil di-refresh. New tokens set via HttpOnly cookies.',
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: true }> {
    const refreshTokenValue = getCookieValue(
      'refresh_token',
      request.headers.cookie,
    );

    if (!refreshTokenValue) {
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      throw new UnauthorizedException(AuthMessages.TOKEN_INVALID);
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshTokens(refreshTokenValue);

    // Rotate tokens via HttpOnly cookies only
    response.cookie(
      'access_token',
      accessToken,
      this.authService.getAccessTokenCookieOptions(),
    );
    response.cookie(
      'refresh_token',
      refreshToken,
      this.authService.getRefreshTokenCookieOptions(),
    );

    return { success: true };
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

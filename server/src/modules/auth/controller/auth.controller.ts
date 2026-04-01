import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { LoginDto, ChangePasswordDto } from '../dto/auth.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { Public, CurrentUser } from '../../../common/decorators';

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
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
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

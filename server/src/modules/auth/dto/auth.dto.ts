import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, ValidateBy } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PasswordValidator } from '../../../common/validators/password.validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email pengguna',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @ApiProperty({
    description: 'Kata sandi',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @MinLength(8, { message: 'Kata sandi minimal 8 karakter' })
  @MaxLength(100, { message: 'Kata sandi maksimal 100 karakter' })
  kataSandi: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Kata sandi lama',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Kata sandi lama wajib diisi' })
  kataSandiLama: string;

  @ApiProperty({
    description: 'Kata sandi baru',
    example: 'NewPassword123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Kata sandi baru wajib diisi' })
  @MinLength(8, { message: 'Kata sandi baru minimal 8 karakter' })
  @MaxLength(100, { message: 'Kata sandi baru maksimal 100 karakter' })
  kataSandiBaru: string;
}

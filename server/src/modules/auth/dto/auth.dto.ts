import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter' })
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
    example: 'newpassword456',
  })
  @IsString()
  @IsNotEmpty({ message: 'Kata sandi baru wajib diisi' })
  @MinLength(6, { message: 'Kata sandi baru minimal 6 karakter' })
  kataSandiBaru: string;
}

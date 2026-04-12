import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { PeranPengguna } from '../../../generated/prisma';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  nama?: string;

  @ApiPropertyOptional({ example: 'password123' })
  @IsString()
  @IsOptional()
  @MinLength(6)
  kataSandi?: string;

  @ApiPropertyOptional({ enum: PeranPengguna })
  @IsEnum(PeranPengguna)
  @IsOptional()
  peran?: PeranPengguna;

  @ApiPropertyOptional({ example: 'uuid-of-opd' })
  @IsString()
  @IsOptional()
  opdId?: string;

  @ApiPropertyOptional({ example: '199001012020011001' })
  @IsString()
  @IsOptional()
  nip?: string;

  @ApiPropertyOptional({ example: 'Kepala Subbagian' })
  @IsString()
  @IsOptional()
  jabatan?: string;

  @ApiPropertyOptional({ example: 'Penata Muda' })
  @IsString()
  @IsOptional()
  pangkat?: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsString()
  @IsOptional()
  nohp?: string;
}

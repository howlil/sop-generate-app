import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Field profil bersama pembaruan akun pengguna. */
export class UpdatePenggunaProfilDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  readonly nama?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  readonly email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly nip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly jabatan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly pangkat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  readonly nohp?: string;

  @ApiPropertyOptional({ enum: ['AKTIF', 'NONAKTIF'] })
  @IsOptional()
  @IsIn(['AKTIF', 'NONAKTIF'])
  readonly status?: 'AKTIF' | 'NONAKTIF';
}

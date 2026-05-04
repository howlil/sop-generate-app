import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Body PATCH pembaruan penyusun. */
export class UpdatePenyusunDto {
  @ApiPropertyOptional({ example: 'budi@pemda.go.id' })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  readonly nama?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly nip?: string;

  @ApiPropertyOptional({ enum: ['PENYUSUN', 'PJ_PENYUSUN'] })
  @IsOptional()
  @IsIn(['PENYUSUN', 'PJ_PENYUSUN'])
  readonly peran?: 'PENYUSUN' | 'PJ_PENYUSUN';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly pangkat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly jabatan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly nohp?: string;

  /** Status akun: gabung dengan pembaruan data lain pada PATCH yang sama. */
  @ApiPropertyOptional({ enum: ['AKTIF', 'NONAKTIF'] })
  @IsOptional()
  @IsIn(['AKTIF', 'NONAKTIF'])
  readonly status?: 'AKTIF' | 'NONAKTIF';
}

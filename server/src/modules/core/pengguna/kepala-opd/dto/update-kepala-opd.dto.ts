import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Pembaruan data Kepala OPD; status nonaktif digabung di PATCH. */
export class UpdateKepalaOpdDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Pindah penugasan ke OPD lain (slot harus kosong).' })
  @IsOptional()
  @IsUUID('4')
  readonly opdId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
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

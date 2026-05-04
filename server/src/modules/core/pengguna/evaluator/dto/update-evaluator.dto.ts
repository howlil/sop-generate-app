import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Input pembaruan data evaluator. */
export class UpdateEvaluatorDto {
  @ApiPropertyOptional({ example: 'evaluator@pemda.go.id' })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional({ example: 'Budi Evaluator' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  readonly nama?: string;

  @ApiPropertyOptional({ example: '198001012010011001' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly nip?: string;

  @ApiPropertyOptional({ example: 'Analis Kebijakan' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly jabatan?: string;

  @ApiPropertyOptional({ example: 'IV/a' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly pangkat?: string;

  @ApiPropertyOptional({ example: '081234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly nohp?: string;

  /** Status akun evaluator (soft delete = NONAKTIF). */
  @ApiPropertyOptional({ enum: ['AKTIF', 'NONAKTIF'] })
  @IsOptional()
  @IsIn(['AKTIF', 'NONAKTIF'])
  readonly status?: 'AKTIF' | 'NONAKTIF';
}

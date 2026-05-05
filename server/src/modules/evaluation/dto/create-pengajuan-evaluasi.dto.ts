import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { JenisPengajuanEvaluasi } from '../../../generated/prisma';

/** Body POST `/evaluasi` — buka batch evaluasi untuk sekumpulan DetailSOP satu OPD (PJ Evaluator). */
export class CreatePengajuanEvaluasiDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly opdId!: string;

  @ApiProperty({ enum: JenisPengajuanEvaluasi })
  @IsEnum(JenisPengajuanEvaluasi)
  readonly jenis!: JenisPengajuanEvaluasi;

  @ApiProperty({ type: [String], description: 'Minimal satu DetailSOP milik OPD, siap masuk evaluasi' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  readonly sopDetailIds!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(65_000)
  readonly catatan?: string;
}

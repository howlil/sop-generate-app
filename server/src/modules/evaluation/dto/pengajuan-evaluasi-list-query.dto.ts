import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { JenisPengajuanEvaluasi, StatusPengajuanEvaluasi } from '../../../generated/prisma';

/** Query GET `/evaluasi` — daftar pengajuan evaluasi (filter opsional). */
export class PengajuanEvaluasiListQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly opdId?: string;

  @ApiPropertyOptional({ enum: StatusPengajuanEvaluasi })
  @IsOptional()
  @IsEnum(StatusPengajuanEvaluasi)
  readonly status?: StatusPengajuanEvaluasi;

  @ApiPropertyOptional({ enum: JenisPengajuanEvaluasi })
  @IsOptional()
  @IsEnum(JenisPengajuanEvaluasi)
  readonly jenis?: JenisPengajuanEvaluasi;
}

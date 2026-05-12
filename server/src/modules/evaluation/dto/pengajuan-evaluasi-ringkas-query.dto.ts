import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { JenisPengajuanEvaluasi, StatusPengajuanEvaluasi } from '../../../generated/prisma';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

/** Mengubah query `statusIn` seperti di {@link PengajuanEvaluasiListQueryDto}. */
function normalizeStatusInQueryValues(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const raw = Array.isArray(value) ? value : [value];
  const parts = raw.flatMap((item) =>
    typeof item === 'string' ? item.split(',') : [String(item)],
  );
  const trimmed = parts.map((s) => s.trim()).filter((s) => s.length > 0);
  return trimmed.length === 0 ? undefined : trimmed;
}

function mapLegacyStatusPengajuanEvaluasi(raw: string): string {
  if (raw === 'DIVERIFIKASI_BIRO') return 'DIVERIFIKASI_PJ_EVALUATOR';
  if (raw === 'DITANDATANGANI_KOORDINATOR') return 'DITANDATANGANI_PJ_PENYUSUN';
  return raw;
}

/** Query GET `/evaluasi/ringkas` — daftar ringkas terpaginasi untuk dashboard evaluator. */
export class PengajuanEvaluasiRingkasQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly opdId?: string;

  @ApiPropertyOptional({ enum: StatusPengajuanEvaluasi })
  @IsOptional()
  @IsEnum(StatusPengajuanEvaluasi)
  readonly status?: StatusPengajuanEvaluasi;

  @ApiPropertyOptional({
    enum: StatusPengajuanEvaluasi,
    isArray: true,
    description: 'Filter beberapa status (`statusIn=A` diulang atau koma)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    const normalized = normalizeStatusInQueryValues(value);
    return normalized?.map(mapLegacyStatusPengajuanEvaluasi);
  })
  @IsArray()
  @IsEnum(StatusPengajuanEvaluasi, { each: true })
  readonly statusIn?: StatusPengajuanEvaluasi[];

  @ApiPropertyOptional({ enum: JenisPengajuanEvaluasi })
  @IsOptional()
  @IsEnum(JenisPengajuanEvaluasi)
  readonly jenis?: JenisPengajuanEvaluasi;

  @ApiPropertyOptional({
    description: 'Substring pencarian nama OPD (contains)',
  })
  @IsOptional()
  @IsString()
  readonly search?: string;
}

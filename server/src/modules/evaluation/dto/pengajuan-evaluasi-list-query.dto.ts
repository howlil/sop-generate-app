import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { JenisPengajuanEvaluasi, StatusPengajuanEvaluasi } from '../../../generated/prisma';

/** Mengubah query `statusIn` satu nilai/array/string dipisah koma menjadi array string bersih (undefined jika kosong). */
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
  // Back-compat transisi: terima nilai lama dari client lama.
  if (raw === 'DIVERIFIKASI_BIRO') return 'DIVERIFIKASI_PJ_EVALUATOR';
  if (raw === 'DITANDATANGANI_KOORDINATOR') return 'DITANDATANGANI_PJ_PENYUSUN';
  return raw;
}

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

  @ApiPropertyOptional({
    enum: StatusPengajuanEvaluasi,
    isArray: true,
    description:
      'Filter beberapa status (`?statusIn=A&statusIn=B` atau koma); jika ada, mengalahkan `status` tunggal.',
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
}

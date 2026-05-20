import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Body PATCH `/evaluasi/:pengajuanEvaluasiId/selesai` — ajukan ke PJ setelah semua SOP SESUAI. */
export class SelesaiEvaluasiDto {
  @ApiPropertyOptional({
    description:
      'Skor evaluasi tingkat OPD (1–5). Wajib untuk pengajuan TERJADWAL; untuk MANDIRI jangan kirim — server menyimpan tanpa skor OPD.',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  readonly nilaiOPD?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

/** Body PATCH `/evaluasi/:pengajuanEvaluasiId/selesai` — ajukan ke PJ setelah semua SOP SESUAI. */
export class SelesaiEvaluasiDto {
  @ApiProperty({ description: 'Skor evaluasi tingkat OPD (1–5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  readonly nilaiOPD!: number;
}

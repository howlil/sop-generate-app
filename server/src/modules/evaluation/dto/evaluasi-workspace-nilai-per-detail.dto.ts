import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Satu baris nilai evaluasi per DetailSOP dalam pengajuan aktif. */
export class EvaluasiWorkspaceNilaiPerDetailDto {
  @ApiProperty({ format: 'uuid' })
  readonly detailSopId!: string;

  @ApiPropertyOptional({ nullable: true, enum: ['SESUAI', 'PERLU_PERBAIKAN'] })
  readonly hasil!: string | null;

  @ApiPropertyOptional({ nullable: true })
  readonly catatan!: string | null;

  @ApiProperty()
  readonly version!: number;
}

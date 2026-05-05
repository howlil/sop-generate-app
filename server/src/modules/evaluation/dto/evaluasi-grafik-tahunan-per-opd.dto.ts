import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Statistik evaluasi satu OPD dalam satu tahun kalender. */
export class EvaluasiGrafikTahunanPerOpdDto {
  @ApiProperty({ format: 'uuid' })
  readonly opdId!: string;

  @ApiProperty()
  readonly opdNama!: string;

  @ApiProperty({ description: 'Jumlah pengajuan evaluasi yang masuk statistik pada tahun ini' })
  readonly jumlahEvaluasi!: number;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Rata-rata nilaiOPD pengajuan pada tahun ini; null jika tidak ada nilai',
  })
  readonly rataRataSkor!: number | null;
}

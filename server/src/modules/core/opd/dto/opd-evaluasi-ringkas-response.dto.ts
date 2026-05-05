import { ApiProperty } from '@nestjs/swagger';

/** OPD beserta jumlah SOP dalam alur evaluasi (DetailSOP terbaru). */
export class OpdEvaluasiRingkasResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly id!: string;

  @ApiProperty()
  readonly nama!: string;

  @ApiProperty({
    description:
      'Jumlah SOP dengan status terbaru DIAJUKAN_EVALUASI, SEDANG_DIEVALUASI, REVISI_DARI_TIM_EVALUASI, atau SIAP_DIVERIFIKASI',
  })
  readonly jumlahSop!: number;

  @ApiProperty({
    description: 'Subset dengan status terbaru DIAJUKAN_EVALUASI',
  })
  readonly jumlahSopBaru!: number;
}

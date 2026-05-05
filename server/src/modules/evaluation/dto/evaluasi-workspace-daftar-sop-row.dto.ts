import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Satu baris daftar SOP di panel kiri workspace evaluasi. */
export class EvaluasiWorkspaceDaftarSopRowDto {
  @ApiProperty({ format: 'uuid', description: 'ID DetailSOP versi terbaru dalam pipeline evaluasi' })
  readonly detailSopId!: string;

  @ApiProperty({ format: 'uuid' })
  readonly sopId!: string;

  @ApiProperty()
  readonly judul!: string;

  @ApiProperty()
  readonly nomorSOP!: string;

  @ApiProperty({ description: 'Status DetailSOP terbaru (enum StatusSOP)' })
  readonly statusDetail!: string;

  @ApiProperty({
    enum: ['perlu_evaluasi', 'sedang_dievaluasi', 'selesai_pengajuan_ini'],
    description: 'Normalisasi alur untuk badge/filter UI',
  })
  readonly tampilanAlur!: 'perlu_evaluasi' | 'sedang_dievaluasi' | 'selesai_pengajuan_ini';

  @ApiPropertyOptional({
    nullable: true,
    description: 'Evaluator terakhir yang mengisi nilai untuk dokumen ini (opsional)',
    type: 'object',
    properties: { nama: { type: 'string' }, pada: { type: 'string', format: 'date-time' } },
  })
  readonly evaluatorTerakhir!: { nama: string; pada: string } | null;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** OPD ringkas pada shell pengajuan. */
export class PengajuanShellOpdDto {
  @ApiProperty()
  readonly id!: string;

  @ApiProperty()
  readonly nama!: string;
}

/** Satu baris SOP dalam batch evaluasi (panel kiri; tanpa isi dokumen). */
export class PengajuanSopItemShellDto {
  @ApiProperty({ format: 'uuid' })
  readonly detailSopId!: string;

  @ApiProperty({ format: 'uuid' })
  readonly sopId!: string;

  @ApiProperty()
  readonly judul!: string;

  @ApiProperty()
  readonly nomorSOP!: string;

  @ApiProperty()
  readonly statusDetailSop!: string;

  @ApiPropertyOptional()
  readonly hasilEvaluasi?: string;

  @ApiPropertyOptional()
  readonly catatanRingkas?: string;

  @ApiPropertyOptional({ type: () => Object })
  readonly evaluatorTerakhir?: { id: string; nama: string };
}

/** Satu entri nilai evaluasi (selaras kebutuhan klien mutasi & ringkasan). */
export class PengajuanNilaiEvaluasiShellDto {
  @ApiProperty({
    description:
      'Identifier stabil gabungan `pengajuanEvaluasiId:detailSopId` (bukan UUID baris DB).',
  })
  readonly id!: string;

  @ApiProperty()
  readonly pengajuanEvaluasiId!: string;

  @ApiProperty()
  readonly sopDetailId!: string;

  @ApiPropertyOptional()
  readonly hasil?: string;

  @ApiPropertyOptional()
  readonly catatan?: string;

  @ApiProperty()
  readonly version!: number;

  @ApiPropertyOptional()
  readonly dinilaiOlehId?: string;

  @ApiPropertyOptional({ type: () => Object })
  readonly dinilaiOleh?: { id: string; nama: string };

  @ApiPropertyOptional({ type: () => Object })
  readonly sopDetail?: { id: string };

  @ApiProperty()
  readonly createdAt!: string;

  @ApiProperty()
  readonly updatedAt!: string;
}

/** Entri timeline perubahan nilai (log). */
export class PengajuanTimelineNilaiDto {
  @ApiProperty()
  readonly id!: string;

  @ApiProperty()
  readonly sopDetailId!: string;

  @ApiProperty()
  readonly evaluatorId!: string;

  @ApiProperty()
  readonly evaluatorNama!: string;

  @ApiPropertyOptional()
  readonly hasilSebelum?: string;

  @ApiPropertyOptional()
  readonly hasilSesudah?: string;

  @ApiPropertyOptional()
  readonly catatanSebelum?: string;

  @ApiPropertyOptional()
  readonly catatanSesudah?: string;

  @ApiProperty()
  readonly createdAt!: string;
}

/** Shell GET `/evaluasi/pengajuan/:id` — ringkas, tanpa langkah/workflow teks besar. */
export class PengajuanEvaluasiShellDto {
  @ApiProperty({ format: 'uuid' })
  readonly id!: string;

  @ApiProperty({ format: 'uuid' })
  readonly opdId!: string;

  @ApiProperty()
  readonly opdNama!: string;

  @ApiProperty()
  readonly jenis!: string;

  @ApiProperty()
  readonly status!: string;

  @ApiProperty()
  readonly version!: number;

  @ApiPropertyOptional()
  readonly nomorBA?: string;

  @ApiPropertyOptional()
  readonly tanggalPermintaan?: string;

  @ApiPropertyOptional()
  readonly tanggalEvaluasi?: string;

  @ApiPropertyOptional({ description: 'Terisi bila status diverifikasi PJ Evaluator' })
  readonly tanggalVerifikasi?: string;

  @ApiPropertyOptional()
  readonly nilaiOPD?: number;

  @ApiPropertyOptional()
  readonly diverifikasiOlehUserId?: string;

  @ApiPropertyOptional()
  readonly namaPjEvaluator?: string;

  @ApiPropertyOptional()
  readonly ditandatanganiOlehPjPenyusunUserId?: string;

  @ApiPropertyOptional()
  readonly namaPjPenyusun?: string;

  @ApiPropertyOptional()
  readonly tanggalTTDBaPjPenyusun?: string;

  @ApiPropertyOptional()
  readonly diselesaikanOlehId?: string;

  @ApiPropertyOptional({ type: () => Object })
  readonly diselesaikanOleh?: { id: string; nama: string };

  @ApiProperty({ type: () => PengajuanShellOpdDto })
  readonly opd!: PengajuanShellOpdDto;

  @ApiPropertyOptional()
  readonly timEvaluasi?: string;

  @ApiPropertyOptional()
  readonly tanggalDiselesaikan?: string;

  @ApiProperty({ type: () => [PengajuanSopItemShellDto] })
  readonly sopItems!: PengajuanSopItemShellDto[];

  @ApiProperty({ type: () => [PengajuanNilaiEvaluasiShellDto] })
  readonly nilaiEvaluasi!: PengajuanNilaiEvaluasiShellDto[];

  @ApiProperty({ type: () => [PengajuanTimelineNilaiDto] })
  readonly timelineNilai!: PengajuanTimelineNilaiDto[];

  @ApiProperty()
  readonly createdAt!: string;

  @ApiProperty()
  readonly updatedAt!: string;
}

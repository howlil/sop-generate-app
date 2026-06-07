import { ApiProperty } from '@nestjs/swagger';
import { EvaluasiWorkspaceNilaiPerDetailDto } from './evaluasi-workspace-nilai-per-detail.dto';

/** Pengajuan evaluasi aktif (mis. SEDANG_DIEVALUASI) beserta nilai per dokumen. */
export class EvaluasiWorkspacePengajuanAktifDto {
  @ApiProperty({ format: 'uuid' })
  readonly id!: string;

  @ApiProperty()
  readonly status!: string;

  @ApiProperty()
  readonly statusLabel!: string;

  @ApiProperty({ enum: ['EVALUASI_REQUEST_EVALUATOR', 'EVALUASI_REQUEST_OPD'] })
  readonly jenis!: string;

  @ApiProperty({ type: () => [EvaluasiWorkspaceNilaiPerDetailDto] })
  readonly nilaiPerDetail!: EvaluasiWorkspaceNilaiPerDetailDto[];
}

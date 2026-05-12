import { ApiProperty } from '@nestjs/swagger';
import { PenyusunWorkbenchDataDto } from '../../sop/sop-catalog/dto/penyusun-workbench-data.dto';

/** Respons GET `/evaluasi/pengajuan/:pengajuanId/sop-dokumen/:detailSopId`. */
export class PengajuanSopWorkbenchResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly detailSopId!: string;

  @ApiProperty({ type: () => PenyusunWorkbenchDataDto })
  readonly workbench!: PenyusunWorkbenchDataDto;
}

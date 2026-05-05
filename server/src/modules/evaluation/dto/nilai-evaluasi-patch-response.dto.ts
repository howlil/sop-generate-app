import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HasilEvaluasi } from '../../../generated/prisma';

/** Respons mutasi nilai — selaras field yang dipakai klien (`sopDetailId`). */
export class NilaiEvaluasiPatchResponseDto {
  @ApiProperty({ format: 'uuid' })
  readonly id!: string;

  @ApiProperty({ format: 'uuid' })
  readonly pengajuanEvaluasiId!: string;

  @ApiProperty({ format: 'uuid' })
  readonly sopDetailId!: string;

  @ApiPropertyOptional({ enum: HasilEvaluasi })
  readonly hasil?: HasilEvaluasi;

  @ApiPropertyOptional({ nullable: true })
  readonly catatan?: string | null;

  @ApiProperty()
  readonly version!: number;

  @ApiPropertyOptional({ format: 'uuid' })
  readonly dinilaiOlehId?: string | null;

  @ApiProperty()
  readonly createdAt!: string;

  @ApiProperty()
  readonly updatedAt!: string;
}

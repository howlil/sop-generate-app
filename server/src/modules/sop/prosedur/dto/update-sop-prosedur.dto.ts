import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { LangkahPatchItem } from './langkah-patch-item.dto';
import { PelaksanaPatchItem } from './pelaksana-patch-item.dto';

/**
 * Payload PATCH prosedur SOP — semua field opsional, autosave-friendly.
 * - `pelaksana` (jika diset) replace-all swimlane (DetailSOPPelaksana).
 * - `langkah` (jika diset) replace-all langkah prosedur (LangkahSOP) beserta
 *   relasi cabang Ya/Tidak via `tempId` antar entri.
 */
export class UpdateSopProsedurDto {
  @ApiPropertyOptional({
    type: [PelaksanaPatchItem],
    description:
      'Daftar pelaksana di swimlane (replace-all). Urutan = posisi index di array.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PelaksanaPatchItem)
  readonly pelaksana?: PelaksanaPatchItem[];

  @ApiPropertyOptional({
    type: [LangkahPatchItem],
    description:
      'Daftar langkah prosedur (replace-all). Urutan = posisi index di array.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LangkahPatchItem)
  readonly langkah?: LangkahPatchItem[];
}

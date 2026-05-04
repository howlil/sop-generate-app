import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/**
 * Satu entri swimlane (DetailSOPPelaksana). Urutan diturunkan dari posisi index
 * di array `pelaksana[]` payload.
 */
export class PelaksanaPatchItem {
  @ApiProperty({
    description: 'ID master Pelaksana milik OPD pemilik SOP',
    format: 'uuid',
  })
  @IsUUID('4')
  readonly pelaksanaId!: string;
}

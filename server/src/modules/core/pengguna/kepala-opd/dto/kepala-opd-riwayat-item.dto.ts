import { ApiProperty } from '@nestjs/swagger';

/** Satu entri OPD tempat Kepala OPD pernah / sedang bertugas (tabel RiwayatOpdPengguna). */
export class KepalaOpdRiwayatItemDto {
  @ApiProperty({ format: 'uuid' })
  readonly opdId!: string;

  @ApiProperty()
  readonly namaOpd!: string;

  @ApiProperty()
  readonly dicatatPada!: Date;

  @ApiProperty()
  readonly diperbaruiPada!: Date;
}

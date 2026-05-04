import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Ringkas master peraturan + meta untuk UI penyusun. */
export class PeraturanResponseDto {
  @ApiProperty()
  readonly id!: string;

  @ApiProperty()
  readonly opdId!: string;

  @ApiProperty()
  readonly namaPeraturan!: string;

  @ApiProperty()
  readonly nomor!: string;

  @ApiProperty()
  readonly tahun!: number;

  @ApiProperty()
  readonly tentang!: string;

  @ApiProperty()
  readonly createdAt!: string;

  @ApiProperty()
  readonly updatedAt!: string;

  @ApiPropertyOptional({ description: 'Jumlah pemakaian sebagai dasar hukum SOP' })
  readonly digunakan?: number;
}

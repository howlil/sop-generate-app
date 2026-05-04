import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Ringkasan pengguna pembuat komentar untuk ditampilkan di sisi klien. */
export class KomentarUserDto {
  @ApiProperty()
  readonly id!: string;

  @ApiProperty()
  readonly nama!: string;

  @ApiProperty({ description: 'Peran pengguna (PeranPengguna)' })
  readonly peran!: string;

  @ApiPropertyOptional({ nullable: true })
  readonly email?: string | null;
}

/** Item Komentar SOP (status TERBUKA / SELESAI). */
export class KomentarResponseDto {
  @ApiProperty()
  readonly id!: string;

  @ApiProperty()
  readonly sopDetailId!: string;

  @ApiProperty()
  readonly userId!: string;

  @ApiProperty()
  readonly isi!: string;

  @ApiProperty({ enum: ['TERBUKA', 'SELESAI'] })
  readonly status!: 'TERBUKA' | 'SELESAI';

  @ApiProperty({ description: 'Waktu ISO 8601' })
  readonly createdAt!: string;

  @ApiProperty({ description: 'Waktu ISO 8601' })
  readonly updatedAt!: string;

  @ApiProperty({ type: () => KomentarUserDto })
  readonly user!: KomentarUserDto;
}

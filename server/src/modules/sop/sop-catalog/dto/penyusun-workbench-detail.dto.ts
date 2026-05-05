import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KepalaOpdRingkasDto } from './kepala-opd-ringkas.dto';

/** Header SOP ringkas di dalam detail workbench. */
export class PenyusunWorkbenchSopHeaderDto {
  @ApiProperty()
  readonly id!: string;

  @ApiProperty()
  readonly opdId!: string;

  @ApiProperty()
  readonly judul!: string;

  @ApiProperty()
  readonly createdAt!: string;

  @ApiProperty()
  readonly updatedAt!: string;
}

/** DetailSOP + relasi yang dipakai editor penyusun (selaras klien SopDetail). */
export class PenyusunWorkbenchDetailDto {
  @ApiProperty({ description: 'ID DetailSOP (sama dengan id)' })
  readonly id!: string;

  @ApiProperty()
  readonly sopId!: string;

  @ApiProperty()
  readonly status!: string;

  @ApiProperty()
  readonly versi!: number;

  @ApiProperty()
  readonly nomorSOP!: string;

  @ApiProperty()
  readonly tanggalPembuatan!: string;

  @ApiPropertyOptional({ nullable: true })
  readonly tanggalRevisi?: string | null;

  @ApiPropertyOptional({ nullable: true })
  readonly tanggalEfektif?: string | null;

  @ApiProperty({ description: 'URL/logo instansi (placeholder bila belum diisi)' })
  readonly logoInstansi!: string;

  @ApiProperty()
  readonly namaLembaga!: string;

  @ApiPropertyOptional({ nullable: true })
  readonly dibuatOlehId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  readonly terakhirDieditOlehId?: string | null;

  @ApiProperty()
  readonly createdAt!: string;

  @ApiProperty()
  readonly updatedAt!: string;

  @ApiPropertyOptional({ type: () => PenyusunWorkbenchSopHeaderDto })
  readonly sop?: PenyusunWorkbenchSopHeaderDto;

  @ApiPropertyOptional()
  readonly dibuatOleh?: { id: string; nama: string };

  @ApiPropertyOptional()
  readonly terakhirDieditOleh?: { id: string; nama: string };

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  readonly lampiran?: unknown[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  readonly dasarHukum?: unknown[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  readonly relasiSopKeluar?: unknown[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  readonly relasiSopMasuk?: unknown[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  readonly swimlanes?: unknown[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  readonly nilaiEvaluasi?: unknown[];

  @ApiPropertyOptional({
    type: () => KepalaOpdRingkasDto,
    nullable: true,
    description: 'Kepala OPD OPD pemilik SOP (untuk blok DISAHKAN OLEH / NIP di pratinjau dokumen)',
  })
  readonly kepalaOpd?: KepalaOpdRingkasDto | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'ID peraturan dasar hukum (urut createdAt asc) untuk panel kanan editor',
  })
  readonly dasarHukumPeraturanIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'ID DetailSOP terkait (relasi keluar, urut createdAt asc)',
  })
  readonly sopTerkaitDetailIds?: string[];

  @ApiPropertyOptional({
    nullable: true,
    description: 'Teks peringatan dari LampiranTeks jenis PERINGATAN (jika ada, ambil terbaru)',
  })
  readonly peringatan?: string | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'Item kualifikasi pelaksanaan (LampiranTeks jenis KUALIFIKASI_PELAKSANAAN, urut createdAt asc)',
  })
  readonly kualifikasiPelaksanaan?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Item peralatan dan perlengkapan (LampiranTeks jenis PERALATAN)',
  })
  readonly peralatanPerlengkapan?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Item pencatatan dan pendataan (LampiranTeks jenis PENCATATAN_PENDATAAN)',
  })
  readonly pencatatanPendataan?: string[];
}

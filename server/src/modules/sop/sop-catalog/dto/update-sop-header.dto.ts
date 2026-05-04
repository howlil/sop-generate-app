import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Payload PATCH header SOP — semua field opsional, hanya yang dikirim yang diperbarui.
 * Dipakai untuk autosave panel kanan editor penyusun.
 */
export class UpdateSopHeaderDto {
  @ApiPropertyOptional({ description: 'Judul SOP (header, mempengaruhi semua versi DetailSOP)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly judul?: string;

  @ApiPropertyOptional({ description: 'Nomor SOP (unik global lintas DetailSOP)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly nomorSOP?: string;

  @ApiPropertyOptional({ description: 'Nama lembaga pada dokumen (boleh multi-baris)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly namaLembaga?: string;

  @ApiPropertyOptional({ description: 'Teks peringatan (lampiran tunggal jenis PERINGATAN)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  readonly peringatan?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Daftar peraturanId untuk dasar hukum (replace-all)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly dasarHukumPeraturanIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Daftar detailSopId terkait (replace-all relasi keluar)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly sopTerkaitDetailIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Item kualifikasi pelaksanaan (replace-all lampiran KUALIFIKASI_PELAKSANAAN)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly kualifikasiPelaksanaan?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Item peralatan dan perlengkapan (replace-all lampiran PERALATAN)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly peralatanPerlengkapan?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Item pencatatan dan pendataan (replace-all lampiran PENCATATAN_PENDATAAN)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly pencatatanPendataan?: string[];
}

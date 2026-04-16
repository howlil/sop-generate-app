import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  JenisPengajuanEvaluasi,
  HasilEvaluasi,
} from '../../../generated/prisma';

export class CreatePengajuanEvaluasiDto {
  @IsString()
  @IsNotEmpty()
  opdId: string;

  @IsEnum(JenisPengajuanEvaluasi)
  jenis: JenisPengajuanEvaluasi;

  @IsArray()
  @IsString({ each: true })
  sopDetailIds: string[];

  @IsOptional()
  @IsString()
  catatan?: string;

  @IsOptional()
  @IsString()
  nomorBA?: string;

  @IsOptional()
  @IsString()
  tanggalPermintaan?: string;

  @IsOptional()
  @IsString()
  tanggalEvaluasi?: string;
}

export class IsiNilaiEvaluasiDto {
  @IsEnum(HasilEvaluasi)
  hasil: HasilEvaluasi;

  @IsOptional()
  @IsString()
  catatan?: string;

  @IsInt()
  @Min(0)
  version: number;
}

export class SelesaiEvaluasiDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  nilaiOPD?: number | null;
}

// Response DTOs for Rekap Evaluasi
export class RekapPengajuanDetailDto {
  @ApiProperty({ description: 'ID pengajuan evaluasi' })
  pengajuanEvaluasiId: string;

  @ApiProperty({ description: 'Jenis pengajuan (TERJADWAL/MANDIRI)' })
  jenis: string;

  @ApiProperty({ description: 'Status pengajuan' })
  status: string;

  @ApiProperty({ description: 'Nilai OPD (jika ada)', required: false })
  nilaiOPD: number | null;

  @ApiProperty({ description: 'Tanggal evaluasi', required: false })
  tanggalEvaluasi: string | null;

  @ApiProperty({ description: 'Jumlah detail SOP' })
  detailSopCount: number;

  @ApiProperty({
    description: 'Hasil evaluasi',
    properties: {
      sesuai: { type: 'number' },
      tidakSesuai: { type: 'number' },
    },
  })
  hasilEvaluasi: {
    sesuai: number;
    tidakSesuai: number;
  };
}

export class RekapOpdDto {
  @ApiProperty({ description: 'ID OPD' })
  opdId: string;

  @ApiProperty({ description: 'Nama OPD' })
  opdNama: string;

  @ApiProperty({ description: 'Total pengajuan evaluasi' })
  total: number;

  @ApiProperty({ description: 'Total pengajuan yang selesai' })
  selesai: number;

  @ApiProperty({ description: 'Total evaluasi yang sesuai' })
  sesuai: number;

  @ApiProperty({ description: 'Total evaluasi yang tidak sesuai' })
  tidakSesuai: number;

  @ApiProperty({ description: 'Rata-rata nilai OPD', required: false })
  nilaiRataRata: number | null;

  @ApiProperty({
    description: 'Detail per pengajuan',
    type: [RekapPengajuanDetailDto],
  })
  pengajuanDetails: RekapPengajuanDetailDto[];
}

export class RekapEvaluasiResponseDto {
  @ApiProperty({ description: 'Tahun evaluasi' })
  tahun: number;

  @ApiProperty({ description: 'Total pengajuan evaluasi' })
  totalPengajuan: number;

  @ApiProperty({ description: 'Total pengajuan yang selesai' })
  totalSelesai: number;

  @ApiProperty({ description: 'Rata-rata nilai keseluruhan', required: false })
  overallNilaiRataRata: number | null;

  @ApiProperty({
    description: 'Detail per OPD',
    type: [RekapOpdDto],
  })
  opd: RekapOpdDto[];
}

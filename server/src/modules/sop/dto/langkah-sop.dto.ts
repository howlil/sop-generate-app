import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { JenisLangkahProsedur, SatuanWaktu } from '../../../generated/prisma';

export class CreateLangkahSopDto {
  @ApiProperty({ example: 'Terima berkas permohonan' })
  @IsString() @IsNotEmpty()
  kegiatan: string;

  @ApiPropertyOptional({ enum: JenisLangkahProsedur, default: JenisLangkahProsedur.TASK })
  @IsEnum(JenisLangkahProsedur) @IsOptional()
  jenis?: JenisLangkahProsedur;

  @ApiProperty({ example: 1 })
  @IsInt() @Min(1)
  urutan: number;

  @ApiProperty({ example: 'Formulir permohonan' })
  @IsString() @IsNotEmpty()
  kelengkapan: string;

  @ApiProperty({ example: 'Berkas diterima' })
  @IsString() @IsNotEmpty()
  keluaran: string;

  @ApiProperty({ example: 15 })
  @IsInt() @Min(1)
  waktu: number;

  @ApiProperty({ enum: SatuanWaktu })
  @IsEnum(SatuanWaktu)
  satuanWaktu: SatuanWaktu;

  @ApiPropertyOptional({ example: '' })
  @IsString() @IsOptional()
  keterangan?: string;

  @ApiProperty({ example: 'uuid-of-pelaksana', description: 'Harus terdaftar di swimlane DetailSOP ini' })
  @IsString() @IsNotEmpty()
  pelaksanaId: string;

  @ApiPropertyOptional({ example: null })
  @IsString() @IsOptional()
  langkahSelanjutnyaYaId?: string;

  @ApiPropertyOptional({ example: null })
  @IsString() @IsOptional()
  langkahSelanjutnyaTidakId?: string;
}

export class UpdateLangkahSopDto {
  @ApiPropertyOptional() @IsString() @IsOptional() kegiatan?: string;
  @ApiPropertyOptional({ enum: JenisLangkahProsedur }) @IsEnum(JenisLangkahProsedur) @IsOptional() jenis?: JenisLangkahProsedur;
  @ApiPropertyOptional() @IsInt() @IsOptional() @Min(1) urutan?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() kelengkapan?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() keluaran?: string;
  @ApiPropertyOptional() @IsInt() @IsOptional() @Min(1) waktu?: number;
  @ApiPropertyOptional({ enum: SatuanWaktu }) @IsEnum(SatuanWaktu) @IsOptional() satuanWaktu?: SatuanWaktu;
  @ApiPropertyOptional() @IsString() @IsOptional() keterangan?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() pelaksanaId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() langkahSelanjutnyaYaId?: string | null;
  @ApiPropertyOptional() @IsString() @IsOptional() langkahSelanjutnyaTidakId?: string | null;
}

export class LangkahSopResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() sopDetailId: string;
  @ApiProperty() kegiatan: string;
  @ApiProperty({ enum: JenisLangkahProsedur }) jenis: JenisLangkahProsedur;
  @ApiProperty() urutan: number;
  @ApiProperty() kelengkapan: string;
  @ApiProperty() keluaran: string;
  @ApiProperty() waktu: number;
  @ApiProperty({ enum: SatuanWaktu }) satuanWaktu: SatuanWaktu;
  @ApiProperty() keterangan: string;
  @ApiProperty() pelaksanaId: string;
  @ApiPropertyOptional() langkahSelanjutnyaYaId: string | null;
  @ApiPropertyOptional() langkahSelanjutnyaTidakId: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

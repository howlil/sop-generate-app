import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { StatusSOP } from '../../../generated/prisma';

export class UpdateMetadataDto {
  @ApiPropertyOptional()
  @IsString() @IsOptional() logoInstansi?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional() namaLembaga?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional() tanggalRevisi?: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional() tanggalEfektif?: string;

  @ApiPropertyOptional()
  @IsInt() @IsOptional() @Min(0) lebarKolomKegiatan?: number;

  @ApiPropertyOptional()
  @IsInt() @IsOptional() @Min(0) lebarKolomPelaksana?: number;

  @ApiPropertyOptional()
  @IsInt() @IsOptional() @Min(0) lebarKolomKelengkapan?: number;

  @ApiPropertyOptional()
  @IsInt() @IsOptional() @Min(0) lebarKolomWaktu?: number;

  @ApiPropertyOptional()
  @IsInt() @IsOptional() @Min(0) lebarKolomOutput?: number;

  @ApiPropertyOptional()
  @IsInt() @IsOptional() @Min(0) lebarKolomKeterangan?: number;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: StatusSOP })
  @IsEnum(StatusSOP, { message: 'Status tidak valid' })
  status: StatusSOP;
}

export class DetailSopResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() sopId: string;
  @ApiProperty() nomorSOP: string;
  @ApiProperty({ enum: StatusSOP }) status: StatusSOP;
  @ApiProperty() versi: number;
  @ApiProperty() logoInstansi: string;
  @ApiProperty() namaLembaga: string;
  @ApiPropertyOptional() tanggalRevisi: Date | null;
  @ApiPropertyOptional() tanggalEfektif: Date | null;
  @ApiPropertyOptional() lebarKolomKegiatan: number | null;
  @ApiPropertyOptional() lebarKolomPelaksana: number | null;
  @ApiPropertyOptional() lebarKolomKelengkapan: number | null;
  @ApiPropertyOptional() lebarKolomWaktu: number | null;
  @ApiPropertyOptional() lebarKolomOutput: number | null;
  @ApiPropertyOptional() lebarKolomKeterangan: number | null;
  @ApiPropertyOptional() dibuatOlehId: string | null;
  @ApiPropertyOptional() terakhirDieditOlehId: string | null;
  @ApiProperty() tanggalPembuatan: Date;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

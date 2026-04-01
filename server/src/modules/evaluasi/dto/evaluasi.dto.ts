import {
  IsString, IsEnum, IsOptional, IsArray, IsInt, Min, Max, IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JenisPengajuanEvaluasi, HasilEvaluasi } from '../../../generated/prisma';

export class CreatePengajuanEvaluasiDto {
  @IsString() @IsNotEmpty()
  opdId: string;

  @IsEnum(JenisPengajuanEvaluasi)
  jenis: JenisPengajuanEvaluasi;

  @IsArray() @IsString({ each: true })
  sopDetailIds: string[];

  @IsOptional() @IsString()
  catatan?: string;

  @IsOptional() @IsString()
  nomorBA?: string;

  @IsOptional() @IsString()
  tanggalPermintaan?: string;

  @IsOptional() @IsString()
  tanggalEvaluasi?: string;
}

export class IsiNilaiEvaluasiDto {
  @IsEnum(HasilEvaluasi)
  hasil: HasilEvaluasi;

  @IsOptional() @IsString()
  catatan?: string;

  @IsInt() @Min(0)
  version: number;
}

export class SelesaiEvaluasiDto {
  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(0) @Max(100)
  nilaiOPD?: number | null;
}

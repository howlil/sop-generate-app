import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { StatusPeraturan } from '../../../generated/prisma';

export class CreatePeraturanDto {
  @ApiProperty({ example: 'uuid-of-opd' })
  @IsString()
  @IsNotEmpty({ message: 'opdId wajib diisi' })
  opdId: string;

  @ApiProperty({ example: 'Peraturan Bupati' })
  @IsString()
  @IsNotEmpty({ message: 'Nama peraturan wajib diisi' })
  @MaxLength(200)
  namaPeraturan: string;

  @ApiProperty({ example: '10' })
  @IsString()
  @IsNotEmpty({ message: 'Nomor peraturan wajib diisi' })
  @MaxLength(50)
  nomor: string;

  @ApiProperty({ example: 2025 })
  @IsInt({ message: 'Tahun harus berupa angka' })
  @Min(1945)
  @Max(2100)
  tahun: number;

  @ApiProperty({ example: 'Penyelenggaraan Pelayanan Publik' })
  @IsString()
  @IsNotEmpty({ message: 'Keterangan tentang wajib diisi' })
  tentang: string;
}

export class UpdatePeraturanDto extends PartialType(
  OmitType(CreatePeraturanDto, ['opdId'] as const),
) {}

export class PeraturanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  opdId: string;

  @ApiProperty()
  namaPeraturan: string;

  @ApiProperty()
  nomor: string;

  @ApiProperty()
  tahun: number;

  @ApiProperty()
  tentang: string;

  @ApiProperty({ enum: StatusPeraturan })
  status: StatusPeraturan;

  @ApiProperty({ description: 'Jumlah DetailSOP yang menggunakan peraturan ini sebagai dasar hukum' })
  digunakan: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

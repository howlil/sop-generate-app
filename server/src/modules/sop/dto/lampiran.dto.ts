import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { JenisLampiran } from '../../../generated/prisma';

// LampiranTeks
export class CreateLampiranTeksDto {
  @ApiProperty({ enum: JenisLampiran })
  @IsEnum(JenisLampiran)
  jenis: JenisLampiran;

  @ApiProperty({ example: 'Berhati-hati saat menangani dokumen rahasia.' })
  @IsString()
  @IsNotEmpty()
  teks: string;
}

export class LampiranTeksResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() sopDetailId: string;
  @ApiProperty({ enum: JenisLampiran }) jenis: JenisLampiran;
  @ApiProperty() teks: string;
}

// DasarHukum (junction: sopDetailId + peraturanId)
export class AddDasarHukumDto {
  @ApiProperty({ example: 'uuid-of-peraturan' })
  @IsString()
  @IsNotEmpty()
  peraturanId: string;
}

// SopTerkait (junction: sopDetailId + sopTerkaitDetailId)
export class AddSopTerkaitDto {
  @ApiProperty({ example: 'uuid-of-detail-sop' })
  @IsString()
  @IsNotEmpty()
  sopTerkaitDetailId: string;
}

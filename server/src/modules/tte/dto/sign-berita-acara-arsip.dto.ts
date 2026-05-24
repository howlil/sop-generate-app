import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsString, IsUUID, MaxLength } from 'class-validator';

export class SignBeritaAcaraArsipDto {
  @ApiProperty({ description: 'ID pengajuan evaluasi yang Berita Acaranya akan ditandatangani arsip.' })
  @IsUUID()
  readonly pengajuanEvaluasiId!: string;

  @ApiProperty({ description: 'PDF sumber sebagai base64 tanpa prefix data URL.' })
  @IsString()
  @IsBase64()
  @MaxLength(30_000_000)
  readonly pdfBase64!: string;
}

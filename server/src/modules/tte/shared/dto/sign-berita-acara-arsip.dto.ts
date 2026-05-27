import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsString, IsUUID, MaxLength } from 'class-validator';
import { PDF_BASE64_MAX_LENGTH } from '../../../../common/http/request-body-limits';

export class SignBeritaAcaraArsipDto {
  @ApiProperty({
    description: 'ID pengajuan evaluasi yang Berita Acaranya akan ditandatangani arsip.',
  })
  @IsUUID()
  readonly pengajuanEvaluasiId!: string;

  @ApiProperty({ description: 'PDF sumber sebagai base64 tanpa prefix data URL.' })
  @IsString()
  @IsBase64()
  @MaxLength(PDF_BASE64_MAX_LENGTH)
  readonly pdfBase64!: string;
}

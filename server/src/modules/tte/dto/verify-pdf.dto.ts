import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsString, MaxLength } from 'class-validator';

export class VerifyPdfDto {
  @ApiProperty({ description: 'Berkas PDF sebagai base64 tanpa prefix data URL.' })
  @IsString()
  @IsBase64()
  @MaxLength(30_000_000)
  readonly pdfBase64!: string;
}

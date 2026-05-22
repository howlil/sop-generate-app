import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsEnum, IsString, IsUUID, MaxLength } from 'class-validator';
import { JenisDokumenTte } from '../../../generated/prisma';

export class SignPdfDto {
  @ApiProperty()
  @IsUUID()
  readonly dokumenTteId!: string;

  @ApiProperty()
  @IsUUID()
  readonly userId!: string;

  @ApiProperty({ enum: JenisDokumenTte })
  @IsEnum(JenisDokumenTte)
  readonly jenisDokumen!: JenisDokumenTte;

  @ApiProperty({ description: 'PDF source as base64 without data URL prefix.' })
  @IsString()
  @IsBase64()
  @MaxLength(30_000_000)
  readonly pdfBase64!: string;
}

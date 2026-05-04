import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Body POST penambahan penyusun / PJ penyusun per OPD. */
export class CreatePenyusunDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly opdId!: string;

  @ApiProperty({ example: 'Budi Penyusun' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  readonly nama!: string;

  @ApiProperty({ example: '198001012010011001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  readonly nip!: string;

  @ApiProperty({ enum: ['PENYUSUN', 'PJ_PENYUSUN'] })
  @IsIn(['PENYUSUN', 'PJ_PENYUSUN'])
  readonly peran!: 'PENYUSUN' | 'PJ_PENYUSUN';

  @ApiProperty({ example: 'IV/a' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  readonly pangkat!: string;

  @ApiProperty({ example: 'Analis Kebijakan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly jabatan!: string;

  @ApiProperty({ example: 'budi@pemda.go.id' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  readonly nohp!: string;
}

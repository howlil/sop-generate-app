import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/** Field profil bersama pembuatan akun pengguna (penyusun, kepala OPD, evaluator). */
export class CreatePenggunaProfilDto {
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

  @ApiProperty({ example: 'budi@pemda.go.id' })
  @IsEmail()
  @MaxLength(255)
  readonly email!: string;

  @ApiProperty({ example: 'Analis Kebijakan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly jabatan!: string;

  @ApiProperty({ example: 'IV/a' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  readonly pangkat!: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  readonly nohp!: string;
}

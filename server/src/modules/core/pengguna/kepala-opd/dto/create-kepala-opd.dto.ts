import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/** Payload pembuatan akun Kepala OPD (sandi awal ditetapkan server). */
export class CreateKepalaOpdDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  readonly opdId!: string;

  @ApiProperty({ example: 'Dr. Ahmad Pratama, S.Sos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly nama!: string;

  @ApiProperty({ example: 'kepala@opd.go.id' })
  @IsEmail()
  @MaxLength(255)
  readonly email!: string;

  @ApiProperty({ example: '197503152000032001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  readonly nip!: string;

  @ApiProperty({ example: 'Kepala Dinas' })
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

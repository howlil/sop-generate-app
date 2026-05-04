import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/** Input penambahan evaluator di OPD Biro. */
export class CreateEvaluatorDto {
  @ApiProperty({ example: 'evaluator@pemda.go.id' })
  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({ example: 'Budi Evaluator' })
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
  @MaxLength(32)
  readonly nohp!: string;
}

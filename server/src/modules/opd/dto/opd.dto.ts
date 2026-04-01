import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateOpdDto {
  @ApiProperty({ example: 'Dinas Pendidikan dan Kebudayaan' })
  @IsString()
  @IsNotEmpty({ message: 'Nama OPD wajib diisi' })
  @MaxLength(200, { message: 'Nama OPD maksimal 200 karakter' })
  nama: string;
}

export class UpdateOpdDto extends PartialType(CreateOpdDto) {}

export class OpdResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nama: string;

  @ApiProperty()
  totalSOP: number;

  @ApiProperty()
  sopBerlaku: number;

  @ApiProperty()
  sopDraft: number;

  @ApiPropertyOptional()
  deletedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

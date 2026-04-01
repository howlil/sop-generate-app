import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

export class CreatePelaksanaDto {
  @ApiProperty({ example: 'uuid-of-opd' })
  @IsString()
  @IsNotEmpty({ message: 'opdId wajib diisi' })
  opdId: string;

  @ApiProperty({ example: 'Staf Administrasi' })
  @IsString()
  @IsNotEmpty({ message: 'namaPelaksana wajib diisi' })
  @MaxLength(200)
  namaPelaksana: string;
}

export class UpdatePelaksanaDto {
  @ApiPropertyOptional()
  @IsString() @IsOptional() @MaxLength(200)
  namaPelaksana?: string;
}

export class PelaksanaResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() opdId: string;
  @ApiProperty() namaPelaksana: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class AddSwimlanDto {
  @ApiProperty({ example: 'uuid-of-pelaksana' })
  @IsString()
  @IsNotEmpty({ message: 'pelaksanaId wajib diisi' })
  pelaksanaId: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt() @IsOptional() @Min(0)
  urutan?: number;
}

export class SwimlanResponseDto {
  @ApiProperty() sopDetailId: string;
  @ApiProperty() pelaksanaId: string;
  @ApiProperty() urutan: number;
  @ApiPropertyOptional() pelaksana?: PelaksanaResponseDto;
}

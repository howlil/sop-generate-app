import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { StatusSOP } from '../../../generated/prisma';

export class CreateSopDto {
  @ApiProperty({ example: 'SOP Pengadaan Barang' })
  @IsString()
  @IsNotEmpty({ message: 'Judul SOP wajib diisi' })
  @MaxLength(300)
  judul: string;

  @ApiProperty({ example: 'uuid-of-opd' })
  @IsString()
  @IsNotEmpty({ message: 'opdId wajib diisi' })
  opdId: string;

  @ApiProperty({ example: 'https://cdn.example.com/logo.png', description: 'URL logo instansi' })
  @IsString()
  @IsNotEmpty({ message: 'logoInstansi wajib diisi' })
  logoInstansi: string;

  @ApiProperty({ example: 'Dinas Pendidikan dan Kebudayaan Kota Contoh' })
  @IsString()
  @IsNotEmpty({ message: 'namaLembaga wajib diisi' })
  namaLembaga: string;
}

export class SopResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() opdId: string;
  @ApiProperty() judul: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiPropertyOptional() totalVersi?: number;
  @ApiPropertyOptional() statusAktif?: StatusSOP;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
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

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png', description: 'URL logo instansi (opsional, akan menggunakan default jika tidak diisi)' })
  @IsString()
  @IsOptional()
  logoInstansi?: string;

  @ApiPropertyOptional({ example: 'Dinas Pendidikan dan Kebudayaan Kota Contoh', description: 'Nama lembaga (opsional, akan menggunakan nama OPD jika tidak diisi)' })
  @IsString()
  @IsOptional()
  namaLembaga?: string;
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

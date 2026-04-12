import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { StatusTim } from '../../../generated/prisma';

export class CreateTimPenyusunDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsString()
  @IsNotEmpty({ message: 'userId wajib diisi' })
  userId: string;

  @ApiProperty({ example: 'uuid-of-opd' })
  @IsString()
  @IsNotEmpty({ message: 'opdId wajib diisi' })
  opdId: string;
}

export class PindahTimPenyusunDto {
  @ApiProperty({ example: 'uuid-of-opd-baru', description: 'OPD tujuan transfer' })
  @IsString()
  @IsNotEmpty({ message: 'opdIdBaru wajib diisi' })
  opdIdBaru: string;
}

class UserInfoDto {
  @ApiProperty() id: string;
  @ApiProperty() nama: string;
  @ApiProperty() email: string;
  @ApiProperty() nip: string;
  @ApiProperty() jabatan: string;
  @ApiProperty() pangkat: string;
  @ApiProperty() nohp: string;
}

export class AnggotaTimPenyusunResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() opdId: string;
  @ApiProperty({ enum: StatusTim }) status: StatusTim;
  @ApiProperty() tanggalBergabung: Date;
  @ApiPropertyOptional() berakhirPada: Date | null;
  @ApiProperty({ description: 'Jumlah DetailSOP yang dibuat oleh anggota ini di OPD terkait' })
  jumlahSOPDisusun: number;
  @ApiProperty({ type: UserInfoDto }) user: UserInfoDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

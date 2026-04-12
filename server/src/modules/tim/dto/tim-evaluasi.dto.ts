import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { StatusTim } from '../../../generated/prisma';

export class CreateTimEvaluasiDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsString()
  @IsNotEmpty({ message: 'userId wajib diisi' })
  userId: string;
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

export class AnggotaTimEvaluasiResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty({ enum: StatusTim }) status: StatusTim;
  @ApiProperty() tanggalBergabung: Date;
  @ApiPropertyOptional() berakhirPada: Date | null;
  @ApiProperty({ type: UserInfoDto }) user: UserInfoDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

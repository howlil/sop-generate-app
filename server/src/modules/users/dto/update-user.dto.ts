import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { PeranPengguna } from '../../../generated/prisma';

export class UpdateUserDto {
  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  nama?: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  kataSandi?: string;

  @ApiProperty({ enum: PeranPengguna, required: false })
  @IsEnum(PeranPengguna)
  @IsOptional()
  peran?: PeranPengguna;

  @ApiProperty({ example: 'uuid-opd', required: false })
  @IsString()
  @IsOptional()
  opdId?: string;
}

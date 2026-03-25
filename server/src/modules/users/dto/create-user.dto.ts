import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../generated/prisma';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TIM_PENYUSUN })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({ example: 'uuid-of-opd' })
  @IsString()
  @IsOptional()
  opdId?: string;

  @ApiPropertyOptional({ example: '199001012020011001' })
  @IsString()
  @IsOptional()
  nip?: string;

  @ApiPropertyOptional({ example: 'Kepala Subbagian' })
  @IsString()
  @IsOptional()
  jabatan?: string;

  @ApiPropertyOptional({ example: 'Penata Muda' })
  @IsString()
  @IsOptional()
  pangkat?: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsString()
  @IsOptional()
  nohp?: string;
}

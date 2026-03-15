import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ example: 'Updated Title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated content...', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}

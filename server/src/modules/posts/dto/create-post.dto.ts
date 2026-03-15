import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Post content here...', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiProperty({ example: 'user-id-here' })
  @IsString()
  @IsNotEmpty()
  authorId: string;
}

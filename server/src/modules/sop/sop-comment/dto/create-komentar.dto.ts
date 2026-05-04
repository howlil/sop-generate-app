import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

/** Payload kirim komentar baru oleh TIM_EVALUASI. */
export class CreateKomentarDto {
  @ApiProperty({
    description: 'Isi komentar evaluator',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1, { message: 'Komentar tidak boleh kosong' })
  @MaxLength(2000, { message: 'Komentar maksimal 2000 karakter' })
  readonly isi!: string;
}

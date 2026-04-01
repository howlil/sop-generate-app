import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Tipe token',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Informasi user',
  })
  user: {
    id: string;
    email: string;
    nama: string;
    peran: string;
    opdId: string | null;
    nip: string;
    jabatan: string;
  };
}

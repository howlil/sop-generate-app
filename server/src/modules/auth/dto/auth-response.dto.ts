import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ description: 'User ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User full name' })
  nama: string;

  @ApiProperty({ description: 'User role' })
  peran: string;

  @ApiProperty({ description: 'OPD ID (nullable)', nullable: true })
  opdId: string | null;

  @ApiProperty({ description: 'Employee identification number' })
  nip: string;

  @ApiProperty({ description: 'User position/title' })
  jabatan: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description:
      'Authenticated user information. Access and refresh tokens are delivered via HttpOnly cookies.',
    type: UserInfoDto,
  })
  user: UserInfoDto;
}

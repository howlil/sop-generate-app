import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PeranTTE } from '../../../generated/prisma';

// TTE-01: register/upsert TTE credential — peran is derived from user's JWT role
export class RegisterTteDto {
  @IsString() @IsNotEmpty()
  pin: string;
}

// TTE-02: confirm email using token
export class VerifikasiEmailDto {
  @IsString() @IsNotEmpty()
  token: string;
}

// Signing BA (Biro or Koordinator) — TTE-05/06
export class TandaTanganiBaDto {
  @IsString() @IsNotEmpty()
  pin: string;

  @IsString() @IsNotEmpty()
  nomorDokumen: string;

  @IsString() @IsNotEmpty()
  judulDokumen: string;
}

// Signing individual DetailSOP (Kepala OPD) — TTE-07
export class TandaTanganiSopDto {
  @IsString() @IsNotEmpty()
  pin: string;

  @IsString() @IsNotEmpty()
  nomorDokumen: string;

  @IsString() @IsNotEmpty()
  judulDokumen: string;
}

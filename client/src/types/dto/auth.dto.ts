import type { PeranPengguna } from "@/types/dto/access.dto";

export interface LoginRequest {
  email: string;
  kataSandi: string;
}

/** Bungkus respons API standar server */
export interface ApiSuccessResponse<T> {
  message: string;
  success: boolean;
  data: T;
}

/** Payload `data` dari POST /auth/login (mirror server PublicPengguna) */
export interface PublicPenggunaLoginData {
  penggunaId: string;
  email: string;
  nama: string;
  peran: PeranPengguna;
  opdId: string;
  nip: string;
  jabatan: string;
  pangkat: string;
  nohp: string;
}

export type LoginApiResponse = ApiSuccessResponse<PublicPenggunaLoginData>;

export interface LoginRequestDto {
  email: string;
  kataSandi: string;
}

export interface ChangePasswordDto {
  kataSandiLama: string;
  kataSandiBaru: string;
}

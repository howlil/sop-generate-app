/**
 * Satu tempat untuk kontrak auth modul ini: tipe respons/JWT + nama/opsi cookie.
 * Menghindari banyak file kecil (`*-types`, `*-cookies`) agar folder `auth/` tetap mudah dibaca.
 */
import type { CookieOptions } from 'express';
import type { PeranPengguna } from '../../../../generated/prisma';

export const ACCESS_TOKEN_COOKIE_NAME = 'access_token';

export function buildAccessTokenCookieOptions(
  maxAgeMs: number,
  isProduction: boolean,
): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/',
  };
}

export type PublicPengguna = {
  readonly penggunaId: string;
  readonly email: string;
  readonly nama: string;
  readonly peran: PeranPengguna;
  readonly nip: string;
  readonly jabatan: string;
  readonly pangkat: string;
  readonly nohp: string;
};

export type JwtAccessPayload = {
  readonly sub: string;
  readonly email: string;
  readonly peran: PeranPengguna;
};

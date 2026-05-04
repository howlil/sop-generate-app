/**
 * Satu tempat untuk kontrak auth modul ini: tipe respons/JWT + nama/opsi cookie.
 * Menghindari banyak file kecil (`*-types`, `*-cookies`) agar folder `auth/` tetap mudah dibaca.
 */
import type { CookieOptions } from 'express';
import ms from 'ms';
import type { StringValue } from 'ms';
import type { PeranPengguna } from '../../../../generated/prisma';
import type { JwtAccessPayload } from '../../../../common/types/jwt-access-payload.type';

const DEFAULT_TIMESPAN = '15m' as const satisfies StringValue;
/** Cadangan jika `ms('15m')` gagal (tidak terduga). */
const FALLBACK_MAX_AGE_MS = 15 * 60 * 1000;

function durationMsFromString(timespan: string): number | null {
  try {
    const n = ms(timespan as StringValue);
    if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) {
      return null;
    }
    return n;
  } catch {
    return null;
  }
}

/**
 * Menghitung durasi token akses: `jsonwebtoken` menerima string timespan, tetapi parsing bisa gagal
 * bila nilai env aneh; memberi **expiresIn berupa detik (integer)** menghindari cabang string di library.
 */
export function resolveAccessTokenExpiry(raw: unknown): {
  expiresInSeconds: number;
  maxAgeMs: number;
} {
  let maxAgeMs: number | null = null;
  if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) {
    maxAgeMs = raw * 1000;
  } else {
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    const candidate = trimmed === '' ? DEFAULT_TIMESPAN : trimmed;
    maxAgeMs = durationMsFromString(candidate);
    if (maxAgeMs === null) {
      maxAgeMs = durationMsFromString(DEFAULT_TIMESPAN);
    }
    if (maxAgeMs === null) {
      maxAgeMs = FALLBACK_MAX_AGE_MS;
    }
  }
  const expiresInSeconds = Math.max(1, Math.floor(maxAgeMs / 1000));
  return { expiresInSeconds, maxAgeMs };
}

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

/** Opsi `res.clearCookie` yang selaras dengan `buildAccessTokenCookieOptions` (tanpa `maxAge`). */
export function buildClearAccessTokenCookieOptions(isProduction: boolean): Pick<
  CookieOptions,
  'path' | 'httpOnly' | 'sameSite' | 'secure'
> {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };
}

export type PublicPengguna = {
  readonly penggunaId: string;
  readonly email: string;
  readonly nama: string;
  readonly peran: PeranPengguna;
  readonly opdId: string;
  readonly nip: string;
  readonly jabatan: string;
  readonly pangkat: string;
  readonly nohp: string;
};

export type { JwtAccessPayload };
